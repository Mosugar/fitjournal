'use client'

import { Profile, Session } from '@/lib/types'
import Link from 'next/link'

const FEELING_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']
const FEELING_LABELS = ['', 'Épuisé', 'Fatigué', 'Normal', 'Bien', 'Au top']

const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const IconDumbbell = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M6 4v16M18 4v16M3 8h4M17 8h4M3 16h4M17 16h4M7 12h10"/>
  </svg>
)

export default function ProfileClient({ profile, sessions, isOwn }: {
  profile: Profile; sessions: Session[]; isOwn: boolean
}) {
  const recentSessions = sessions.slice(0, 3)

  return (
    <div className="fadeUp">
      {/* Banner */}
      <div style={{
        height: 160,
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 40%, #ff4500 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Geometric pattern */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.08 }} viewBox="0 0 400 160">
          <line x1="0" y1="160" x2="160" y2="0" stroke="white" strokeWidth="1"/>
          <line x1="80" y1="160" x2="240" y2="0" stroke="white" strokeWidth="1"/>
          <line x1="160" y1="160" x2="320" y2="0" stroke="white" strokeWidth="1"/>
          <line x1="240" y1="160" x2="400" y2="0" stroke="white" strokeWidth="1"/>
          <line x1="320" y1="160" x2="480" y2="0" stroke="white" strokeWidth="1"/>
        </svg>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
          background: 'linear-gradient(transparent, var(--bg))',
        }} />
      </div>

      <div style={{ padding: '0 20px' }}>
        {/* Avatar row — avatar overlaps banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: -44, marginBottom: 14 }}>
          <div style={{ position: 'relative' }}>
            <img
              src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
              alt="avatar"
              style={{
                width: 80, height: 80, borderRadius: '50%',
                border: '3px solid var(--bg)',
                objectFit: 'cover',
                background: 'var(--bg3)',
                display: 'block',
              }}
            />
            {/* Online dot */}
            {isOwn && (
              <span style={{
                position: 'absolute', bottom: 4, right: 4,
                width: 12, height: 12, borderRadius: '50%',
                background: 'var(--green)',
                border: '2px solid var(--bg)',
              }} />
            )}
          </div>

          {isOwn && (
            <Link href={`/${profile.username}/edit`} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 8,
              background: 'var(--bg3)', border: '1px solid var(--border)',
              color: 'var(--text)', textDecoration: 'none',
              fontSize: 13, fontWeight: 500,
            }}>
              <IconEdit /> Modifier
            </Link>
          )}
        </div>

        {/* Name & bio */}
        <div style={{ marginBottom: 20 }}>
          <h1 className="condensed" style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, marginBottom: 2 }}>
            {profile.display_name}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>@{profile.username}</p>
          {profile.bio && (
            <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5, fontWeight: 400 }}>{profile.bio}</p>
          )}
        </div>

        {/* Stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: 8, marginBottom: 28,
        }}>
          {[
            { label: 'Séances', value: sessions.length },
            { label: 'Streak', value: '–' },
            { label: 'Plans', value: 3 },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '14px 12px',
              textAlign: 'center',
              boxShadow: 'var(--shadow)',
            }}>
              <div className="condensed" style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)', lineHeight: 1, marginBottom: 2 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Recent sessions */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 className="condensed" style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Séances récentes
            </h2>
            <Link href={`/${profile.username}/journal`} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              color: 'var(--accent)', textDecoration: 'none',
              fontSize: 13, fontWeight: 500,
            }}>
              Voir tout <IconArrow />
            </Link>
          </div>

          {recentSessions.length === 0 ? (
            <div style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '36px 20px', textAlign: 'center',
              boxShadow: 'var(--shadow)',
            }}>
              <div style={{ color: 'var(--text2)', marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                <IconDumbbell />
              </div>
              <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 16 }}>
                {isOwn ? 'Lance ta première séance !' : 'Aucune séance pour l\'instant'}
              </p>
              {isOwn && (
                <Link href={`/${profile.username}/journal/add`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '10px 20px', borderRadius: 10,
                  background: 'var(--accent)', color: '#fff',
                  textDecoration: 'none', fontSize: 14, fontWeight: 600,
                }}>
                  <IconPlus /> Nouvelle séance
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentSessions.map((s, i) => (
                <Link key={s.id} href={`/${profile.username}/journal/${s.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'var(--card)', border: '1px solid var(--border)',
                    borderRadius: 14, padding: '14px 16px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    boxShadow: 'var(--shadow)',
                    animationDelay: `${i * 0.05}s`,
                  }}
                    className="fadeUp"
                  >
                    <div>
                      <div className="condensed" style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{s.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                        {new Date(s.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        {s.exercises && s.exercises.length > 0 && ` · ${s.exercises.length} exercices`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {s.feeling && (
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: FEELING_COLORS[s.feeling],
                          display: 'inline-block',
                        }} />
                      )}
                      <span style={{ color: 'var(--text2)' }}><IconArrow /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}