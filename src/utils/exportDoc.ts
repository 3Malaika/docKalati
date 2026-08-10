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
type BadgeColor = 'red' | 'green' | 'blue' | 'yellow' | 'gray'
type Block =
  | { type: 'heading'; level: 1 | 2 | 3 | 4; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullet'; text: string }
  | { type: 'code'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][]; badges?: (string | BadgeColor)[][] }
  | { type: 'image'; src: string; alt: string; caption?: string; width: number; height: number }
  | { type: 'separator'; }
  | { type: 'card'; variant: 'info' | 'warning' | 'success' | 'error'; title?: string; content: string }
  | { type: 'steps'; steps: { n: number; title: string; content: string }[] }
  | { type: 'list'; items: string[] }

const clean = (s: string | null | undefined) =>
  (s ?? '').replace(/\s+/g, ' ').trim()

function loadImage(src: string): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      if (src.startsWith('data:')) {
        resolve({ dataUrl: src, width: img.naturalWidth, height: img.naturalHeight })
      } else {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          resolve({ dataUrl: canvas.toDataURL('image/png'), width: img.naturalWidth, height: img.naturalHeight })
        } else {
          resolve({ dataUrl: src, width: img.naturalWidth, height: img.naturalHeight })
        }
      }
    }
    
    img.onerror = () => reject(new Error(`Impossible de charger l'image: ${src}`))
    img.crossOrigin = 'anonymous'
    img.src = src
  })
}

async function extractBlocks(root: HTMLElement): Promise<Block[]> {
  const blocks: Block[] = []
  
  const walk = async (node: Element) => {
    for (const child of Array.from(node.children)) {
      const tag = child.tagName.toLowerCase()
      
      // Ignorer les éléments de présentation
      if (tag === 'button' || tag === 'svg' || tag === 'path' || tag === 'script' || tag === 'style') continue
      
      const classList = child.className || ''
      const id = child.id || ''
      if (classList.includes('fixed') || classList.includes('absolute') || classList.includes('hidden') || 
          id.includes('nav') || id.includes('menu') || classList.includes('sidebar')) {
        continue
      }
      
      if (/^h[1-4]$/.test(tag)) {
        const text = clean(Array.from(child.childNodes)
          .filter(n => n.nodeType === 3)
          .map(n => n.textContent)
          .join('') || child.textContent)
        if (text && text.length > 0) {
          blocks.push({ type: 'heading', level: +tag[1] as 1|2|3|4, text })
        }
      } else if (tag === 'p') {
        const text = clean(child.textContent)
        if (text && text.length > 0) blocks.push({ type: 'paragraph', text })
      } else if (tag === 'ul' || tag === 'ol') {
        for (const li of Array.from(child.querySelectorAll(':scope > li'))) {
          const text = clean(li.textContent)
          if (text && text.length > 0) blocks.push({ type: 'bullet', text })
        }
      } else if (tag === 'pre') {
        const text = (child.textContent ?? '').replace(/\s+$/, '')
        if (text.trim() && text.trim().length > 0) blocks.push({ type: 'code', text })
      } else if (tag === 'table') {
        const headers = Array.from(child.querySelectorAll('thead th')).map(th => clean(th.textContent))
        const rows = Array.from(child.querySelectorAll('tbody tr')).map(tr =>
          Array.from(tr.querySelectorAll('td')).map(td => clean(td.textContent))
        )
        if (headers.length || rows.length) blocks.push({ type: 'table', headers, rows })
      } else if (tag === 'figure' || tag === 'img') {
        const img = tag === 'figure' ? child.querySelector('img') : (child as HTMLImageElement)
        if (img) {
          const src = img.getAttribute('src') || ''
          const alt = img.getAttribute('alt') || ''
          const figcap = child.querySelector('figcaption')?.textContent
          // Ignorer les images SVG/vecteur
          if (src && !src.includes('.svg')) {
            try {
              const { dataUrl, width, height } = await loadImage(src)
              blocks.push({ type: 'image', src: dataUrl, alt, caption: figcap, width, height })
            } catch (err) {
              console.error('Erreur chargement image:', err)
            }
          }
        }
      } else if (tag === 'hr' || classList.includes('border') || classList.includes('h-px')) {
        blocks.push({ type: 'separator' })
      } else {
        await walk(child)
      }
    }
  }
  
  await walk(root)
  return blocks
}

// ── Textes stage ───────────────────────────────────────────────────────────────
const REC_TITLE = 'Demande de Stage — 6 mois à partir de mars'
const REC_INTRO =
  "KALATI RAG a été développée en tant que participation au concours informatique lancé par CAMRAIL. " +
  "Ce projet m'a permis de mettre en pratique mes connaissances en architecture logicielle, développement " +
  "full-stack et gestion de données complexes. Afin de valider ma 5ème année de cycle ingénieur, " +
  "une période de stage de 6 mois est requise dans mon cursus académique."
const REC_BODY =
  "Je souhaite respectueusement proposer de réaliser ce stage obligatoire au sein de CAMRAIL à partir de mars. " +
  "Cette expérience pratique au sein de votre organisation me permettrait de consolider les compétences " +
  "développées lors de ce concours et d'apprendre les meilleures pratiques en environnement professionnel. " +
  "Je serais enthousiaste de contribuer aux projets de CAMRAIL tout en poursuivant mon apprentissage ingénieur."
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
// PDF — Reproduction fidèle du design HTML
// ═══════════════════════════════════════════════════════════════════════════════
export async function exportPDF(root: HTMLElement, title: string) {
  const blocks = await extractBlocks(root)
  const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true })

  const MX = 40, MT = 60, MB = 50
  const PW = doc.internal.pageSize.getWidth()
  const PH = doc.internal.pageSize.getHeight()
  const CW = PW - MX * 2
  let y = MT

  // Helpers
  const np = () => { doc.addPage(); y = MT }
  const fit = (n: number) => { if (y + n > PH - MB) np() }

  // Écriture de texte
  const write = (
    text: string,
    size: number,
    bold = false,
    color: RGB = R.body,
    indent = 0,
    gap = 6,
  ) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(size)
    doc.setTextColor(color[0], color[1], color[2])
    const lh = size * 1.45
    const lines: string[] = doc.splitTextToSize(text, CW - indent)
    for (const ln of lines) { fit(lh); doc.text(ln, MX + indent, y); y += lh }
    y += gap
  }

  // Bandeau titre
  doc.setFillColor(R.brand[0], R.brand[1], R.brand[2])
  doc.rect(0, 0, PW, 88, 'F')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(24); doc.setTextColor(255, 255, 255)
  doc.text(title, MX, 50)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(255, 200, 195)
  doc.text('KALATI RAG — Documentation technique · CAMRAIL', MX, 70)
  y = 108

  // Boucle principale
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]
    
    switch (b.type) {
      case 'heading': {
        if (b.level === 1) {
          y += 12; fit(40)
          doc.setFillColor(R.surface[0], R.surface[1], R.surface[2])
          doc.rect(MX, y - 12, CW, 28, 'F')
          doc.setFillColor(R.brand[0], R.brand[1], R.brand[2])
          doc.rect(MX, y - 12, 4, 28, 'F')
          doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(R.brand[0], R.brand[1], R.brand[2])
          doc.text(b.text, MX + 10, y + 5)
          y += 20
        } else if (b.level === 2) {
          y += 8; fit(22)
          doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(R.navy[0], R.navy[1], R.navy[2])
          doc.text(b.text, MX, y)
          y += 12
          doc.setDrawColor(R.border[0], R.border[1], R.border[2])
          doc.setLineWidth(0.4); doc.line(MX, y, MX + CW, y); y += 6
        } else if (b.level === 3) {
          y += 4; fit(16)
          doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(R.navy[0], R.navy[1], R.navy[2])
          doc.text(b.text, MX, y)
          y += 10
        } else {
          y += 2; fit(12)
          doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(R.gray[0], R.gray[1], R.gray[2])
          doc.text(b.text, MX, y)
          y += 8
        }
        break
      }

      case 'paragraph': {
        write(b.text, 10, false, R.body, 0, 8)
        break
      }

      case 'bullet': {
        fit(16)
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(R.body[0], R.body[1], R.body[2])
        const lines: string[] = doc.splitTextToSize(b.text, CW - 10)
        let isFirst = true
        for (const ln of lines) {
          if (isFirst) {
            doc.text('• ' + ln, MX + 5, y)
            isFirst = false
          } else {
            doc.text(ln, MX + 10, y)
          }
          y += 10
        }
        y += 2
        break
      }

      case 'code': {
        y += 4
        const cLines = b.text.split('\n')
        const cLH = 8
        doc.setFont('courier', 'normal'); doc.setFontSize(8); doc.setTextColor(R.body[0], R.body[1], R.body[2])
        for (const ln of cLines) {
          fit(cLH)
          doc.text(ln, MX + 5, y)
          y += cLH
        }
        y += 6
        break
      }

      case 'table': {
        y += 4
        const colCount = b.headers.length || b.rows[0]?.length || 1
        const colW = CW / colCount
        const FSIZE = 8, PADX = 3, PADY = 3, LH = FSIZE * 1.2
        
        const measureH = (text: string): number => {
          doc.setFontSize(FSIZE)
          const lines = doc.splitTextToSize(text, colW - PADX * 2)
          return lines.length * LH + PADY * 2
        }
        
        // Entête
        if (b.headers.length) {
          const rh = Math.max(...b.headers.map(measureH), LH + PADY * 2)
          fit(rh)
          for (let ci = 0; ci < colCount; ci++) {
            const cx = MX + ci * colW
            doc.setFillColor(R.border[0], R.border[1], R.border[2])
            doc.rect(cx, y, colW, rh, 'F')
            doc.setFont('helvetica', 'bold'); doc.setFontSize(FSIZE); doc.setTextColor(R.body[0], R.body[1], R.body[2])
            const lines = doc.splitTextToSize(b.headers[ci] || '', colW - PADX * 2)
            let ty = y + PADY + FSIZE * 0.8
            for (const ln of lines) {
              doc.text(ln, cx + PADX, ty)
              ty += LH
            }
            doc.setDrawColor(R.border[0], R.border[1], R.border[2])
            doc.setLineWidth(0.2); doc.rect(cx, y, colW, rh, 'S')
          }
          y += rh
        }
        
        // Corps
        b.rows.forEach((row, ri) => {
          const rh = Math.max(...row.map(measureH), LH + PADY * 2)
          fit(rh)
          for (let ci = 0; ci < colCount; ci++) {
            const cx = MX + ci * colW
            if (ri % 2 === 1) {
              doc.setFillColor(R.stripe[0], R.stripe[1], R.stripe[2])
              doc.rect(cx, y, colW, rh, 'F')
            }
            doc.setFont('helvetica', 'normal'); doc.setFontSize(FSIZE); doc.setTextColor(R.body[0], R.body[1], R.body[2])
            const lines = doc.splitTextToSize(row[ci] || '', colW - PADX * 2)
            let ty = y + PADY + FSIZE * 0.8
            for (const ln of lines) {
              doc.text(ln, cx + PADX, ty)
              ty += LH
            }
            doc.setDrawColor(R.border[0], R.border[1], R.border[2])
            doc.setLineWidth(0.2); doc.rect(cx, y, colW, rh, 'S')
          }
          y += rh
        })
        y += 6
        break
      }

      case 'image': {
        y += 6
        const ratio = b.height / b.width
        let imgW = CW * 0.7
        if (Math.abs(ratio - 1) < 0.15) imgW = CW * 0.5
        else if (ratio > 1.3) imgW = CW * 0.4
        else if (ratio < 0.7) imgW = CW * 0.85
        
        const imgH = imgW * ratio
        fit(imgH + 15)
        const xPos = MX + (CW - imgW) / 2
        
        try {
          doc.addImage(b.src, 'PNG', xPos, y, imgW, imgH)
          y += imgH + 6
          if (b.caption) {
            doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(R.gray[0], R.gray[1], R.gray[2])
            const lines = doc.splitTextToSize(b.caption, imgW)
            for (const ln of lines) {
              doc.text(ln, xPos, y)
              y += 10
            }
          }
        } catch (e) {
          write(`[Image: ${b.alt}]`, 9, false, R.gray, 0, 6)
        }
        y += 4
        break
      }

      case 'separator': {
        y += 4
        fit(8)
        doc.setDrawColor(R.border[0], R.border[1], R.border[2])
        doc.setLineWidth(0.3)
        doc.line(MX, y, MX + CW, y)
        y += 8
        break
      }
    }
  }

  // Section stage
  y += 12; fit(180)
  doc.setFillColor(R.navy[0], R.navy[1], R.navy[2])
  doc.rect(MX, y, CW, 26, 'F')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(255, 255, 255)
  doc.text(REC_TITLE, MX + 10, y + 16)
  y += 32

  write("Contexte et motivation", 10, true, R.navy, 0, 4)
  write(REC_INTRO, 9, false, R.body, 0, 8)
  
  write("Proposition de stage", 10, true, R.navy, 0, 4)
  write(REC_BODY, 9, false, R.body, 0, 10)

  write("Coordonnées de contact", 10, true, R.navy, 0, 4)
  for (const line of REC_CONTACTS) {
    write(line, 9, false, R.body, 10, 3)
  }

  // Pied de page
  const total = doc.getNumberOfPages()
  for (let p = 1; p <= total; p++) {
    doc.setPage(p)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(R.gray[0], R.gray[1], R.gray[2])
    doc.text(`KALATI RAG — ${title}  ·  Page ${p} / ${total}`, PW / 2, PH - 20, { align: 'center' })
    doc.setDrawColor(R.border[0], R.border[1], R.border[2])
    doc.setLineWidth(0.3); doc.line(MX, PH - 30, PW - MX, PH - 30)
  }

  doc.save(`${slug(title)}.pdf`)
}


// ═══════════════════════════════════════════════════════════════════════════════
// DOCX — Reproduction fidèle du HTML
// ═══════════════════════════════════════════════════════════════════════════════

const CELL_BORDERS = {
  top:    { style: BorderStyle.SINGLE, size: 4, color: H.border },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: H.border },
  left:   { style: BorderStyle.SINGLE, size: 4, color: H.border },
  right:  { style: BorderStyle.SINGLE, size: 4, color: H.border },
}

const BADGE_COLORS: Record<BadgeColor, string> = {
  red: 'E63329',
  green: '10B981',
  blue: '3B82F6',
  yellow: 'F59E0B',
  gray: '6B7A8D',
}

function docxBadge(text: string, color: BadgeColor): TextRun {
  return new TextRun({
    text: ` ${text} `,
    bold: true,
    size: 16,
    color: 'FFFFFF',
    shading: { type: ShadingType.SOLID, fill: BADGE_COLORS[color], color: BADGE_COLORS[color] },
  })
}

function docxCard(variant: 'info' | 'warning' | 'success' | 'error', title: string | undefined, content: string): Paragraph {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    info: { bg: 'DBEAFE', border: '3B82F6', text: '1F2937' },
    warning: { bg: 'FEF3C7', border: 'F59E0B', text: '1F2937' },
    success: { bg: 'D1FAE5', border: '10B981', text: '1F2937' },
    error: { bg: 'FEE2E2', border: 'EF4444', text: '1F2937' },
  }
  const cfg = colors[variant]
  
  return new Paragraph({
    children: [new TextRun({
      text: title ? `${title}: ${content}` : content,
      size: 20,
      color: cfg.text,
    })],
    shading: { type: ShadingType.SOLID, fill: cfg.bg, color: cfg.bg },
    border: { left: { style: BorderStyle.SINGLE, size: 24, color: cfg.border } },
    spacing: { before: 120, after: 120 },
    indent: { left: convertInchesToTwip(0.15), right: convertInchesToTwip(0.15) },
  })
}

export async function exportDOCX(root: HTMLElement, title: string) {
  const blocks = await extractBlocks(root)
  type Child = Paragraph | Table
  const ch: Child[] = []

  // En-tête
  ch.push(
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 52, color: H.brand, font: 'Calibri' })],
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'KALATI RAG — Documentation technique · CAMRAIL', size: 18, color: H.gray, font: 'Calibri' })],
      spacing: { after: 300 },
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
          spacing: { before: b.level === 1 ? 400 : b.level === 2 ? 280 : 180, after: 120 },
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
          spacing: { after: 80 },
        }))
        break

      case 'code':
        for (const ln of b.text.split('\n')) {
          ch.push(new Paragraph({
            children: [new TextRun({
              text: ln || ' ',
              font: 'Courier New',
              size: 16,
              color: H.body,
            })],
            spacing: { before: 0, after: 0 },
            indent: { left: convertInchesToTwip(0.2) },
          }))
        }
        ch.push(new Paragraph({ text: '', spacing: { after: 160 } }))
        break

      case 'table': {
        if (b.headers.length || b.rows.length) {
          ch.push(new Paragraph({ text: '', spacing: { before: 160, after: 60 } }))
          
          const cols = b.headers.length || b.rows[0]?.length || 1
          const pct = Math.floor(100 / cols)

          const cell = (txt: string, isHead: boolean, stripe: boolean, badgeColor?: BadgeColor) =>
            new TableCell({
              borders: CELL_BORDERS,
              shading: isHead
                ? { type: ShadingType.SOLID, fill: H.brand, color: H.brand }
                : stripe
                ? { type: ShadingType.SOLID, fill: H.stripe, color: H.stripe }
                : { type: ShadingType.CLEAR, fill: H.white, color: H.white },
              width: { size: pct, type: WidthType.PERCENTAGE },
              margins: { top: 80, bottom: 80, left: 100, right: 100 },
              children: [new Paragraph({
                children: badgeColor
                  ? [docxBadge(txt, badgeColor)]
                  : [new TextRun({
                      text: txt || ' ',
                      bold: isHead,
                      color: isHead ? H.white : H.body,
                      size: 18,
                      font: 'Calibri',
                    })],
              })],
            })

          const tRows: TableRow[] = []
          if (b.headers.length) {
            tRows.push(new TableRow({ tableHeader: true, children: b.headers.map(h => cell(h, true, false)) }))
          }
          b.rows.forEach((row, ri) => {
            tRows.push(new TableRow({
              children: Array.from({ length: cols }, (_, ci) => {
                const badgeColor = b.badges?.[ri]?.[ci] as BadgeColor | undefined
                return cell(row[ci] ?? '', false, ri % 2 === 1, badgeColor)
              }),
            }))
          })
          
          ch.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: tRows }))
          ch.push(new Paragraph({ text: '', spacing: { before: 80, after: 200 } }))
        }
        break
      }

      case 'image':
        ch.push(new Paragraph({
          children: [new TextRun({ text: `[Image: ${b.alt}]${b.caption ? ` — ${b.caption}` : ''}`, italic: true, size: 18, color: H.gray })],
          spacing: { before: 160, after: 160 },
          alignment: 'center' as any,
        }))
        break

      case 'separator':
        ch.push(new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: H.border } },
          spacing: { before: 120, after: 120 },
          text: '',
        }))
        break

      case 'card':
        ch.push(docxCard(b.variant, b.title, b.content))
        break

      case 'steps':
        for (const step of b.steps) {
          ch.push(new Paragraph({
            children: [
              new TextRun({
                text: `${step.n}. ${step.title}`,
                bold: true,
                size: 20,
                color: H.brand,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 80, after: 40 },
          }))
          ch.push(new Paragraph({
            children: [new TextRun({ text: step.content, size: 18, color: H.body, font: 'Calibri' })],
            spacing: { after: 80 },
          }))
        }
        break

      case 'list':
        for (const item of b.items) {
          ch.push(new Paragraph({
            children: [new TextRun({ text: item, size: 20, font: 'Calibri', color: H.body })],
            bullet: { level: 0 },
            spacing: { after: 60 },
          }))
        }
        break
    }
  }

  // Section stage
  ch.push(
    new Paragraph({ text: '', spacing: { before: 600, after: 0 } }),
    new Paragraph({
      children: [new TextRun({ text: REC_TITLE, bold: true, size: 28, color: H.navy, font: 'Calibri' })],
      spacing: { before: 200, after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: H.brand } },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Contexte et motivation', bold: true, size: 22, color: H.navy, font: 'Calibri' })],
      spacing: { before: 120, after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: REC_INTRO, size: 20, font: 'Calibri', color: H.body })],
      spacing: { after: 160 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Proposition de stage', bold: true, size: 22, color: H.navy, font: 'Calibri' })],
      spacing: { before: 120, after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: REC_BODY, size: 20, font: 'Calibri', color: H.body })],
      spacing: { after: 160 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Coordonnées de contact', bold: true, size: 22, color: H.navy, font: 'Calibri' })],
      spacing: { before: 120, after: 120 },
    }),
  )

  for (const ln of REC_CONTACTS) {
    ch.push(new Paragraph({
      children: [new TextRun({ text: ln, size: 20, font: 'Calibri', color: H.body })],
      bullet: { level: 0 },
      spacing: { after: 60 },
    }))
  }

  // Document final
  const document = new Document({
    styles: {
      default: { document: { run: { font: 'Calibri', size: 20, color: H.body } } },
      paragraphStyles: [
        {
          id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal',
          run: { bold: true, size: 32, color: H.brand, font: 'Calibri' },
          paragraph: { spacing: { before: 400, after: 140 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: H.brand } } },
        },
        {
          id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal',
          run: { bold: true, size: 26, color: H.navy, font: 'Calibri' },
          paragraph: { spacing: { before: 280, after: 80 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: H.border } } },
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
      properties: { page: { margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1), right: convertInchesToTwip(1) } } },
      children: ch,
    }],
  })

  const blob = await Packer.toBlob(document)
  triggerDownload(blob, `${slug(title)}.docx`)
}
