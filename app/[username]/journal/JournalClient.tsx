'use client'

import { Session } from '@/lib/types'
import { useState } from 'react'
import Link from 'next/link'
import SessionCard from '@/components/SessionCard'

const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

export default function JournalClient({ sessions, isOwn, username }: {
  sessions: Session[]; isOwn: boolean; username: string
}) {
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const today = new Date()
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [calYear, setCalYear] = useState(today.getFullYear())

  const sessionDates = new Set(sessions.map(s => s.date))
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate()
  const getFirstDay = (y: number, m: number) => (new Date(y, m, 1).getDay() + 6) % 7
  const monthStr = new Date(calYear, calMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div style={{ padding: 20 }} className="fadeUp">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="condensed" style={{ fontSize: 32, fontWeight: 900, textTransform: 'uppercase' }}>Journal</h1>
        {isOwn && (
          <Link href={`/${username}/journal/add`} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', borderRadius: 10,
            background: 'var(--accent)', color: '#fff',
            textDecoration: 'none', fontSize: 14, fontWeight: 600,
          }}>
            <IconPlus /> Séance
          </Link>
        )}
      </div>

      {/* View toggle */}
      <div style={{
        display: 'inline-flex',
        background: 'var(--bg3)', borderRadius: 10, padding: 3,
        marginBottom: 20, gap: 2,
      }}>
        {([['list', 'Liste'], ['calendar', 'Calendrier']] as const).map(([v, label]) => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
            background: view === v ? 'var(--card)' : 'transparent',
            color: view === v ? 'var(--text)' : 'var(--text2)',
            boxShadow: view === v ? 'var(--shadow)' : 'none',
          }}>
            {label}
          </button>
        ))}
      </div>

      {view === 'list' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sessions.length === 0 ? (
            <div style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '48px 20px', textAlign: 'center',
            }}>
              <p style={{ color: 'var(--text2)', fontSize: 14 }}>Aucune séance enregistrée</p>
            </div>
          ) : (
            sessions.map((s, i) => (
              <Link key={s.id} href={`/${username}/journal/${s.id}`} style={{ textDecoration: 'none', animationDelay: `${i * 0.04}s` }} className="fadeUp">
                <SessionCard session={s} />
              </Link>
            ))
          )}
        </div>
      ) : (
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 16, padding: 20, boxShadow: 'var(--shadow)',
        }}>
          {/* Nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <button onClick={() => {
              if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
              else setCalMonth(m => m - 1)
            }} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: 'var(--text)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>

            <span className="condensed" style={{ fontSize: 18, fontWeight: 700, textTransform: 'capitalize' }}>{monthStr}</span>

            <button onClick={() => {
              if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
              else setCalMonth(m => m + 1)
            }} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: 'var(--text)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 11, color: 'var(--text2)', fontWeight: 600, padding: '4px 0', letterSpacing: '0.05em' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {Array.from({ length: getFirstDay(calYear, calMonth) }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: getDaysInMonth(calYear, calMonth) }).map((_, i) => {
              const day = i + 1
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const hasSession = sessionDates.has(dateStr)
              const isToday = dateStr === today.toISOString().split('T')[0]
              const session = sessions.find(s => s.date === dateStr)

              return (
                <div key={day}>
                  {hasSession && session ? (
                    <Link href={`/${username}/journal/${session.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: 8, fontSize: 13, fontWeight: 700,
                        background: 'var(--accent)', color: '#fff', cursor: 'pointer',
                      }}>{day}</div>
                    </Link>
                  ) : (
                    <div style={{
                      aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 8, fontSize: 13,
                      background: isToday ? 'var(--bg3)' : 'transparent',
                      color: isToday ? 'var(--text)' : 'var(--text2)',
                      border: isToday ? '1px solid var(--border)' : 'none',
                      fontWeight: isToday ? 600 : 400,
                    }}>{day}</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}