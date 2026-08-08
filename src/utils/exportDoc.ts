import { jsPDF } from 'jspdf'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
} from 'docx'

// ─── Structured content model ───────────────────────────────────────────────
type Block =
  | { type: 'heading'; level: 1 | 2 | 3 | 4; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullet'; text: string }
  | { type: 'code'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] }

const clean = (s: string | null | undefined) =>
  (s ?? '').replace(/\s+/g, ' ').trim()

/** Recursively walk the DOM, emitting text-bearing content blocks in order. */
function extractBlocks(root: HTMLElement): Block[] {
  const blocks: Block[] = []

  const walk = (node: Element) => {
    for (const child of Array.from(node.children)) {
      const tag = child.tagName.toLowerCase()

      // Skip interactive chrome (tab switchers, copy buttons, etc.)
      if (tag === 'button') continue

      if (/^h[1-4]$/.test(tag)) {
        const text = clean(child.textContent)
        if (text) {
          blocks.push({
            type: 'heading',
            level: Number(tag[1]) as 1 | 2 | 3 | 4,
            text,
          })
        }
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
        const headers = Array.from(child.querySelectorAll('thead th')).map(th =>
          clean(th.textContent),
        )
        const rows = Array.from(child.querySelectorAll('tbody tr')).map(tr =>
          Array.from(tr.querySelectorAll('td')).map(td => clean(td.textContent)),
        )
        if (headers.length || rows.length) {
          blocks.push({ type: 'table', headers, rows })
        }
      } else {
        walk(child)
      }
    }
  }

  walk(root)
  return blocks
}

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// ─── Brand colour (matches --color-brand: #e63329) ──────────────────────────
const BRAND = { r: 230, g: 51, b: 41 }   // #e63329
const BRAND_HEX = '#E63329'
const BRAND_LIGHT = { r: 253, g: 237, b: 236 }  // very light tint for header

// ─── PDF export (jsPDF) ─────────────────────────────────────────────────────
export function exportPDF(root: HTMLElement, title: string) {
  const blocks = extractBlocks(root)
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  const marginX = 48
  const marginTop = 56
  const marginBottom = 48
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const contentW = pageW - marginX * 2
  let y = marginTop

  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - marginBottom) {
      doc.addPage()
      y = marginTop
    }
  }

  const writeLines = (
    text: string,
    opts: {
      size: number
      style?: 'normal' | 'bold'
      font?: 'helvetica' | 'courier'
      gap?: number
      indent?: number
      color?: [number, number, number]
    },
  ) => {
    const { size, style = 'normal', font = 'helvetica', gap = 6, indent = 0, color = [15, 25, 35] } = opts
    doc.setFont(font, style)
    doc.setFontSize(size)
    doc.setTextColor(color[0], color[1], color[2])
    const lineH = size * 1.4
    const lines = doc.splitTextToSize(text, contentW - indent)
    for (const line of lines) {
      ensureSpace(lineH)
      doc.text(line, marginX + indent, y)
      y += lineH
    }
    y += gap
  }

  // ── Cover title block ──
  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b)
  doc.rect(marginX, y - 14, contentW, 42, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(255, 255, 255)
  doc.text(title, marginX + 12, y + 18)
  y += 52

  // Reset text colour
  doc.setTextColor(15, 25, 35)

  for (const b of blocks) {
    switch (b.type) {

      case 'heading': {
        const sizes = { 1: 17, 2: 14, 3: 12, 4: 11 } as const
        y += b.level <= 2 ? 12 : 6
        const sz = sizes[b.level]
        ensureSpace(sz * 1.8)

        if (b.level === 1) {
          // Red left border accent
          doc.setFillColor(BRAND.r, BRAND.g, BRAND.b)
          const lineCount = doc.splitTextToSize(b.text, contentW - 12).length
          doc.rect(marginX, y - sz, 3, sz * 1.4 * lineCount, 'F')
          writeLines(b.text, { size: sz, style: 'bold', indent: 10, color: [15, 25, 35] })
        } else if (b.level === 2) {
          writeLines(b.text, { size: sz, style: 'bold', color: [26, 46, 74] })
          // Thin underline
          doc.setDrawColor(200, 210, 220)
          doc.setLineWidth(0.5)
          doc.line(marginX, y - 2, marginX + contentW, y - 2)
          y += 2
        } else {
          writeLines(b.text, { size: sz, style: 'bold', color: [75, 85, 99] })
        }
        break
      }

      case 'paragraph':
        writeLines(b.text, { size: 10, gap: 8, color: [55, 65, 81] })
        break

      case 'bullet': {
        doc.setFillColor(BRAND.r, BRAND.g, BRAND.b)
        ensureSpace(14)
        doc.circle(marginX + 6, y - 3, 2, 'F')
        writeLines(b.text, { size: 10, gap: 4, indent: 14, color: [55, 65, 81] })
        break
      }

      case 'code':
        ensureSpace(16)
        doc.setFillColor(13, 17, 23)
        const codeLines = b.text.split('\n')
        const codeLineH = 9 * 1.4
        const codeBlockH = codeLines.length * codeLineH + 12
        if (y + codeBlockH > pageH - marginBottom) {
          doc.addPage(); y = marginTop
        }
        doc.roundedRect(marginX, y, contentW, codeBlockH, 4, 4, 'F')
        doc.setFont('courier', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(230, 237, 243)
        let cy = y + 10
        for (const line of codeLines) {
          doc.text(line, marginX + 8, cy)
          cy += codeLineH
        }
        y += codeBlockH + 10
        doc.setTextColor(15, 25, 35)
        break

      case 'table': {
        const allCols = b.headers.length || (b.rows[0]?.length ?? 0)
        if (allCols === 0) break

        const colW = contentW / allCols
        const rowH = 18
        const cellPadX = 6
        const cellPadY = 5

        // Measure total height needed
        const allRows = b.headers.length ? [b.headers, ...b.rows] : b.rows
        let tableH = 0
        const measuredRowHeights: number[] = []
        for (let ri = 0; ri < allRows.length; ri++) {
          let maxLines = 1
          for (const cell of allRows[ri]) {
            doc.setFont('helvetica', ri === 0 && b.headers.length ? 'bold' : 'normal')
            doc.setFontSize(9)
            const lines = doc.splitTextToSize(cell, colW - cellPadX * 2).length
            if (lines > maxLines) maxLines = lines
          }
          const h = maxLines * 9 * 1.3 + cellPadY * 2
          measuredRowHeights.push(h)
          tableH += h
        }

        ensureSpace(Math.min(tableH + 4, pageH - marginBottom - y))

        let ty = y
        for (let ri = 0; ri < allRows.length; ri++) {
          const row = allRows[ri]
          const isHeader = ri === 0 && b.headers.length > 0
          const rh = measuredRowHeights[ri]

          // Ensure row fits on page
          if (ty + rh > pageH - marginBottom) {
            doc.addPage(); ty = marginTop
          }

          // Row background
          if (isHeader) {
            doc.setFillColor(BRAND.r, BRAND.g, BRAND.b)
            doc.rect(marginX, ty, contentW, rh, 'F')
          } else if (ri % 2 === 0) {
            doc.setFillColor(248, 250, 252) // slate-50
            doc.rect(marginX, ty, contentW, rh, 'F')
          } else {
            doc.setFillColor(255, 255, 255)
            doc.rect(marginX, ty, contentW, rh, 'F')
          }

          // Cell borders + text
          for (let ci = 0; ci < allCols; ci++) {
            const cx = marginX + ci * colW
            const cellText = row[ci] ?? ''

            // Cell border
            doc.setDrawColor(209, 217, 224) // #d1d9e0
            doc.setLineWidth(0.4)
            doc.rect(cx, ty, colW, rh, 'S')

            // Cell text
            doc.setFont('helvetica', isHeader ? 'bold' : 'normal')
            doc.setFontSize(9)
            doc.setTextColor(isHeader ? 255 : 55, isHeader ? 255 : 65, isHeader ? 255 : 81)
            const lines = doc.splitTextToSize(cellText, colW - cellPadX * 2)
            let textY = ty + cellPadY + 8
            for (const ln of lines) {
              doc.text(ln, cx + cellPadX, textY)
              textY += 9 * 1.3
            }
          }
          ty += rh
        }
        y = ty + 10
        doc.setTextColor(15, 25, 35)
        break
      }
    }
  }

  doc.save(`${slug(title)}.pdf`)
}

// ─── DOCX export (docx) ─────────────────────────────────────────────────────

/** Convert hex like "E63329" → { r, g, b } where each is 0-255 */
const hexToRgb = (hex: string) => {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}
const _ = hexToRgb // suppress unused warning
void _

const BRAND_DOCX = 'E63329'
const HEADER_BG  = 'E63329'
const STRIPE_BG  = 'F8FAFC'
const BORDER_CLR = 'D1D9E0'

const cellBorder = {
  top:    { style: BorderStyle.SINGLE, size: 4, color: BORDER_CLR },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_CLR },
  left:   { style: BorderStyle.SINGLE, size: 4, color: BORDER_CLR },
  right:  { style: BorderStyle.SINGLE, size: 4, color: BORDER_CLR },
}

function makeTableBlock(headers: string[], rows: string[][]): Table {
  const allCols = headers.length || rows[0]?.length || 1
  const colPct = Math.floor(100 / allCols)

  const makeCell = (text: string, isHeader: boolean, isStripe: boolean) =>
    new TableCell({
      borders: cellBorder,
      shading: isHeader
        ? { type: ShadingType.SOLID, fill: HEADER_BG, color: HEADER_BG }
        : isStripe
        ? { type: ShadingType.SOLID, fill: STRIPE_BG, color: STRIPE_BG }
        : { type: ShadingType.CLEAR, fill: 'FFFFFF', color: 'FFFFFF' },
      width: { size: colPct, type: WidthType.PERCENTAGE },
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: text || ' ',
              bold: isHeader,
              color: isHeader ? 'FFFFFF' : '374151',
              size: 18, // 9pt in half-points
              font: 'Calibri',
            }),
          ],
          spacing: { before: 60, after: 60 },
        }),
      ],
    })

  const tableRows: TableRow[] = []

  if (headers.length) {
    tableRows.push(
      new TableRow({
        tableHeader: true,
        children: headers.map(h => makeCell(h, true, false)),
      }),
    )
  }

  rows.forEach((row, ri) => {
    tableRows.push(
      new TableRow({
        children: Array.from({ length: allCols }, (_, ci) =>
          makeCell(row[ci] ?? '', false, ri % 2 === 1),
        ),
      }),
    )
  })

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows,
  })
}

export async function exportDOCX(root: HTMLElement, title: string) {
  const blocks = extractBlocks(root)

  // Title block
  const docChildren: (Paragraph | Table)[] = [
    new Paragraph({
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 44,
          color: BRAND_DOCX,
          font: 'Calibri',
        }),
      ],
      spacing: { after: 300 },
    }),
  ]

  const headingMap = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
    4: HeadingLevel.HEADING_4,
  } as const

  for (const b of blocks) {
    switch (b.type) {

      case 'heading':
        docChildren.push(
          new Paragraph({
            text: b.text,
            heading: headingMap[b.level],
            spacing: { before: b.level <= 2 ? 280 : 160, after: 80 },
          }),
        )
        break

      case 'paragraph':
        docChildren.push(
          new Paragraph({
            children: [new TextRun({ text: b.text, size: 20, font: 'Calibri', color: '374151' })],
            spacing: { after: 120 },
          }),
        )
        break

      case 'bullet':
        docChildren.push(
          new Paragraph({
            children: [new TextRun({ text: b.text, size: 20, font: 'Calibri', color: '374151' })],
            bullet: { level: 0 },
            spacing: { after: 60 },
          }),
        )
        break

      case 'code':
        for (const line of b.text.split('\n')) {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line || ' ',
                  font: 'Courier New',
                  size: 16,
                  color: 'E6EDF3',
                  highlight: 'black',
                }),
              ],
              spacing: { before: 0, after: 0 },
            }),
          )
        }
        docChildren.push(new Paragraph({ text: '', spacing: { after: 120 } }))
        break

      case 'table':
        if (b.headers.length || b.rows.length) {
          docChildren.push(new Paragraph({ text: '', spacing: { before: 160, after: 80 } }))
          docChildren.push(makeTableBlock(b.headers, b.rows))
          docChildren.push(new Paragraph({ text: '', spacing: { before: 80, after: 160 } }))
        }
        break
    }
  }

  const document = new Document({
    styles: {
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          run: { color: BRAND_DOCX, bold: true, size: 32, font: 'Calibri' },
          paragraph: { spacing: { before: 300, after: 100 } },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          run: { color: '1A2E4A', bold: true, size: 26, font: 'Calibri' },
          paragraph: { spacing: { before: 200, after: 80 } },
        },
        {
          id: 'Heading3',
          name: 'Heading 3',
          basedOn: 'Normal',
          run: { color: '374151', bold: true, size: 22, font: 'Calibri' },
          paragraph: { spacing: { before: 160, after: 60 } },
        },
        {
          id: 'Heading4',
          name: 'Heading 4',
          basedOn: 'Normal',
          run: { color: '4B5563', bold: true, size: 20, font: 'Calibri' },
          paragraph: { spacing: { before: 120, after: 40 } },
        },
      ],
    },
    sections: [{ children: docChildren }],
  })

  const blob = await Packer.toBlob(document)
  triggerDownload(blob, `${slug(title)}.docx`)
}
