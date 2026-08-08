import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Download, Menu, X, BookOpen, Users, FileText, ClipboardCheck,
  ChevronRight, Search, Github, Hash, ArrowUpRight,
} from 'lucide-react'
import camrailLogo from './imports/camrail-removebg-preview-1786060006378.png'
import GuideTechnique, { GUIDE_SECTIONS } from './volets/GuideTechnique'
import ManuelUtilisateur, { MANUEL_SECTIONS } from './volets/ManuelUtilisateur'
import RapportConception, { RAPPORT_SECTIONS } from './volets/RapportConception'
import TestRecette, { TEST_SECTIONS } from './volets/TestRecette'

const REPO_URL = 'https://github.com/3Malaika/kalati'

// ─── Document Definition ───────────────────────────────────────────────────────

const DOCS = [
  {
    id: 'guide',
    label: 'Guide Technique',
    subtitle: 'Installation & API',
    icon: BookOpen,
    sections: GUIDE_SECTIONS,
    Component: GuideTechnique,
  },
  {
    id: 'manuel',
    label: 'Manuel Utilisateur',
    subtitle: 'Usage quotidien',
    icon: Users,
    sections: MANUEL_SECTIONS,
    Component: ManuelUtilisateur,
  },
  {
    id: 'rapport',
    label: 'Rapport de Conception',
    subtitle: 'Architecture & Choix',
    icon: FileText,
    sections: RAPPORT_SECTIONS,
    Component: RapportConception,
  },
  {
    id: 'tests',
    label: 'Dossier Test & Recette',
    subtitle: 'Validation & Recette',
    icon: ClipboardCheck,
    sections: TEST_SECTIONS,
    Component: TestRecette,
  },
]

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState(DOCS[0].id)
  const [activeSection, setActiveSection] = useState('')
  const [scrollPct, setScrollPct] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [pendingScroll, setPendingScroll] = useState<string | null>(null)

  const currentDoc = DOCS.find(t => t.id === activeTab)!
  const ActiveComponent = currentDoc.Component

  useEffect(() => {
    document.title = `${currentDoc.label} · KALATI RAG`
  }, [currentDoc.label])

  const scrollTo = useCallback((id: string) => {
    setSidebarOpen(false)
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 88
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }, [])

  // Switch document, optionally scrolling to a section once mounted
  const navigateTo = (tabId: string, sectionId?: string) => {
    setSidebarOpen(false)
    if (tabId !== activeTab) {
      setActiveTab(tabId)
      setActiveSection(sectionId ?? '')
      if (sectionId) setPendingScroll(sectionId)
      else window.scrollTo({ top: 0, behavior: 'instant' })
    } else if (sectionId) {
      scrollTo(sectionId)
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }

  // Perform deferred scroll after a document switch renders
  useEffect(() => {
    if (pendingScroll) {
      const t = window.setTimeout(() => {
        scrollTo(pendingScroll)
        setPendingScroll(null)
      }, 60)
      return () => window.clearTimeout(t)
    }
  }, [activeTab, pendingScroll, scrollTo])

  const handleScroll = useCallback(() => {
    const doc = document.documentElement
    const scrolled = doc.scrollTop
    const total = doc.scrollHeight - doc.clientHeight
    setScrollPct(total > 0 ? (scrolled / total) * 100 : 0)

    for (const sec of [...currentDoc.sections].reverse()) {
      const el = document.getElementById(sec.id)
      if (el && el.getBoundingClientRect().top <= 140) {
        setActiveSection(sec.id)
        break
      }
    }
  }, [currentDoc.sections])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Search across every document + section
  const q = query.trim().toLowerCase()
  const searchResults = useMemo(() => {
    if (!q) return null
    const out: { docId: string; docLabel: string; sectionId: string; sectionLabel: string }[] = []
    for (const d of DOCS) {
      for (const s of d.sections) {
        if (
          s.label.toLowerCase().includes(q) ||
          d.label.toLowerCase().includes(q)
        ) {
          out.push({ docId: d.id, docLabel: d.label, sectionId: s.id, sectionLabel: s.label })
        }
      }
    }
    return out
  }, [q])

  const activeSectionLabel =
    currentDoc.sections.find(s => s.id === activeSection)?.label ?? 'Aperçu'

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">

      {/* ═══════════════ LEFT SIDEBAR ═══════════════ */}
      <aside
        className={`no-print fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#ececec] flex flex-col
          transition-transform duration-300 md:translate-x-0
          ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} md:shadow-none`}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 h-[68px] border-b border-[#ececec] flex-shrink-0">
          <div className="bg-[#e2241b] rounded-lg p-1.5 flex-shrink-0">
            <img src={camrailLogo} alt="Logo CAMRAIL" className="h-7 w-auto object-contain brightness-0 invert" />
          </div>
          <div className="min-w-0 leading-tight">
            <h1 className="font-bold text-[15px] tracking-tight">KALATI RAG</h1>
            <p className="text-[11px] text-[#9a9a9a] truncate">Docs · CAMRAIL</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden ml-auto text-[#7a7a7a] hover:text-[#e2241b]"
            aria-label="Fermer le menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-4 pb-2 flex-shrink-0">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0b0b0]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher…"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#f6f6f6] border border-transparent focus:border-[#e2241b] focus:bg-white text-sm outline-none transition-colors placeholder:text-[#b0b0b0]"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#b0b0b0] hover:text-[#e2241b]"
                aria-label="Effacer la recherche"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {searchResults ? (
            /* ── Search results ── */
            <div className="flex flex-col gap-0.5">
              <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#b0b0b0]">
                {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}
              </p>
              {searchResults.length === 0 && (
                <p className="px-2 py-3 text-sm text-[#9a9a9a]">Aucune section trouvée.</p>
              )}
              {searchResults.map((r) => (
                <button
                  key={r.docId + r.sectionId}
                  onClick={() => { navigateTo(r.docId, r.sectionId); setQuery('') }}
                  className="text-left px-2.5 py-2 rounded-md hover:bg-[#fdeceb] group transition-colors"
                >
                  <span className="flex items-center gap-2 text-sm text-[#1a1a1a] group-hover:text-[#e2241b]">
                    <Hash size={13} className="text-[#c9c9c9] group-hover:text-[#e2241b] flex-shrink-0" />
                    {r.sectionLabel}
                  </span>
                  <span className="block ml-[21px] text-[11px] text-[#9a9a9a]">{r.docLabel}</span>
                </button>
              ))}
            </div>
          ) : (
            /* ── Document tree ── */
            <div className="flex flex-col gap-1">
              {DOCS.map((doc) => {
                const Icon = doc.icon
                const active = activeTab === doc.id
                return (
                  <div key={doc.id}>
                    <button
                      onClick={() => navigateTo(doc.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors duration-150 ${
                        active
                          ? 'bg-[#fdeceb] text-[#e2241b]'
                          : 'text-[#3a3a3a] hover:bg-[#f6f6f6]'
                      }`}
                    >
                      <Icon size={16} className={`flex-shrink-0 ${active ? 'text-[#e2241b]' : 'text-[#9a9a9a]'}`} />
                      <span className="min-w-0">
                        <span className="block text-[13px] font-semibold leading-tight">{doc.label}</span>
                        <span className={`block text-[11px] leading-tight ${active ? 'text-[#e2241b]/60' : 'text-[#a8a8a8]'}`}>
                          {doc.subtitle}
                        </span>
                      </span>
                    </button>

                    {active && (
                      <div className="mt-1 mb-1.5 ml-[19px] pl-3 border-l border-[#ececec] flex flex-col">
                        {doc.sections.map((sec) => {
                          const secActive = activeSection === sec.id
                          return (
                            <button
                              key={sec.id}
                              onClick={() => scrollTo(sec.id)}
                              className={`text-left text-[13px] py-1.5 pl-2.5 pr-2 -ml-px border-l transition-colors duration-150 ${
                                secActive
                                  ? 'border-[#e2241b] text-[#e2241b] font-semibold'
                                  : 'border-transparent text-[#7a7a7a] hover:text-[#1a1a1a]'
                              }`}
                            >
                              {sec.label}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </nav>

        {/* Sidebar footer */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-[#ececec]">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-[12px] text-[#7a7a7a] hover:text-[#e2241b] transition-colors"
          >
            <Github size={15} />
            <span className="min-w-0 truncate">3Malaika/kalati</span>
            <ArrowUpRight size={13} className="ml-auto flex-shrink-0" />
          </a>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="no-print fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ═══════════════ MAIN ═══════════════ */}
      <div className="md:ml-72 print:ml-0">

        {/* Reading progress bar */}
        <div
          className="no-print fixed top-0 left-0 md:left-72 h-0.5 bg-[#e2241b] z-30 transition-all duration-100"
          style={{ width: `${scrollPct}%` }}
        />

        {/* Top bar */}
        <header className="no-print sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-[#ececec]">
          <div className="flex items-center gap-3 px-4 sm:px-8 h-[68px]">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-[#1a1a1a] hover:text-[#e2241b]"
              aria-label="Ouvrir le menu"
            >
              <Menu size={22} />
            </button>

            {/* Breadcrumb */}
            <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-sm min-w-0">
              <span className="text-[#9a9a9a] hidden sm:inline">Docs</span>
              <ChevronRight size={14} className="text-[#d4d4d4] flex-shrink-0 hidden sm:inline" />
              <span className="font-semibold truncate">{currentDoc.label}</span>
              <ChevronRight size={14} className="text-[#d4d4d4] flex-shrink-0" />
              <span className="text-[#7a7a7a] truncate">{activeSectionLabel}</span>
            </nav>

            <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                title="Voir le dépôt sur GitHub"
                className="flex items-center justify-center w-9 h-9 rounded-lg text-[#3a3a3a] hover:bg-[#f6f6f6] hover:text-[#e2241b] transition-colors"
                aria-label="Dépôt GitHub"
              >
                <Github size={18} />
              </a>
              <button
                onClick={() => window.print()}
                title="Exporter le document affiché en PDF"
                className="flex items-center gap-1.5 bg-[#e2241b] text-white hover:bg-[#b3160f] px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Export PDF</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content + right TOC */}
        <div className="flex gap-10 px-4 sm:px-8 lg:px-12 py-8 lg:py-10">
          <main className="flex-1 min-w-0">
            {/* Print-only document header */}
            <div className="hidden print:block mb-6 pb-4 border-b-2 border-[#e2241b]">
              <p className="text-sm text-[#7a7a7a]">KALATI RAG · CAMRAIL</p>
              <h1 className="text-2xl font-bold">{currentDoc.label}</h1>
            </div>

            {/* Doc heading */}
            <div className="mb-8 no-print">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#e2241b] mb-2">
                <currentDoc.icon size={14} />
                {currentDoc.subtitle}
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-balance">{currentDoc.label}</h1>
            </div>

            <div className="max-w-3xl">
              <ActiveComponent />
            </div>

            {/* Bottom meta */}
            <div className="no-print max-w-3xl mt-14 pt-6 border-t border-[#ececec] flex items-center justify-between">
              <p className="text-xs text-[#9a9a9a]">KALATI RAG — Documentation technique · CAMRAIL</p>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium text-[#7a7a7a] hover:text-[#e2241b] transition-colors"
              >
                <Github size={14} />
                Modifier sur GitHub
              </a>
            </div>
          </main>

          {/* Right TOC — "Sur cette page" */}
          <aside className="no-print hidden xl:block w-56 flex-shrink-0">
            <div className="sticky top-[92px]">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[#b0b0b0] mb-3">
                Sur cette page
              </p>
              <ul className="flex flex-col gap-0.5 border-l border-[#ececec]">
                {currentDoc.sections.map((sec) => {
                  const secActive = activeSection === sec.id
                  return (
                    <li key={sec.id}>
                      <button
                        onClick={() => scrollTo(sec.id)}
                        className={`text-left text-[13px] leading-snug py-1.5 pl-3 -ml-px border-l w-full transition-colors duration-150 ${
                          secActive
                            ? 'border-[#e2241b] text-[#e2241b] font-semibold'
                            : 'border-transparent text-[#8a8a8a] hover:text-[#1a1a1a]'
                        }`}
                      >
                        {sec.label}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
