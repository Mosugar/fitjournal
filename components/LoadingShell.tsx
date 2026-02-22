'use client'

// Static shell with navbar — shown during loading.tsx states.
// No props, no data fetching — just the layout so the nav never disappears.

const G = {
  black: '#0a0800',
  bg: '#0f0d00',
  gold: '#f5c800',
  grey: '#3a3428',
  border: '#2a2518',
}

const IconProfile = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
)
const IconFeed = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const IconJournal = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="4" y="3" width="16" height="18" rx="2"/>
    <line x1="8" y1="8" x2="16" y2="8"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
    <line x1="8" y1="16" x2="12" y2="16"/>
  </svg>
)
const IconSearch = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconMessage = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)

const TABS = [
  { id: 'profile', icon: <IconProfile />, label: 'PROFILE' },
  { id: 'feed',    icon: <IconFeed />,    label: 'FEED' },
  { id: 'log',     icon: <IconJournal />, label: 'LOG' },
  { id: 'search',  icon: <IconSearch />,  label: 'SEARCH' },
  { id: 'msg',     icon: <IconMessage />, label: 'MSG' },
]

export default function LoadingShell({ children, activeTab }: {
  children: React.ReactNode
  activeTab?: string
}) {
  return (
    <div style={{ background: G.black, minHeight: '100vh' }}>

      {/* Top header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: G.bg, borderBottom: `1px solid ${G.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 48, maxWidth: '100%',
      }}>
        <span style={{
          fontSize: 20, fontWeight: 900, color: G.gold,
          fontFamily: "'Barlow Condensed', sans-serif",
          letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>FITJOURN</span>
        {/* Placeholder for right side icons */}
        <div style={{ width: 80 }} />
      </header>

      {/* Content */}
      <main style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 72 }}>
        {children}
      </main>

      {/* Bottom nav — static, no active state during loading */}
      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        background: G.bg, borderTop: `1px solid ${G.border}`,
        display: 'flex', zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
      }}>
        {TABS.map(t => {
          const active = t.id === activeTab
          return (
            <div key={t.id} style={{
              flex: 1, padding: '10px 0 8px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              position: 'relative',
              color: active ? G.gold : G.grey,
            }}>
              {active && (
                <span style={{
                  position: 'absolute', top: 0, left: '50%',
                  transform: 'translateX(-50%)',
                  width: 24, height: 2, background: G.gold,
                }} />
              )}
              {t.icon}
              <span style={{
                fontSize: 8, fontWeight: 700, letterSpacing: '0.08em',
                fontFamily: "'Barlow Condensed', sans-serif",
              }}>{t.label}</span>
            </div>
          )
        })}
      </nav>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&display=swap');`}</style>
    </div>
  )
}