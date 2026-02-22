'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

// Created once outside component — not on every render
const supabase = createClient()

type Profile = {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  sport: string | null
}

type SessionResult = {
  id: string
  title: string
  date: string
  tags: string[]
  profiles: { username: string; display_name: string; avatar_url: string | null } | null
}

type Tab = 'athletes' | 'sessions'

export default function SearchClient() {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<Tab>('athletes')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [sessions, setSessions] = useState<SessionResult[]>([])
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (abortRef.current) clearTimeout(abortRef.current)
    if (!query.trim()) { setProfiles([]); setSessions([]); return }

    abortRef.current = setTimeout(async () => {
      setLoading(true)
      const [{ data: profileData }, { data: sessionData }] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url, sport')
          .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
          .limit(20),
        supabase
          .from('sessions')
          .select('id, title, date, tags, profiles(username, display_name, avatar_url)')
          .ilike('title', `%${query}%`)
          .limit(10),
      ])
      setProfiles(profileData || [])
      setSessions((sessionData || []) as any)
      setLoading(false)
    }, 300)

    return () => { if (abortRef.current) clearTimeout(abortRef.current) }
  }, [query])

  const inp: React.CSSProperties = {
    width: '100%', padding: '12px 16px 12px 42px',
    background: '#161410', border: '1px solid #2a2518',
    borderLeft: '3px solid #f5c800',
    color: '#f0ede0', fontSize: 14, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'Barlow, sans-serif',
  }

  const hasResults = profiles.length > 0 || sessions.length > 0

  return (
    <div style={{ padding: 20, background: '#0a0800', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 4, height: 28, background: '#f5c800' }} />
        <h1 style={{
          fontSize: 32, fontWeight: 900, color: '#f0ede0',
          textTransform: 'uppercase', letterSpacing: '0.06em',
          fontFamily: "'Barlow Condensed', sans-serif",
        }}>Search</h1>
      </div>

      {/* Input */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5a5648' }}
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search athletes or sessions..."
          style={inp}
        />
        {loading && (
          <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 3 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 4, height: 4, borderRadius: '50%', background: '#f5c800',
                animation: `pulse 1s ease-in-out ${i * 0.15}s infinite`,
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Tabs — only show when there are results */}
      {hasResults && (
        <div style={{ display: 'inline-flex', background: '#161410', border: '1px solid #2a2518', marginBottom: 16 }}>
          {([['athletes', `ATHLETES (${profiles.length})`], ['sessions', `SESSIONS (${sessions.length})`]] as const).map(([v, label]) => (
            <button key={v} onClick={() => setTab(v)} style={{
              padding: '7px 16px', border: 'none', cursor: 'pointer',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
              fontFamily: "'Barlow Condensed', sans-serif",
              background: tab === v ? '#f5c800' : 'transparent',
              color: tab === v ? '#0a0800' : '#5a5648',
              transition: 'all 0.15s',
            }}>{label}</button>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && query && !hasResults && (
        <div style={{ background: '#161410', border: '1px solid #2a2518', padding: '32px 20px', textAlign: 'center' }}>
          <p style={{ color: '#5a5648', fontSize: 13 }}>No results for "{query}"</p>
        </div>
      )}

      {/* Athletes */}
      {tab === 'athletes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {profiles.map(profile => (
            <Link key={profile.id} href={`/${profile.username}`} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: '#161410', border: '1px solid #2a2518',
                borderLeft: '3px solid #2a2518', padding: '12px 14px',
                transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderLeftColor = '#f5c800')}
                onMouseLeave={e => (e.currentTarget.style.borderLeftColor = '#2a2518')}
              >
                <div style={{ width: 44, height: 44, padding: 2, background: '#f5c800', flexShrink: 0, position: 'relative' }}>
                  <Image
                    src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                    alt={profile.display_name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="44px"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 16, fontWeight: 700, color: '#f0ede0',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}>{profile.display_name}</div>
                  <div style={{ fontSize: 11, color: '#5a5648' }}>@{profile.username}</div>
                  {profile.sport && (
                    <span style={{
                      fontSize: 9, padding: '1px 7px', marginTop: 4, display: 'inline-block',
                      background: '#f5c80011', color: '#f5c800',
                      border: '1px solid #f5c80033',
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}>#{profile.sport}</span>
                  )}
                </div>
                <span style={{ color: '#f5c800', fontSize: 16 }}>→</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Sessions */}
      {tab === 'sessions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sessions.map((s: any) => (
            <Link key={s.id} href={`/${s.profiles?.username}/journal/${s.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#161410', border: '1px solid #2a2518',
                borderLeft: '3px solid #2a2518', padding: '12px 14px',
                transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderLeftColor = '#f5c800')}
                onMouseLeave={e => (e.currentTarget.style.borderLeftColor = '#2a2518')}
              >
                <div style={{
                  fontSize: 15, fontWeight: 700, color: '#f0ede0',
                  textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4,
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}>{s.title}</div>
                <div style={{ fontSize: 11, color: '#5a5648', marginBottom: s.tags?.length ? 6 : 0 }}>
                  @{s.profiles?.username} · {new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                {s.tags?.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {s.tags.map((t: string) => (
                      <span key={t} style={{
                        fontSize: 9, padding: '1px 6px',
                        background: '#0a0800', color: '#5a5648',
                        border: '1px solid #2a2518',
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                      }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}