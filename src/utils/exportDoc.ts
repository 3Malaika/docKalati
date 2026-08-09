import { jsPDF } from 'jspdf'
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  ShadingType, convertInchesToTwip,
} from 'docx'

// ── Palette (identique à index.css) ──────────────────────────────────────────
type RGB = [number, number, number]
const R: Record<string, RGB> = {
  brand:   [230,  51,  41],
  ink:     [ 15,  25,  35],
  navy:    [ 26,  46,  74],
  gray:    [107, 122, 141],
  body:    [ 55,  65,  81],
  border:  [209, 217, 224],
  surface: [244, 246, 249],
  stripe:  [248, 250, 252],
  white:   [255, 255, 255],
  codebg:  [ 13,  17,  23],
  codefg:  [230, 237, 243],
}
const H: Record<string, string> = {
  brand: 'E63329', ink: '0F1923', navy: '1A2E4A',
  gray: '6B7A8D', body: '374151', border: 'D1D9E0',
  surface: 'F4F6F9', stripe: 'F8FAFC', white: 'FFFFFF', black: '0D1117',
}

// ── Modèle de blocs ───────────────────────────────────────────────────────────
type Block =
  | { type: 'heading'; level: 1 | 2 | 3 | 4; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullet'; text: string }
  | { type: 'code'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] }

const clean = (s: string | null | undefined) =>
  (s ?? '').replace(/\s+/g, ' ').trim()

function extractBlocks(root: HTMLElement): Block[] {
  const blocks: Block[] = []
  const walk = (node: Element) => {
    for (const child of Array.from(node.children)) {
      const tag = child.tagName.toLowerCase()
      if (tag === 'button' || tag === 'svg' || tag === 'path') continue
      if (/^h[1-4]$/.test(tag)) {
        const text = clean(child.textContent)
        if (text) blocks.push({ type: 'heading', level: +tag[1] as 1|2|3|4, text })
      } else if (tag === 'p') {
        const text = clean(child.textContent)
        if (text) blocks.push({ type: 'paragraph', text })
      } else if (tag === 'ul' || tag === 'ol') {
        for (const li of Array.from(child.querySelectorAll(':scope > li'))) {
          const text = clean(li.textContent)
          if (text) blocks.push({ type: 'bullet', text })
        }
      } else if (tag === 'pre') {
        const text = (child.textContent ?? '').replace(/\s+$/, '')
        if (text.trim()) blocks.push({ type: 'code', text })
      } else if (tag === 'table') {
        const headers = Array.from(child.querySelectorAll('thead th')).map(th => clean(th.textContent))
        const rows = Array.from(child.querySelectorAll('tbody tr')).map(tr =>
          Array.from(tr.querySelectorAll('td')).map(td => clean(td.textContent))
        )
        if (headers.length || rows.length) blocks.push({ type: 'table', headers, rows })
      } else {
        walk(child)
      }
    }
  }
  walk(root)
  return blocks
}

// ── Textes recommandation de stage ───────────────────────────────────────────
const REC_TITLE = 'Recommandation — Implémentation du mode local'
const REC_INTRO =
  "KALATI RAG est pleinement fonctionnel en mode cloud (démonstration). La prochaine " +
  "étape critique pour la mise en production réelle chez CAMRAIL est le déploiement " +
  "entièrement local : remplacement de Groq par Ollama, intégration de Whisper offline " +
  "pour la transcription vocale, et Piper TTS pour la synthèse audio — garantissant " +
  "qu'aucune donnée CAMRAIL ne transite hors de l'infrastructure interne."
const REC_BODY =
  "Il est vivement recommandé de confier cette phase à Babouma Malaika, étudiante en " +
  "5ème année Cycle Ingénieur — Management des Systèmes d'Information à Saint Jean " +
  "Ingénieur, conceptrice et développeuse de l'intégralité de ce système. Elle maîtrise " +
  "l'architecture complète, le contexte métier CAMRAIL, et les outils requis " +
  "(FastAPI, Ollama, Whisper, Piper TTS, ChromaDB, Next.js)."
const REC_CONTACTS = [
  "Téléphone : 696 784 809",
  "Email     : babouma.suzanne@saintjeaningenieur.org",
  "Ecole     : Saint Jean Ingénieur — Management des Systèmes d'Information",
]

// ── Utilitaires ───────────────────────────────────────────────────────────────
const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url ; a.download = filename
  document.body.appendChild(a) ; a.click() ; a.remove()
  URL.revokeObjectURL(url)
}

const slug = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
   .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '')

// ═══════════════════════════════════════════════════════════════════════════════
// PDF — jsPDF avec tableaux manuels (sans dépendance autoTable)
// ═══════════════════════════════════════════════════════════════════════════════
export function exportPDF(root: HTMLElement, title: string) {
  const blocks = extractBlocks(root)
  const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true })

  const MX = 50, MT = 60, MB = 50
  const PW = doc.internal.pageSize.getWidth()
  const PH = doc.internal.pageSize.getHeight()
  const CW = PW - MX * 2
  let y = MT

  // Helpers ──────────────────────────────────────────────────────────────────
  const np = () => { doc.addPage(); y = MT }
  const fit = (n: number) => { if (y + n > PH - MB) np() }

  /** Écriture de texte — toujours helvetica sauf si mono=true */
  const write = (
    text: string,
    size: number,
    bold = false,
    color: RGB = R.body,
    indent = 0,
    gap = 6,
    mono = false,
  ) => {
    doc.setFont(mono ? 'courier' : 'helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(size)
    doc.setTextColor(color[0], color[1], color[2])
    const lh = size * 1.45
    const lines: string[] = doc.splitTextToSize(text, CW - indent)
    for (const ln of lines) { fit(lh); doc.text(ln, MX + indent, y); y += lh }
    y += gap
  }

  // ── Bandeau titre ──────────────────────────────────────────────────────────
  doc.setFillColor(R.brand[0], R.brand[1], R.brand[2])
  doc.rect(0, 0, PW, 88, 'F')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor(255, 255, 255)
  doc.text(title, MX, 50)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(255, 200, 195)
  doc.text('KALATI RAG — Documentation technique · CAMRAIL', MX, 70)
  y = 108

  // ── Fonction tableau manuel ────────────────────────────────────────────────
  const drawTable = (headers: string[], rows: string[][]) => {
    if (!headers.length && !rows.length) return
    const allCols = headers.length || rows[0]?.length || 1

    // Mesure largeurs de colonnes (distribution proportionnelle)
    const colW = CW / allCols
    const PADX = 6, PADY = 5
    const FSIZE = 9, LH = FSIZE * 1.35

    const measureRowH = (cells: string[], bold: boolean): number => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal')
      doc.setFontSize(FSIZE)
      let maxLines = 1
      for (const cell of cells) {
        const n = (doc.splitTextToSize(cell || ' ', colW - PADX * 2) as string[]).length
        if (n > maxLines) maxLines = n
      }
      return maxLines * LH + PADY * 2
    }

    const drawRow = (cells: string[], isHeader: boolean, stripe: boolean, ty: number) => {
      const rh = measureRowH(cells, isHeader)
      // Fond de ligne
      if (isHeader) {
        doc.setFillColor(R.brand[0], R.brand[1], R.brand[2])
      } else if (stripe) {
        doc.setFillColor(R.stripe[0], R.stripe[1], R.stripe[2])
      } else {
        doc.setFillColor(255, 255, 255)
      }
      doc.rect(MX, ty, CW, rh, 'F')

      // Contenu + bordures cellules
      for (let ci = 0; ci < allCols; ci++) {
        const cx = MX + ci * colW
        const cellTxt = cells[ci] ?? ''
        // Bordure
        doc.setDrawColor(R.border[0], R.border[1], R.border[2])
        doc.setLineWidth(0.4)
        doc.rect(cx, ty, colW, rh, 'S')
        // Texte
        doc.setFont('helvetica', isHeader ? 'bold' : 'normal')
        doc.setFontSize(FSIZE)
        doc.setTextColor(
          isHeader ? 255 : R.body[0],
          isHeader ? 255 : R.body[1],
          isHeader ? 255 : R.body[2],
        )
        const lines: string[] = doc.splitTextToSize(cellTxt || ' ', colW - PADX * 2)
        let ty2 = ty + PADY + FSIZE * 0.9
        for (const ln of lines) {
          doc.text(ln, cx + PADX, ty2)
          ty2 += LH
        }
      }
      return rh
    }

    y += 8
    // Entête
    if (headers.length) {
      const rh = measureRowH(headers, true)
      fit(rh)
      drawRow(headers, true, false, y)
      y += rh
    }
    // Corps
    rows.forEach((row, ri) => {
      const rh = measureRowH(row, false)
      fit(rh)
      drawRow(row, false, ri % 2 === 1, y)
      y += rh
    })
    y += 10
    // Remettre la police en état normal après le tableau
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(R.body[0], R.body[1], R.body[2])
  }

  // ── Boucle principale sur les blocs ───────────────────────────────────────
  for (const b of blocks) {
    switch (b.type) {

      case 'heading': {
        if (b.level === 1) {
          y += 16; fit(36)
          doc.setFillColor(R.surface[0], R.surface[1], R.surface[2])
          doc.rect(MX, y - 16, CW, 30, 'F')
          doc.setFillColor(R.brand[0], R.brand[1], R.brand[2])
          doc.rect(MX, y - 16, 4, 30, 'F')
          write(b.text, 14, true, R.brand, 12, 10)
        } else if (b.level === 2) {
          y += 10; fit(24)
          write(b.text, 12, true, R.navy, 0, 3)
          doc.setDrawColor(R.border[0], R.border[1], R.border[2])
          doc.setLineWidth(0.5); doc.line(MX, y, MX + CW, y); y += 6
        } else if (b.level === 3) {
          y += 6; fit(18)
          write(b.text, 11, true, R.navy, 0, 4)
        } else {
          y += 3; fit(14)
          write(b.text, 10, true, R.gray, 0, 3)
        }
        break
      }

      case 'paragraph':
        write(b.text, 10, false, R.body, 0, 8)
        break

      case 'bullet': {
        fit(18)
        doc.setFillColor(R.brand[0], R.brand[1], R.brand[2])
        doc.circle(MX + 5, y - 3, 2.2, 'F')
        write(b.text, 10, false, R.body, 14, 3)
        break
      }

      case 'code': {
        y += 4
        const cLines = b.text.split('\n')
        const cLH = 8.5 * 1.4
        const bH = cLines.length * cLH + 18
        fit(Math.min(bH, PH - MB - MT))
        doc.setFillColor(R.codebg[0], R.codebg[1], R.codebg[2])
        doc.roundedRect(MX, y, CW, bH, 3, 3, 'F')
        doc.setFont('courier', 'normal'); doc.setFontSize(8)
        doc.setTextColor(R.codefg[0], R.codefg[1], R.codefg[2])
        let cy = y + 13
        for (const ln of cLines) {
          if (cy + cLH > PH - MB) { np(); cy = MT }
          doc.text(ln, MX + 10, cy); cy += cLH
        }
        y = cy + 6
        // Remettre la police normale obligatoirement
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(R.body[0], R.body[1], R.body[2])
        break
      }

      case 'table':
        drawTable(b.headers, b.rows)
        break
    }
  }

  // ── Section recommandation de stage ───────────────────────────────────────
  y += 24; fit(200)
  doc.setFillColor(R.navy[0], R.navy[1], R.navy[2])
  doc.rect(MX, y, CW, 30, 'F')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(255, 255, 255)
  doc.text(REC_TITLE, MX + 10, y + 20)
  y += 38

  write(REC_INTRO, 10, false, R.body, 0, 8)
  write(REC_BODY,  10, true,  R.ink,  0, 10)

  for (const line of REC_CONTACTS) {
    fit(18)
    doc.setFillColor(R.brand[0], R.brand[1], R.brand[2])
    doc.circle(MX + 5, y - 3, 2.2, 'F')
    write(line, 10, false, R.body, 14, 4)
  }

  // ── Pied de page numéroté ─────────────────────────────────────────────────
  const total = doc.getNumberOfPages()
  for (let p = 1; p <= total; p++) {
    doc.setPage(p)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8)
    doc.setTextColor(R.gray[0], R.gray[1], R.gray[2])
    doc.text(`KALATI RAG — ${title}  ·  Page ${p} / ${total}`, PW / 2, PH - 20, { align: 'center' })
    doc.setDrawColor(R.border[0], R.border[1], R.border[2])
    doc.setLineWidth(0.4); doc.line(MX, PH - 30, PW - MX, PH - 30)
  }

  doc.save(`${slug(title)}.pdf`)
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOCX — docx.js avec vrais tableaux
// ═══════════════════════════════════════════════════════════════════════════════

const CELL_BORDERS = {
  top:    { style: BorderStyle.SINGLE, size: 4, color: H.border },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: H.border },
  left:   { style: BorderStyle.SINGLE, size: 4, color: H.border },
  right:  { style: BorderStyle.SINGLE, size: 4, color: H.border },
}

function docxTable(headers: string[], rows: string[][]): Table {
  const cols = headers.length || rows[0]?.length || 1
  const pct  = Math.floor(100 / cols)

  const cell = (txt: string, isHead: boolean, stripe: boolean) =>
    new TableCell({
      borders: CELL_BORDERS,
      shading: isHead
        ? { type: ShadingType.SOLID, fill: H.brand,  color: H.brand  }
        : stripe
        ? { type: ShadingType.SOLID, fill: H.stripe, color: H.stripe }
        : { type: ShadingType.CLEAR, fill: H.white,  color: H.white  },
      width: { size: pct, type: WidthType.PERCENTAGE },
      margins: { top: 80, bottom: 80, left: 100, right: 100 },
      children: [new Paragraph({
        children: [new TextRun({
          text: txt || ' ',
          bold: isHead,
          color: isHead ? H.white : H.body,
          size: 18,
          font: 'Calibri',
        })],
      })],
    })

  const tRows: TableRow[] = []
  if (headers.length) {
    tRows.push(new TableRow({ tableHeader: true, children: headers.map(h => cell(h, true, false)) }))
  }
  rows.forEach((row, ri) =>
    tRows.push(new TableRow({
      children: Array.from({ length: cols }, (_, ci) => cell(row[ci] ?? '', false, ri % 2 === 1)),
    }))
  )
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: tRows })
}

export async function exportDOCX(root: HTMLElement, title: string) {
  const blocks = extractBlocks(root)
  type Child = Paragraph | Table
  const ch: Child[] = []

  // ── En-tête ───────────────────────────────────────────────────────────────
  ch.push(
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 52, color: H.brand, font: 'Calibri' })],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'KALATI RAG — Documentation technique · CAMRAIL', size: 20, color: H.gray, font: 'Calibri' })],
      spacing: { after: 400 },
    }),
  )

  const HLVL = {
    1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3, 4: HeadingLevel.HEADING_4,
  } as const

  for (const b of blocks) {
    switch (b.type) {
      case 'heading':
        ch.push(new Paragraph({
          heading: HLVL[b.level],
          children: [new TextRun({ text: b.text, font: 'Calibri' })],
          spacing: { before: b.level === 1 ? 400 : b.level === 2 ? 280 : 180, after: 80 },
        }))
        break
      case 'paragraph':
        ch.push(new Paragraph({
          children: [new TextRun({ text: b.text, size: 20, font: 'Calibri', color: H.body })],
          spacing: { after: 120 },
        }))
        break
      case 'bullet':
        ch.push(new Paragraph({
          children: [new TextRun({ text: b.text, size: 20, font: 'Calibri', color: H.body })],
          bullet: { level: 0 },
          spacing: { after: 60 },
        }))
        break
      case 'code':
        for (const ln of b.text.split('\n')) {
          ch.push(new Paragraph({
            children: [new TextRun({
              text: ln || ' ', font: 'Courier New', size: 16, color: 'E6EDF3',
              shading: { type: ShadingType.SOLID, fill: H.black, color: H.black },
            })],
            spacing: { before: 0, after: 0 },
            indent: { left: convertInchesToTwip(0.2) },
          }))
        }
        ch.push(new Paragraph({ text: '', spacing: { after: 160 } }))
        break
      case 'table':
        if (b.headers.length || b.rows.length) {
          ch.push(new Paragraph({ text: '', spacing: { before: 180, after: 60 } }))
          ch.push(docxTable(b.headers, b.rows))
          ch.push(new Paragraph({ text: '', spacing: { before: 60, after: 200 } }))
        }
        break
    }
  }

  // ── Section recommandation de stage ───────────────────────────────────────
  ch.push(
    new Paragraph({ text: '', spacing: { before: 700, after: 0 } }),
    new Paragraph({
      children: [new TextRun({ text: REC_TITLE, bold: true, size: 28, color: H.navy, font: 'Calibri' })],
      spacing: { before: 200, after: 140 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: H.brand } },
    }),
    new Paragraph({
      children: [new TextRun({ text: REC_INTRO, size: 20, font: 'Calibri', color: H.body })],
      spacing: { after: 140 },
    }),
    new Paragraph({
      children: [new TextRun({ text: REC_BODY, bold: true, size: 20, font: 'Calibri', color: H.ink })],
      spacing: { after: 140 },
    }),
  )
  for (const ln of REC_CONTACTS) {
    ch.push(new Paragraph({
      children: [new TextRun({ text: ln, size: 20, font: 'Calibri', color: H.body })],
      bullet: { level: 0 },
      spacing: { after: 60 },
    }))
  }

  // ── Document final ────────────────────────────────────────────────────────
  const document = new Document({
    styles: {
      default: { document: { run: { font: 'Calibri', size: 20, color: H.body } } },
      paragraphStyles: [
        {
          id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal',
          run: { bold: true, size: 32, color: H.brand, font: 'Calibri' },
          paragraph: { spacing: { before: 400, after: 140 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: H.brand } } },
        },
        {
          id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal',
          run: { bold: true, size: 26, color: H.navy, font: 'Calibri' },
          paragraph: { spacing: { before: 280, after: 80 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: H.border } } },
        },
        {
          id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal',
          run: { bold: true, size: 22, color: H.navy, font: 'Calibri' },
          paragraph: { spacing: { before: 180, after: 60 } },
        },
        {
          id: 'Heading4', name: 'Heading 4', basedOn: 'Normal', next: 'Normal',
          run: { bold: true, size: 20, color: H.gray, font: 'Calibri' },
          paragraph: { spacing: { before: 120, after: 40 } },
        },
      ],
    },
    sections: [{
      properties: { page: { margin: {
        top:    convertInchesToTwip(1),   bottom: convertInchesToTwip(1),
        left:   convertInchesToTwip(1.1), right:  convertInchesToTwip(1.1),
      }}},
      children: ch,
    }],
  })

  const blob = await Packer.toBlob(document)
  triggerDownload(blob, `${slug(title)}.docx`)
}
