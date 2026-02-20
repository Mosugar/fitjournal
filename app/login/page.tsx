'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async () => {
    if (!email || !password) return toast.error('Remplis tous les champs')
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { toast.error('Email ou mot de passe incorrect'); setLoading(false); return }
    const { data: profile } = await supabase.from('profiles').select('username').eq('id', data.user.id).single()
    toast.success('Connecté ! 💪')
    router.push(profile ? `/${profile.username}` : '/')
    router.refresh()
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { toast.error('Erreur Google'); setGoogleLoading(false) }
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    background: 'var(--bg3)', border: '1px solid var(--border)',
    color: 'var(--text)', fontSize: 15, outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)', padding: 20,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-30%', right: '-20%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,69,0,0.06) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-20%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,102,255,0.04) 0%, transparent 70%)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 1 }} className="fadeUp">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 className="condensed" style={{ fontSize: 52, fontWeight: 900, color: 'var(--accent)', letterSpacing: '0.06em', lineHeight: 1, marginBottom: 8 }}>
            FITJOURNAL
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Ton journal d'entraînement social</p>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 28, boxShadow: 'var(--shadow-lg)' }}>
          
          {/* Tabs */}
          <div style={{ display: 'flex', background: 'var(--bg3)', borderRadius: 12, padding: 3, marginBottom: 24, gap: 3 }}>
            {[['login', 'Connexion', '/login'], ['signup', 'Inscription', '/signup']].map(([id, label, href]) => (
              <Link key={id} href={href} style={{
                flex: 1, padding: '9px', borderRadius: 10, textAlign: 'center',
                fontWeight: 600, fontSize: 14, textDecoration: 'none', transition: 'all 0.15s',
                background: id === 'login' ? 'var(--accent)' : 'transparent',
                color: id === 'login' ? '#fff' : 'var(--text2)',
                boxShadow: id === 'login' ? '0 2px 8px rgba(255,69,0,0.3)' : 'none',
              }}>{label}</Link>
            ))}
          </div>

          {/* Google */}
          <button onClick={handleGoogle} disabled={googleLoading} style={{
            width: '100%', padding: '12px', borderRadius: 12, marginBottom: 16,
            background: 'var(--bg3)', border: '1px solid var(--border)',
            color: 'var(--text)', cursor: googleLoading ? 'not-allowed' : 'pointer',
            fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 10, opacity: googleLoading ? 0.7 : 1,
            boxSizing: 'border-box',
          }}>
            <GoogleIcon />
            {googleLoading ? 'Redirection...' : 'Continuer avec Google'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>ou</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Email form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input style={inp} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            <input style={inp} type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            <button onClick={handleLogin} disabled={loading} style={{
              padding: '13px', borderRadius: 12, marginTop: 4,
              background: loading ? 'var(--bg3)' : 'var(--accent)',
              color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 15, fontWeight: 700, letterSpacing: '0.02em',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(255,69,0,0.3)',
              transition: 'all 0.15s',
            }}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}