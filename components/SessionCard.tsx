import { Session } from '@/lib/types'

const FEELING_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']
const FEELING_LABELS = ['', 'Épuisé', 'Fatigué', 'Normal', 'Bien', 'Au top']

const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)

export default function SessionCard({ session, compact = false }: { session: Session; compact?: boolean }) {
  const date = new Date(session.date)
  const dateStr = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      padding: '16px 18px',
      transition: 'border-color 0.15s, box-shadow 0.15s',
      boxShadow: 'var(--shadow)',
      cursor: 'pointer',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--accent)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,69,0,0.1)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.boxShadow = 'var(--shadow)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, marginRight: 12 }}>
          <div className="condensed" style={{ fontSize: compact ? 16 : 18, fontWeight: 700, marginBottom: 3, lineHeight: 1.1 }}>
            {session.title}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: session.tags && session.tags.length > 0 ? 8 : 0 }}>
            {dateStr}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          {session.feeling && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: FEELING_COLORS[session.feeling],
                display: 'inline-block',
              }} />
              <span style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 500 }}>
                {FEELING_LABELS[session.feeling]}
              </span>
            </div>
          )}
          <span style={{ color: 'var(--text2)' }}><IconArrow /></span>
        </div>
      </div>

      {session.tags && session.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: compact ? 0 : 8 }}>
          {session.tags.map(t => (
            <span key={t} style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 20,
              background: 'var(--bg3)', color: 'var(--text2)',
              fontWeight: 500, letterSpacing: '0.02em',
            }}>
              {t}
            </span>
          ))}
        </div>
      )}

      {!compact && session.notes && (
        <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
          {session.notes.substring(0, 100)}{session.notes.length > 100 ? '...' : ''}
        </p>
      )}

      {compact && session.exercises && session.exercises.length > 0 && (
        <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text2)' }}>
          {session.exercises.length} exercice{session.exercises.length > 1 ? 's' : ''}
          {' · '}{session.exercises.slice(0, 3).map(e => e.name).join(', ')}
          {session.exercises.length > 3 ? '...' : ''}
        </p>
      )}
    </div>
  )
}