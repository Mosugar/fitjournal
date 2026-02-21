'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SearchClient() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(20)
      setResults(data || [])
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div style={{ padding: 20, background: '#0a0800', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 4, height: 28, background: '#f5c800' }} />
          <h1 style={{
            fontSize: 32, fontWeight: 900, color: '#f0ede0',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            fontFamily: "'Barlow Condensed', sans-serif",
          }}>Search</h1>
        </div>

        {/* Search input */}
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5a5648' }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search athletes..."
            style={{
              width: '100%', padding: '12px 16px 12px 42px',
              background: '#161410', border: '1px solid #2a2518',
              borderLeft: '3px solid #f5c800',
              color: '#f0ede0', fontSize: 14, outline: 'none',
              boxSizing: 'border-box', fontFamily: 'Barlow, sans-serif',
            }}
          />
        </div>
      </div>

      {loading && (
        <p style={{ color: '#5a5648', fontSize: 12, textAlign: 'center', letterSpacing: '0.1em', fontFamily: "'Barlow Condensed', sans-serif" }}>
          SEARCHING...
        </p>
      )}

      {!loading && query && results.length === 0 && (
        <div style={{
          background: '#161410', border: '1px solid #2a2518',
          padding: '32px 20px', textAlign: 'center',
        }}>
          <p style={{ color: '#5a5648', fontSize: 13 }}>No athletes found for "{query}"</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {results.map((profile) => (
          <Link key={profile.id} href={`/${profile.username}`} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: '#161410', border: '1px solid #2a2518',
              borderLeft: '3px solid #2a2518',
              padding: '12px 14px',
              transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderLeftColor = '#f5c800')}
              onMouseLeave={e => (e.currentTarget.style.borderLeftColor = '#2a2518')}
            >
              <div style={{ width: 44, height: 44, padding: 2, background: '#f5c800', flexShrink: 0 }}>
                <img
                  src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  alt="avatar"
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 16, fontWeight: 700, color: '#f0ede0',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}>
                  {profile.display_name}
                </div>
                <div style={{ fontSize: 11, color: '#5a5648' }}>@{profile.username}</div>
                {profile.sport && (
                  <span style={{
                    fontSize: 9, padding: '1px 7px',
                    background: '#f5c80011', color: '#f5c800',
                    border: '1px solid #f5c80033',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                    display: 'inline-block', marginTop: 4,
                  }}>
                    #{profile.sport}
                  </span>
                )}
              </div>
              <span style={{ color: '#f5c800', fontSize: 16 }}>→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}