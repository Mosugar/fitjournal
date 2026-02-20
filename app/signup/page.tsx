'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async () => {
    if (!email || !password || !username || !displayName) {
      return toast.error('Remplis tous les champs')
    }
    if (username.length < 3) return toast.error('Username trop court (min 3 caractères)')
    if (password.length < 6) return toast.error('Mot de passe trop court (min 6 caractères)')

    setLoading(true)

    // Check username disponible
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .single()

    if (existing) {
      toast.error('Ce username est déjà pris')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error || !data.user) {
      toast.error(error?.message || 'Erreur lors de l\'inscription')
      setLoading(false)
      return
    }

    // Créer le profil
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      username: username.toLowerCase(),
      display_name: displayName,
      bio: '',
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    })

    if (profileError) {
      toast.error('Erreur lors de la création du profil')
      setLoading(false)
      return
    }

    toast.success('Compte créé ! Bienvenue 🔥')
    router.push(`/${username.toLowerCase()}`)
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
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 36 }}>🔥</span>
            <span className="bebas" style={{ fontSize: 42, color: 'var(--accent)' }}>FITJOURNAL</span>
          </div>
          <p style={{ color: 'var(--text2)', fontSize: 14, margin: 0 }}>
            Crée ton compte et commence à logger
          </p>
        </div>

        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 24,
        }}>
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
                background: id === 'signup' ? 'var(--accent)' : 'transparent',
                color: id === 'signup' ? '#fff' : 'var(--text2)',
              }}>
                {label}
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input style={inputStyle} placeholder="Nom d'affichage" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            <input
              style={inputStyle}
              placeholder="Nom d'utilisateur (@username)"
              value={username}
              onChange={e => setUsername(e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase())}
            />
            <input style={inputStyle} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input
              style={inputStyle}
              type="password"
              placeholder="Mot de passe (min. 6 caractères)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSignup()}
            />
            <button
              onClick={handleSignup}
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
              {loading ? 'CRÉATION...' : 'CRÉER MON COMPTE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}