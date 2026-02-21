import { Session } from '@/lib/types'

const FEELING_LABELS = ['', 'Exhausted', 'Tired', 'Normal', 'Good', 'On fire']

export default function SessionCard({ session, compact = false }: { session: Session; compact?: boolean }) {
  const date = new Date(session.date)
  const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{
      background: '#161410',
      border: '1px solid #2a2518',
      borderLeft: '3px solid #2a2518',
      padding: '14px 16px',
      transition: 'border-color 0.15s',
      cursor: 'pointer',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderLeftColor = '#f5c800')}
      onMouseLeave={e => (e.currentTarget.style.borderLeftColor = '#2a2518')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, marginRight: 12 }}>
          <div style={{
            fontSize: compact ? 15 : 17, fontWeight: 800, marginBottom: 3,
            color: '#f0ede0', textTransform: 'uppercase', letterSpacing: '0.04em',
            fontFamily: "'Barlow Condensed', sans-serif",
          }}>
            {session.title}
          </div>
          <div style={{ fontSize: 11, color: '#5a5648', marginBottom: session.tags && session.tags.length > 0 ? 8 : 0 }}>
            {dateStr}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          {session.feeling && (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '2px 7px',
              background: '#f5c80011', color: '#f5c800',
              border: '1px solid #f5c80022',
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              {FEELING_LABELS[session.feeling]}
            </span>
          )}
          <span style={{ color: '#f5c800', fontSize: 16 }}>→</span>
        </div>
      </div>

      {session.tags && session.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: compact ? 0 : 8 }}>
          {session.tags.map(t => (
            <span key={t} style={{
              fontSize: 10, padding: '2px 7px',
              background: '#0a0800', color: '#5a5648',
              border: '1px solid #2a2518',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              {t}
            </span>
          ))}
        </div>
      )}

      {!compact && session.notes && (
        <p style={{ margin: '8px 0 0', fontSize: 13, color: '#5a5648', lineHeight: 1.5 }}>
          {session.notes.substring(0, 100)}{session.notes.length > 100 ? '...' : ''}
        </p>
      )}

      {compact && session.exercises && session.exercises.length > 0 && (
        <p style={{ margin: '4px 0 0', fontSize: 11, color: '#5a5648' }}>
          {session.exercises.length} exercise{session.exercises.length > 1 ? 's' : ''}
          {' · '}{session.exercises.slice(0, 3).map(e => e.name).join(', ')}
          {session.exercises.length > 3 ? '...' : ''}
        </p>
      )}
    </div>
  )
}