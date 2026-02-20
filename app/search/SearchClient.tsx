'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

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
    <div style={{ padding: 20 }} className="fadeUp">
      <h1 className="condensed" style={{ fontSize: 32, fontWeight: 900, textTransform: 'uppercase', marginBottom: 20 }}>Recherche</h1>

      {/* Search input */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)' }}>
          <IconSearch />
        </div>
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Cherche un utilisateur..."
          style={{
            width: '100%', padding: '12px 16px 12px 44px',
            borderRadius: 12, background: 'var(--card)',
            border: '1px solid var(--border)', color: 'var(--text)',
            fontSize: 15, outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Results */}
      {loading && (
        <p style={{ color: 'var(--text2)', fontSize: 14, textAlign: 'center' }}>Recherche...</p>
      )}

      {!loading && query && results.length === 0 && (
        <p style={{ color: 'var(--text2)', fontSize: 14, textAlign: 'center', padding: '32px 0' }}>
          Aucun utilisateur trouvé pour "{query}"
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {results.map((profile, i) => (
          <Link key={profile.id} href={`/${profile.username}`} style={{ textDecoration: 'none', animationDelay: `${i * 0.04}s` }} className="fadeUp">
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '12px 16px',
              boxShadow: 'var(--shadow)',
              transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <img
                src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }}
                alt="avatar"
              />
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{profile.display_name}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>@{profile.username}</div>
                {profile.bio && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{profile.bio.substring(0, 60)}{profile.bio.length > 60 ? '...' : ''}</div>}
              </div>
              <div style={{ marginLeft: 'auto', color: 'var(--text2)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}