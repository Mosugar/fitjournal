'use client'

import { Session } from '@/lib/types'
import { useState } from 'react'
import Link from 'next/link'

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const FEELING_COLORS = ['', '#555', '#888', '#f5c800', '#f5c800', '#f5c800']

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
  const monthStr = new Date(calYear, calMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div style={{ padding: 20, background: '#0a0800', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 4, height: 28, background: '#f5c800' }} />
          <h1 style={{
            fontSize: 32, fontWeight: 900, color: '#f0ede0',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            fontFamily: "'Barlow Condensed', sans-serif",
          }}>Journal</h1>
        </div>
        {isOwn && (
          <Link href={`/${username}/journal/add`} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px',
            background: '#f5c800', color: '#0a0800',
            textDecoration: 'none', fontSize: 12, fontWeight: 900,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            fontFamily: "'Barlow Condensed', sans-serif",
          }}>
            <IconPlus /> NEW SESSION
          </Link>
        )}
      </div>

      {/* View toggle */}
      <div style={{
        display: 'inline-flex',
        background: '#161410',
        border: '1px solid #2a2518',
        marginBottom: 20, gap: 0,
      }}>
        {([['list', 'LIST'], ['calendar', 'CALENDAR']] as const).map(([v, label]) => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '7px 16px', border: 'none', cursor: 'pointer',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
            fontFamily: "'Barlow Condensed', sans-serif",
            background: view === v ? '#f5c800' : 'transparent',
            color: view === v ? '#0a0800' : '#5a5648',
            transition: 'all 0.15s',
          }}>
            {label}
          </button>
        ))}
      </div>

      {view === 'list' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sessions.length === 0 ? (
            <div style={{
              background: '#161410', border: '1px solid #2a2518',
              padding: '48px 20px', textAlign: 'center',
            }}>
              <p style={{ color: '#5a5648', fontSize: 14 }}>No sessions recorded</p>
            </div>
          ) : (
            sessions.map((s, i) => (
              <Link key={s.id} href={`/${username}/journal/${s.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#161410',
                  border: '1px solid #2a2518',
                  borderLeft: `3px solid ${i === 0 ? '#f5c800' : '#2a2518'}`,
                  padding: '12px 14px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'border-color 0.15s',
                }}>
                  <div>
                    <div style={{
                      fontSize: 16, fontWeight: 800, color: '#f0ede0',
                      textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2,
                      fontFamily: "'Barlow Condensed', sans-serif",
                    }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: 11, color: '#5a5648' }}>
                      {new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {s.exercises && s.exercises.length > 0 && ` · ${s.exercises.length} exercises`}
                    </div>
                    {s.tags && s.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                        {s.tags.map(t => (
                          <span key={t} style={{
                            fontSize: 10, padding: '2px 7px',
                            background: '#0a0800', color: '#5a5648',
                            border: '1px solid #2a2518',
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                          }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {s.feeling && (
                      <span style={{
                        width: 6, height: 6,
                        background: FEELING_COLORS[s.feeling], display: 'inline-block',
                      }} />
                    )}
                    <span style={{ color: '#f5c800', fontSize: 16 }}>→</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      ) : (
        <div style={{
          background: '#161410', border: '1px solid #2a2518', padding: 20,
        }}>
          {/* Nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <button onClick={() => {
              if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
              else setCalMonth(m => m - 1)
            }} style={{
              background: 'transparent', border: '1px solid #2a2518',
              width: 32, height: 32, cursor: 'pointer', color: '#f0ede0', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>‹</button>

            <span style={{
              fontSize: 16, fontWeight: 700, color: '#f0ede0',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              fontFamily: "'Barlow Condensed', sans-serif",
            }}>{monthStr}</span>

            <button onClick={() => {
              if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
              else setCalMonth(m => m + 1)
            }} style={{
              background: 'transparent', border: '1px solid #2a2518',
              width: 32, height: 32, cursor: 'pointer', color: '#f0ede0', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>›</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} style={{
                textAlign: 'center', fontSize: 10, color: '#5a5648',
                fontWeight: 700, padding: '4px 0', letterSpacing: '0.1em',
                fontFamily: "'Barlow Condensed', sans-serif",
              }}>{d}</div>
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
                        background: '#f5c800', color: '#0a0800',
                        fontSize: 12, fontWeight: 900, cursor: 'pointer',
                        fontFamily: "'Barlow Condensed', sans-serif",
                      }}>{day}</div>
                    </Link>
                  ) : (
                    <div style={{
                      aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: isToday ? 700 : 400,
                      background: isToday ? '#2a2518' : 'transparent',
                      color: isToday ? '#f0ede0' : '#5a5648',
                      border: isToday ? '1px solid #f5c80044' : 'none',
                      fontFamily: "'Barlow Condensed', sans-serif",
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