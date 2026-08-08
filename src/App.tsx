import { useState, useEffect, useCallback } from 'react'
import { Download } from 'lucide-react'
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
]

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState(TABS[0].id)
  const [activeSection, setActiveSection] = useState('')
  const [scrollPct, setScrollPct] = useState(0)

  const currentTab = TABS.find(t => t.id === activeTab)!

  // Reset scroll + active section on tab change
  const handleTabChange = (id: string) => {
    setActiveTab(id)
    setActiveSection('')
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
      if (el && el.getBoundingClientRect().top <= 130) {
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
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 108
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── Reading progress bar ── */}
      <div
        className="no-print fixed top-0 left-0 h-0.5 bg-[#e2241b] z-50 transition-all duration-100"
        style={{ width: `${scrollPct}%` }}
      />

      {/* ── Sticky top shell ── */}
      <div className="no-print sticky top-0 z-40 bg-white shadow-sm border-b border-[#f0d4d2]">

        {/* Brand header */}
        <div className="bg-[#e2241b] text-white">
          <div className="max-w-screen-xl mx-auto px-5 py-3 flex items-center gap-4">
            <div className="bg-white rounded-lg p-1 flex-shrink-0">
              <img
                src={camrailLogo}
                alt="Logo CAMRAIL"
                className="h-9 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight tracking-tight">
                KALATI RAG
              </h1>
              <p className="text-xs text-white/70 leading-tight">
                Portail de documentation · CAMRAIL
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1.5 bg-white/15 text-white border border-white/30 px-3 py-1 rounded-full text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Système actif
              </span>
              <button
                onClick={() => window.print()}
                title="Exporter le document affiché en PDF"
                className="flex items-center gap-1.5 bg-white text-[#e2241b] hover:bg-red-50 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-colors"
              >
                <Download size={13} />
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Document tabs */}
        <div className="max-w-screen-xl mx-auto px-5">
          <div className="flex gap-0 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-shrink-0 px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-[#e2241b] text-[#e2241b] bg-red-50/60'
                    : 'border-transparent text-[#7a7a7a] hover:text-[#1a1a1a] hover:border-[#f0d4d2]'
                }`}
              >
                <span className="block leading-tight">{tab.label}</span>
                <span className="block text-[10px] font-normal opacity-60">{tab.subtitle}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section nav (horizontal, per-tab) */}
        <div className="border-t border-[#f0d4d2] bg-[#fff5f4]">
          <div className="max-w-screen-xl mx-auto px-5">
            <div className="flex gap-0 overflow-x-auto py-0.5">
              {currentTab.sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollTo(sec.id)}
                  className={`flex-shrink-0 px-4 py-2 text-xs font-medium transition-all duration-200 whitespace-nowrap rounded-sm ${
                    activeSection === sec.id
                      ? 'text-[#e2241b] bg-red-100 font-semibold'
                      : 'text-[#7a7a7a] hover:text-[#1a1a1a] hover:bg-red-50'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="max-w-screen-xl mx-auto px-5 lg:px-10 py-8">
        <div className="max-w-4xl">
          {activeTab === 'guide'   && <GuideTechnique />}
          {activeTab === 'manuel'  && <ManuelUtilisateur />}
          {activeTab === 'rapport' && <RapportConception />}
          {activeTab === 'tests'   && <TestRecette />}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="no-print bg-[#e2241b] text-white/80 text-center py-5 text-xs border-t border-[#b3160f] mt-8">
        KALATI RAG — Documentation technique · CAMRAIL
      </footer>
    </div>
  )
}
