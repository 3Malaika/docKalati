import { jsPDF } from 'jspdf'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
} from 'docx'

// ─── Structured content model ──────────────────────────────────────────────
// We extract ONLY the meaningful text from the rendered DOM: hierarchical
// titles, paragraphs, list items, code blocks and tables. All visual chrome
// (icons, cards, badges, borders, buttons, breadcrumbs) is dropped.

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
        const headers = Array.from(child.querySelectorAll('thead th')).map((th) =>
          clean(th.textContent),
        )
        const rows = Array.from(child.querySelectorAll('tbody tr')).map((tr) =>
          Array.from(tr.querySelectorAll('td')).map((td) => clean(td.textContent)),
        )
        if (headers.length || rows.length) {
          blocks.push({ type: 'table', headers, rows })
        }
      } else {
        // Container element → keep descending until we reach content blocks.
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

// ─── PDF export (jsPDF) ──────────────────────────────────────────────────────
export function exportPDF(root: HTMLElement, title: string) {
  const blocks = extractBlocks(root)
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  const marginX = 56
  const marginTop = 64
  const marginBottom = 56
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
      lineGap?: number
    },
  ) => {
    const { size, style = 'normal', font = 'helvetica', gap = 6, indent = 0 } = opts
    doc.setFont(font, style)
    doc.setFontSize(size)
    const lineH = size * 1.35
    const lines = doc.splitTextToSize(text, contentW - indent)
    for (const line of lines) {
      ensureSpace(lineH)
      doc.text(line, marginX + indent, y)
      y += lineH
    }
    y += gap
  }

  // Document title
  writeLines(title, { size: 22, style: 'bold', gap: 16 })

  for (const b of blocks) {
    switch (b.type) {
      case 'heading': {
        const sizes = { 1: 18, 2: 15, 3: 13, 4: 12 } as const
        y += b.level <= 2 ? 10 : 4
        ensureSpace(sizes[b.level] * 1.6)
        writeLines(b.text, { size: sizes[b.level], style: 'bold', gap: 6 })
        break
      }
      case 'paragraph':
        writeLines(b.text, { size: 11, gap: 8 })
        break
      case 'bullet':
        writeLines('•  ' + b.text, { size: 11, gap: 4, indent: 12 })
        break
      case 'code':
        writeLines(b.text, { size: 9, font: 'courier', gap: 10 })
        break
      case 'table': {
        if (b.headers.length) {
          writeLines(b.headers.join('   |   '), { size: 10, style: 'bold', gap: 4 })
        }
        for (const row of b.rows) {
          writeLines(row.join('   |   '), { size: 10, gap: 4, indent: 8 })
        }
        y += 6
        break
      }
    }
  }

  doc.save(`${slug(title)}.pdf`)
}

// ─── DOCX export (docx) ──────────────────────────────────────────────────────
export async function exportDOCX(root: HTMLElement, title: string) {
  const blocks = extractBlocks(root)

  const children: Paragraph[] = [
    new Paragraph({ text: title, heading: HeadingLevel.TITLE }),
  ]

  const headingMap = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_1,
    3: HeadingLevel.HEADING_2,
    4: HeadingLevel.HEADING_3,
  } as const

  for (const b of blocks) {
    switch (b.type) {
      case 'heading':
        children.push(new Paragraph({ text: b.text, heading: headingMap[b.level] }))
        break
      case 'paragraph':
        children.push(new Paragraph({ text: b.text, spacing: { after: 120 } }))
        break
      case 'bullet':
        children.push(new Paragraph({ text: b.text, bullet: { level: 0 } }))
        break
      case 'code':
        for (const line of b.text.split('\n')) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: line || ' ', font: 'Courier New', size: 18 })],
            }),
          )
        }
        children.push(new Paragraph({ text: '', spacing: { after: 80 } }))
        break
      case 'table': {
        if (b.headers.length) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: b.headers.join('   |   '), bold: true })],
              spacing: { before: 120 },
            }),
          )
        }
        for (const row of b.rows) {
          children.push(new Paragraph({ text: row.join('   |   '), spacing: { after: 40 } }))
        }
        break
      }
    }
  }

  const doc = new Document({ sections: [{ children }] })
  const blob = await Packer.toBlob(doc)
  triggerDownload(blob, `${slug(title)}.docx`)
}
