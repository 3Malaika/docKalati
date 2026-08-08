import { useState, useEffect, useCallback } from 'react'
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
    <div className="min-h-screen bg-[#f4f6f9]">

      {/* ── Reading progress bar ── */}
      <div
        className="fixed top-0 left-0 h-0.5 bg-[#e63329] z-50 transition-all duration-100"
        style={{ width: `${scrollPct}%` }}
      />

      {/* ── Sticky top shell ── */}
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-[#e5e9ef]">

        {/* Brand header */}
        <div className="bg-[#0f1923] text-white">
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
              <p className="text-xs text-white/50 leading-tight">
                Portail de documentation · CAMRAIL
              </p>
            </div>
            <div className="ml-auto hidden sm:flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-3 py-1 rounded-full text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Système actif
              </span>
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
                    ? 'border-[#e63329] text-[#e63329] bg-red-50/40'
                    : 'border-transparent text-[#6b7a8d] hover:text-[#0f1923] hover:border-[#d1d9e0]'
                }`}
              >
                <span className="block leading-tight">{tab.label}</span>
                <span className="block text-[10px] font-normal opacity-60">{tab.subtitle}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section nav (horizontal, per-tab) */}
        <div className="border-t border-[#e5e9ef] bg-[#fafbfc]">
          <div className="max-w-screen-xl mx-auto px-5">
            <div className="flex gap-0 overflow-x-auto py-0.5">
              {currentTab.sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollTo(sec.id)}
                  className={`flex-shrink-0 px-4 py-2 text-xs font-medium transition-all duration-200 whitespace-nowrap rounded-sm ${
                    activeSection === sec.id
                      ? 'text-[#e63329] bg-red-50 font-semibold'
                      : 'text-[#6b7a8d] hover:text-[#0f1923] hover:bg-slate-100'
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
      <footer className="bg-[#0f1923] text-white/40 text-center py-5 text-xs border-t border-[#1e2d3d] mt-8">
        KALATI RAG — Documentation technique · CAMRAIL
      </footer>
    </div>
  )
}
