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
    if (error) { toast.error('Email ou mot de passe incorrect'); setLoading(false); return }
    const { data: profile } = await supabase.from('profiles').select('username').eq('id', data.user.id).single()
    toast.success('Connecté ! 💪')
    router.push(profile ? `/${profile.username}` : '/')
    router.refresh()
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    background: 'var(--bg3)', border: '1px solid var(--border)',
    color: 'var(--text)', fontSize: 15, outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20, position: 'relative', overflow: 'hidden' }}>
      {/* BG decoration */}
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