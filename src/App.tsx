import { useState, useEffect, useCallback } from 'react'
import {
  Download, Menu, X, BookOpen, Users, FileText, ClipboardCheck,
  ChevronRight,
} from 'lucide-react'
import camrailLogo from './imports/camrail-removebg-preview-1786060006378.png'
import GuideTechnique, { GUIDE_SECTIONS } from './volets/GuideTechnique'
import ManuelUtilisateur, { MANUEL_SECTIONS } from './volets/ManuelUtilisateur'
import RapportConception, { RAPPORT_SECTIONS } from './volets/RapportConception'
import TestRecette, { TEST_SECTIONS } from './volets/TestRecette'

// ─── Tab Definition ───────────────────────────────────────────────────────────

const TABS = [
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
  const [activeTab, setActiveTab] = useState(TABS[0].id)
  const [activeSection, setActiveSection] = useState('')
  const [scrollPct, setScrollPct] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentTab = TABS.find(t => t.id === activeTab)!
  const ActiveComponent = currentTab.Component

  useEffect(() => {
    document.title = `${currentTab.label} · KALATI RAG`
  }, [currentTab.label])

  // Reset scroll + active section on tab change
  const handleTabChange = (id: string) => {
    setActiveTab(id)
    setActiveSection('')
    setSidebarOpen(false)
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
      if (el && el.getBoundingClientRect().top <= 120) {
        setActiveSection(sec.id)
        break
      }
    }
  }, [currentTab.sections])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const scrollTo = (id: string) => {
    setSidebarOpen(false)
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 88
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const activeSectionLabel =
    currentTab.sections.find(s => s.id === activeSection)?.label ?? 'Aperçu'

  return (
    <div className="min-h-screen bg-white">

      {/* ─────────────── SIDEBAR ─────────────── */}
      <aside
        className={`no-print fixed inset-y-0 left-0 z-50 w-72 bg-[#e2241b] text-white flex flex-col
          transition-transform duration-300 md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 h-[72px] border-b border-white/15 flex-shrink-0">
          <div className="bg-white rounded-lg p-1.5 flex-shrink-0">
            <img src={camrailLogo} alt="Logo CAMRAIL" className="h-8 w-auto object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-[15px] leading-tight tracking-tight">KALATI RAG</h1>
            <p className="text-[11px] text-white/70 leading-tight truncate">Documentation · CAMRAIL</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden ml-auto text-white/80 hover:text-white"
            aria-label="Fermer le menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/50">
            Documents
          </p>
          <div className="flex flex-col gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <div key={tab.id}>
                  <button
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors duration-200 ${
                      active
                        ? 'bg-white text-[#e2241b] shadow-sm'
                        : 'text-white/90 hover:bg-white/10'
                    }`}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-tight">{tab.label}</span>
                      <span className={`block text-[11px] leading-tight ${active ? 'text-[#e2241b]/60' : 'text-white/55'}`}>
                        {tab.subtitle}
                      </span>
                    </span>
                  </button>

                  {/* Section list for active doc */}
                  {active && (
                    <div className="mt-1 mb-2 ml-4 pl-3 border-l border-white/25 flex flex-col">
                      {tab.sections.map((sec) => {
                        const secActive = activeSection === sec.id
                        return (
                          <button
                            key={sec.id}
                            onClick={() => scrollTo(sec.id)}
                            className={`text-left text-[13px] py-1.5 pl-2 pr-2 rounded-md transition-colors duration-150 ${
                              secActive
                                ? 'text-white font-semibold bg-white/15'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
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
        </nav>

        {/* Sidebar footer */}
        <div className="flex-shrink-0 px-5 py-3 border-t border-white/15">
          <span className="flex items-center gap-2 text-[11px] text-white/70">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Système actif
          </span>
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

      {/* ─────────────── MAIN ─────────────── */}
      <div className="md:ml-72 print:ml-0">

        {/* Reading progress bar */}
        <div
          className="no-print fixed top-0 left-0 md:left-72 right-0 h-0.5 bg-[#e2241b] z-30 transition-all duration-100"
          style={{ width: `calc(${scrollPct}% )` }}
        />

        {/* Top bar */}
        <header className="no-print sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-[#f0d4d2]">
          <div className="flex items-center gap-3 px-4 sm:px-8 h-[72px]">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-[#1a1a1a] hover:text-[#e2241b]"
              aria-label="Ouvrir le menu"
            >
              <Menu size={22} />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm min-w-0">
              <span className="font-semibold text-[#1a1a1a] truncate">{currentTab.label}</span>
              <ChevronRight size={14} className="text-[#c9c9c9] flex-shrink-0" />
              <span className="text-[#7a7a7a] truncate">{activeSectionLabel}</span>
            </div>

            <button
              onClick={() => window.print()}
              title="Exporter le document affiché en PDF"
              className="ml-auto flex items-center gap-1.5 bg-[#e2241b] text-white hover:bg-[#b3160f] px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors flex-shrink-0"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="px-4 sm:px-8 lg:px-12 py-8 lg:py-10">
          {/* Print-only document header */}
          <div className="hidden print:block mb-6 pb-4 border-b-2 border-[#e2241b]">
            <p className="text-sm text-[#7a7a7a]">KALATI RAG · CAMRAIL</p>
            <h1 className="text-2xl font-bold text-[#1a1a1a]">{currentTab.label}</h1>
          </div>

          <div className="max-w-4xl">
            <ActiveComponent />
          </div>
        </main>

        {/* Footer */}
        <footer className="no-print border-t border-[#f0d4d2] px-4 sm:px-8 lg:px-12 py-6 mt-4">
          <div className="max-w-4xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <p className="text-xs text-[#7a7a7a]">
              KALATI RAG — Documentation technique · CAMRAIL
            </p>
            <p className="text-xs text-[#b0b0b0]">
              {currentTab.label}
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
