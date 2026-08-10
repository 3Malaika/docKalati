import { useState, useEffect, useCallback, useRef } from 'react'
import { Menu, X, Search, BookOpen, ChevronRight, Code2, ExternalLink, Download, FileText, FileType, Loader2, Phone, Mail, GraduationCap, User } from 'lucide-react'
import { exportPDF, exportDOCX } from './utils/exportDoc'
import camrailLogo from './imports/camrail-removebg-preview-1786060006378.png'
import GuideTechnique, { GUIDE_SECTIONS } from './volets/GuideTechnique'
import ManuelUtilisateur, { MANUEL_SECTIONS } from './volets/ManuelUtilisateur'
import RapportConception, { RAPPORT_SECTIONS } from './volets/RapportConception'
import TestRecette, { TEST_SECTIONS } from './volets/TestRecette'
import AdminFormateur, { ADMIN_FORMATEUR_SECTIONS } from './volets/AdminFormateur'

// ─── Tab Definition ───────────────────────────────────────────────────────────

const TABS = [
  {
    id: 'guide',
    label: 'Guide Technique',
    subtitle: 'Installation & API',
    sections: GUIDE_SECTIONS,
    Component: GuideTechnique,
  },
  {
    id: 'manuel',
    label: 'Manuel Utilisateur',
    subtitle: 'Usage quotidien',
    sections: MANUEL_SECTIONS,
    Component: ManuelUtilisateur,
  },
  {
    id: 'rapport',
    label: 'Rapport de Conception',
    subtitle: 'Architecture & Choix',
    sections: RAPPORT_SECTIONS,
    Component: RapportConception,
  },
  {
    id: 'tests',
    label: 'Dossier Test & Recette',
    subtitle: 'Validation & Recette',
    sections: TEST_SECTIONS,
    Component: TestRecette,
  },
  {
    id: 'admin-formateur',
    label: 'Admin & Formateur',
    subtitle: 'Gestion & Formation',
    sections: ADMIN_FORMATEUR_SECTIONS,
    Component: AdminFormateur,
  },
]

const GITHUB_URL = 'https://github.com/3Malaika/kalati'

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState(TABS[0].id)
  const [activeSection, setActiveSection] = useState('')
  const [scrollPct, setScrollPct] = useState(0)
  const [mobileNav, setMobileNav] = useState(false)
  const [query, setQuery] = useState('')

  const contentRef = useRef<HTMLDivElement>(null)

  const currentTab = TABS.find(t => t.id === activeTab)!

  const handleTabChange = (id: string) => {
    setActiveTab(id)
    setActiveSection('')
    setMobileNav(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const handleScroll = useCallback(() => {
    const doc = document.documentElement
    const scrolled = doc.scrollTop
    const total = doc.scrollHeight - doc.clientHeight
    setScrollPct(total > 0 ? (scrolled / total) * 100 : 0)

    const sections = currentTab.sections
    for (const sec of [...sections].reverse()) {
      const el = document.getElementById(sec.id)
      if (el && el.getBoundingClientRect().top <= 140) {
        setActiveSection(sec.id)
        break
      }
    }
  }, [currentTab.sections])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const scrollTo = (id: string) => {
    setMobileNav(false)
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 96
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const filteredSections = query.trim()
    ? currentTab.sections.filter(s =>
        s.label.toLowerCase().includes(query.trim().toLowerCase())
      )
    : currentTab.sections

  return (
    <div className="min-h-screen bg-white text-ink">

      {/* ── Reading progress bar ── */}
      <div
        className="fixed top-0 left-0 h-[3px] bg-brand z-[60] transition-all duration-100"
        style={{ width: `${scrollPct}%` }}
      />

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-50 h-16 bg-white/90 backdrop-blur-md border-b border-border">
        <div className="h-full max-w-[1400px] mx-auto px-4 lg:px-6 flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileNav(v => !v)}
            className="lg:hidden -ml-1 p-2 rounded-md text-muted hover:bg-brand/5 hover:text-brand transition-colors"
            aria-label="Ouvrir la navigation"
          >
            {mobileNav ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Brand */}
          <a href="#" className="flex items-center gap-3 flex-shrink-0" onClick={(e) => { e.preventDefault(); handleTabChange(TABS[0].id) }}>
            <span className="flex items-center justify-center h-9 w-9 rounded-lg bg-brand shadow-sm shadow-brand/30">
              <img src={camrailLogo} alt="Logo CAMRAIL" className="h-6 w-auto object-contain" />
            </span>
            <span className="leading-none">
              <span className="block font-bold tracking-tight text-[15px]">
                KALATI <span className="text-brand">RAG</span>
              </span>
              <span className="hidden sm:block text-[11px] text-muted mt-0.5">Documentation · CAMRAIL</span>
            </span>
          </a>

          {/* Search */}
          <div className="ml-auto flex items-center gap-2 w-full max-w-xs">
            <div className="relative flex-1 hidden sm:block">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Rechercher une section…"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-surface focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none transition-all placeholder:text-muted/70"
              />
            </div>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium text-ink hover:border-brand hover:text-brand transition-colors"
            >
              <Code2 size={16} />
              <span className="hidden md:inline">GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* ── Layout: sidebar + content ── */}
      <div className="max-w-[1400px] mx-auto lg:flex">

        {/* Mobile overlay */}
        {mobileNav && (
          <div
            className="fixed inset-0 top-16 bg-ink/40 z-30 lg:hidden"
            onClick={() => setMobileNav(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={`fixed lg:sticky top-16 z-40 h-[calc(100vh-4rem)] w-72 flex-shrink-0 overflow-y-auto border-r border-border bg-white transition-transform duration-300 lg:translate-x-0 ${
            mobileNav ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="px-4 py-6">
            {TABS.map(tab => {
              const open = tab.id === activeTab
              return (
                <div key={tab.id} className="mb-5">
                  <button
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
                      open
                        ? 'bg-brand/8 text-brand'
                        : 'text-ink hover:bg-surface'
                    }`}
                  >
                    <BookOpen size={16} className={open ? 'text-brand' : 'text-muted'} />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold leading-tight truncate">{tab.label}</span>
                      <span className="block text-[11px] text-muted leading-tight truncate">{tab.subtitle}</span>
                    </span>
                    <ChevronRight
                      size={15}
                      className={`text-muted transition-transform ${open ? 'rotate-90' : ''}`}
                    />
                  </button>

                  {/* Section links */}
                  {open && (
                    <ul className="mt-1.5 ml-3 pl-3 border-l border-border space-y-0.5">
                      {(query.trim() ? filteredSections : tab.sections).map(sec => {
                        const on = activeSection === sec.id
                        return (
                          <li key={sec.id}>
                            <button
                              onClick={() => scrollTo(sec.id)}
                              className={`w-full text-left text-[13px] px-3 py-1.5 rounded-md -ml-px border-l-2 transition-all ${
                                on
                                  ? 'border-brand text-brand font-semibold bg-brand/5'
                                  : 'border-transparent text-muted hover:text-ink hover:border-border'
                              }`}
                            >
                              {sec.label}
                            </button>
                          </li>
                        )
                      })}
                      {query.trim() && filteredSections.length === 0 && (
                        <li className="text-[12px] text-muted px-3 py-1.5">Aucun résultat</li>
                      )}
                    </ul>
                  )}
                </div>
              )
            })}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          <main className="px-5 lg:px-12 py-10">
            <div className="max-w-3xl mx-auto">

              {/* Breadcrumb + title */}
              <div className="mb-8">
                <div className="flex items-center gap-1.5 text-[13px] text-muted mb-3">
                  <span>Docs</span>
                  <ChevronRight size={13} />
                  <span className="text-brand font-medium">{currentTab.label}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-balance">{currentTab.label}</h1>
                    <p className="mt-2 text-muted text-[15px]">{currentTab.subtitle}</p>
                  </div>
                  <ExportMenu contentRef={contentRef} title={currentTab.label} />
                </div>
                <div className="mt-5 h-px bg-gradient-to-r from-brand/40 via-border to-transparent" />
              </div>

              {/* Exportable document body */}
              <div ref={contentRef}>
                {activeTab === 'guide'   && <GuideTechnique />}
                {activeTab === 'manuel'  && <ManuelUtilisateur />}
                {activeTab === 'rapport' && <RapportConception />}
                {activeTab === 'tests'   && <TestRecette />}
                {activeTab === 'admin-formateur' && <AdminFormateur />}
              </div>

              {/* Bottom nav between documents */}
              <BottomNav activeTab={activeTab} onNavigate={handleTabChange} />

              {/* About us */}
              <AboutUs />

              <footer className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-[13px] text-muted">
                <span>KALATI RAG — Documentation technique · CAMRAIL</span>
                <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-brand transition-colors">
                  3Malaika/kalati <ExternalLink size={13} />
                </a>
              </footer>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

// ─── Export menu (PDF / DOCX) ──────────────────────────────────────────────────

function ExportMenu({ contentRef, title }: { contentRef: React.RefObject<HTMLDivElement | null>; title: string }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<null | 'pdf' | 'docx'>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const run = async (fmt: 'pdf' | 'docx') => {
    const root = contentRef.current
    if (!root) return
    setBusy(fmt)
    setOpen(false)
    try {
      if (fmt === 'pdf') exportPDF(root, title)
      else await exportDOCX(root, title)
    } catch (err) {
      console.error('[v0] export error', err)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div ref={wrapRef} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(v => !v)}
        disabled={busy !== null}
        className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-brand text-white text-sm font-semibold shadow-sm shadow-brand/25 hover:bg-brand/90 disabled:opacity-60 transition-colors"
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        {busy ? 'Export…' : 'Exporter'}
        {!busy && <ChevronRight size={14} className={`transition-transform ${open ? 'rotate-90' : ''}`} />}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-white shadow-lg overflow-hidden z-50">
          <button
            onClick={() => run('pdf')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-brand/5 hover:text-brand transition-colors"
          >
            <FileText size={17} className="text-brand" />
            <span>
              <span className="block font-medium">Format PDF</span>
              <span className="block text-[11px] text-muted">Document .pdf</span>
            </span>
          </button>
          <div className="h-px bg-border" />
          <button
            onClick={() => run('docx')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-brand/5 hover:text-brand transition-colors"
          >
            <FileType size={17} className="text-brand" />
            <span>
              <span className="block font-medium">Format Word</span>
              <span className="block text-[11px] text-muted">Document .docx</span>
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

// ─── About us ─────────────────────────────────────────────────────────────────

function AboutUs() {
  return (
    <div className="mt-14 rounded-2xl border border-border bg-surface overflow-hidden">
      {/* Header band */}
      <div className="bg-brand px-6 py-4 flex items-center gap-3">
        <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-white/15">
          <User size={18} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-base leading-tight">À propos de l'auteure</p>
          <p className="text-white/70 text-[12px]">Réalisé dans le cadre du projet KALATI · CAMRAIL</p>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5 flex flex-col sm:flex-row gap-6 items-start">
        {/* Avatar initials */}
        <div className="flex-shrink-0 h-16 w-16 rounded-full bg-brand/10 border-2 border-brand/20 flex items-center justify-center">
          <span className="text-brand font-bold text-xl select-none">BM</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-ink leading-tight">Babouma Malaika</h3>
          <p className="text-[13px] text-muted mt-0.5 mb-3">5<sup>ème</sup> année · Cycle Ingénieur</p>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand/8 text-brand text-[12px] font-semibold">
              <GraduationCap size={13} />
              Saint Jean Ingénieur
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[12px] font-semibold">
              Management des Systèmes d'Information
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:+237696784809"
              className="inline-flex items-center gap-2 text-[13px] text-ink hover:text-brand transition-colors"
            >
              <Phone size={14} className="text-brand flex-shrink-0" />
              696 784 809
            </a>
            <a
              href="mailto:babouma.suzanne@saintjeaningenieur.org"
              className="inline-flex items-center gap-2 text-[13px] text-ink hover:text-brand transition-colors break-all"
            >
              <Mail size={14} className="text-brand flex-shrink-0" />
              babouma.suzanne@saintjeaningenieur.org
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Bottom "prev / next document" navigation ──────────────────────────────────

function BottomNav({ activeTab, onNavigate }: { activeTab: string; onNavigate: (id: string) => void }) {
  const idx = TABS.findIndex(t => t.id === activeTab)
  const prev = idx > 0 ? TABS[idx - 1] : null
  const next = idx < TABS.length - 1 ? TABS[idx + 1] : null

  return (
    <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {prev ? (
        <button
          onClick={() => onNavigate(prev.id)}
          className="group text-left rounded-xl border border-border p-4 hover:border-brand hover:bg-brand/5 transition-all"
        >
          <span className="block text-[11px] uppercase tracking-wider text-muted">Précédent</span>
          <span className="mt-1 flex items-center gap-1.5 font-semibold text-ink group-hover:text-brand transition-colors">
            <ChevronRight size={15} className="rotate-180" />
            {prev.label}
          </span>
        </button>
      ) : <span className="hidden sm:block" />}

      {next && (
        <button
          onClick={() => onNavigate(next.id)}
          className="group text-right rounded-xl border border-border p-4 hover:border-brand hover:bg-brand/5 transition-all sm:col-start-2"
        >
          <span className="block text-[11px] uppercase tracking-wider text-muted">Suivant</span>
          <span className="mt-1 flex items-center justify-end gap-1.5 font-semibold text-ink group-hover:text-brand transition-colors">
            {next.label}
            <ChevronRight size={15} />
          </span>
        </button>
      )}
    </div>
  )
}
