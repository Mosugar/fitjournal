'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async () => {
    if (!email || !password) return toast.error('Remplis tous les champs')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error('Email ou mot de passe incorrect')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', data.user.id)
      .single()

    toast.success('Connecté ! 🔥')
    router.push(profile ? `/${profile.username}` : '/')
    router.refresh()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 10,
    background: 'var(--bg3)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    fontSize: 15,
    outline: 'none',
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: 20,
    }}>
      {/* Background decoration */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, #ff450015 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, #00c8ff10 0%, transparent 70%)',
        }} />
      </div>

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 36 }}>🔥</span>
            <span className="bebas" style={{ fontSize: 42, color: 'var(--accent)' }}>FITJOURNAL</span>
          </div>
          <p style={{ color: 'var(--text2)', fontSize: 14, margin: 0 }}>
            Ton journal d'entraînement social
          </p>
        </div>

        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 24,
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            background: 'var(--bg3)',
            borderRadius: 10,
            padding: 4,
            marginBottom: 24,
          }}>
            {[['login', 'CONNEXION', '/login'], ['signup', 'INSCRIPTION', '/signup']].map(([id, label, href]) => (
              <Link key={id} href={href} style={{
                flex: 1, padding: '8px', borderRadius: 8, textAlign: 'center',
                fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, letterSpacing: '0.1em',
                textDecoration: 'none',
                background: id === 'login' ? 'var(--accent)' : 'transparent',
                color: id === 'login' ? '#fff' : 'var(--text2)',
              }}>
                {label}
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              style={inputStyle}
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            <input
              style={inputStyle}
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                padding: '12px 20px',
                borderRadius: 10,
                background: loading ? 'var(--bg3)' : 'var(--accent)',
                color: '#fff',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 16,
                letterSpacing: '0.1em',
                marginTop: 4,
              }}
            >
              {loading ? 'CONNEXION...' : 'SE CONNECTER'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}