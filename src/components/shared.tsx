import { useState, useEffect, useRef, type ReactNode } from 'react'
import { Copy, Check } from 'lucide-react'

// ─── Inline Code ─────────────────────────────────────────────────────────────
export function IC({ children }: { children: ReactNode }) {
  return (
    <code className="bg-red-50 text-red-700 border border-red-200 rounded px-1.5 py-0.5 text-[0.85em] font-mono">
      {children}
    </code>
  )
}

// ─── Code Block ──────────────────────────────────────────────────────────────
export function CodeBlock({ code, lang = 'bash' }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-[#2d3748] shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b27] border-b border-[#2d3748]">
        <span className="text-xs font-mono text-[#8b949e] tracking-widest uppercase">{lang}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copié' : 'Copier'}
        </button>
      </div>
      <pre className="bg-[#0d1117] text-[#e6edf3] p-5 overflow-x-auto text-sm leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
    </div>
  )
}

// ─── Badge ───────────────────────────────────────────────────────────────────
type BadgeColor = 'red' | 'blue' | 'green' | 'orange' | 'purple' | 'pink' | 'gray'
const badgeMap: Record<BadgeColor, string> = {
  red:    'bg-red-50 text-red-700 border-red-200',
  blue:   'bg-blue-50 text-blue-700 border-blue-200',
  green:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  pink:   'bg-pink-50 text-pink-800 border-pink-200',
  gray:   'bg-slate-100 text-slate-600 border-slate-200',
}
export function Badge({ color, children }: { color: BadgeColor; children: ReactNode }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border mr-1 ${badgeMap[color]}`}>
      {children}
    </span>
  )
}

// ─── Card ────────────────────────────────────────────────────────────────────
type CardVariant = 'default' | 'warn' | 'info' | 'success' | 'danger'
const cardMap: Record<CardVariant, string> = {
  default: 'bg-slate-50 border-slate-200',
  warn:    'bg-amber-50 border-amber-300',
  info:    'bg-blue-50 border-blue-300',
  success: 'bg-emerald-50 border-emerald-300',
  danger:  'bg-red-50 border-red-400',
}
export function Card({ variant = 'default', children }: { variant?: CardVariant; children: ReactNode }) {
  return (
    <div className={`rounded-xl border p-4 my-4 text-sm leading-relaxed ${cardMap[variant]}`}>
      {children}
    </div>
  )
}

// ─── Step ────────────────────────────────────────────────────────────────────
export function Step({ n, title, children }: { n: number; title: string; children?: ReactNode }) {
  return (
    <div className="flex gap-4 mb-5">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#e63329] text-white flex items-center justify-center text-sm font-bold mt-0.5 shadow-sm">
        {n}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-[#0f1923] mb-1">{title}</p>
        {children}
      </div>
    </div>
  )
}

// ─── Section Heading ─────────────────────────────────────────────────────────
export function SectionHeading({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 text-xl font-bold text-[#0f1923] mt-10 mb-4 pb-2 border-b-2 border-[#e63329]/20">
      <span className="text-[#e63329]">{icon}</span>
      {children}
    </h2>
  )
}

// ─── Sub Heading ─────────────────────────────────────────────────────────────
export function H3({ children }: { children: ReactNode }) {
  return <h3 className="font-bold text-[#1a2e4a] text-base mt-6 mb-2">{children}</h3>
}

// ─── Tabs ────────────────────────────────────────────────────────────────────
export function LocalTabs({ tabs, children }: { tabs: string[]; children: (active: string) => ReactNode }) {
  const [active, setActive] = useState(tabs[0])
  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all duration-200 ${
              active === t
                ? 'bg-[#e63329] text-white border-[#e63329] shadow-sm'
                : 'bg-white text-[#0f1923] border-[#d1d9e0] hover:border-[#e63329] hover:text-[#e63329]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div>{children(active)}</div>
    </div>
  )
}

// ─── Table ───────────────────────────────────────────────────────────────────
export function DataTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: (string | ReactNode)[][]
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#d1d9e0] my-4 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#0f1923] text-white">
            {headers.map((h, i) => (
              <th key={i} className="text-left px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 border-t border-[#d1d9e0] align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Architecture Diagram ────────────────────────────────────────────────────
export function ArchFlow({ steps }: { steps: string[] }) {
  return (
    <div className="flex flex-col gap-1 my-2">
      {steps.map((s, i) => (
        <div key={i}>
          <div
            className="bg-white border border-[#d1d9e0] rounded-lg px-4 py-2.5 text-sm text-center hover:border-[#e63329]/40 transition-colors"
            dangerouslySetInnerHTML={{ __html: s }}
          />
          {i < steps.length - 1 && (
            <div className="text-[#e63329] text-xl text-center my-0.5 leading-none">↓</div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Screen Card ─────────────────────────────────────────────────────────────
export function ScreenCard({
  num,
  title,
  access,
  children,
}: {
  num: number
  title: string
  access: ReactNode
  children: ReactNode
}) {
  return (
    <div className="border border-[#d1d9e0] rounded-xl p-5 my-3 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-2">
        <span className="w-7 h-7 rounded-full bg-[#e63329] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
          {num}
        </span>
        <div className="flex-1">
          <h4 className="font-bold text-[#0f1923]">{title}</h4>
          <div className="mt-1">{access}</div>
        </div>
      </div>
      <p className="text-sm text-[#4b5563] leading-relaxed pl-10">{children}</p>
    </div>
  )
}

// ─── Fade-up animated section ────────────────────────────────────────────────
export function AnimSection({ id, children }: { id: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect() }
      },
      { threshold: 0.04 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <section id={id} ref={ref} className="fade-up py-1">
      {children}
    </section>
  )
}

// ─── Monospaced Diagram ──────────────────────────────────────────────────────
export function Diagram({ children }: { children: string }) {
  return (
    <pre className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-5 font-mono text-xs leading-relaxed overflow-x-auto my-4 text-slate-700 whitespace-pre">
      {children}
    </pre>
  )
}

// ─── Example Box ─────────────────────────────────────────────────────────────
export function ExampleBox({
  variant,
  question,
  note,
}: {
  variant: 'good' | 'bad'
  question: string
  note: string
}) {
  return (
    <div
      className={`border rounded-xl p-4 my-2 ${
        variant === 'good'
          ? 'border-l-4 border-l-emerald-500 border-slate-200 bg-emerald-50/40'
          : 'border-l-4 border-l-red-500 border-slate-200 bg-red-50/40'
      }`}
    >
      <p className="font-semibold text-[#0f1923] text-sm mb-1">{question}</p>
      <p className="text-xs text-[#6b7a8d]">{note}</p>
    </div>
  )
}
