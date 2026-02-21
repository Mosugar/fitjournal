'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleGoogle = async () => {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { toast.error('Google error'); setGoogleLoading(false) }
  }

  const handleSignup = async () => {
    if (!email || !password || !username || !displayName) return toast.error('Fill in all fields')
    if (username.length < 3) return toast.error('Username too short (min 3 chars)')
    if (password.length < 6) return toast.error('Password too short (min 6 chars)')
    setLoading(true)

    const { data: existing } = await supabase.from('profiles').select('id').eq('username', username.toLowerCase()).single()
    if (existing) { toast.error('Username already taken'); setLoading(false); return }

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error || !data.user) { toast.error(error?.message || 'Signup error'); setLoading(false); return }

    await supabase.from('profiles').insert({
      id: data.user.id,
      username: username.toLowerCase(),
      display_name: displayName,
      bio: '',
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    })

    toast.success('Account created! Welcome 🔥')
    router.push(`/${username.toLowerCase()}`)
    router.refresh()
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '12px 16px',
    background: '#111007', border: '1px solid #2a2518',
    color: '#f0ede0', fontSize: 14, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'Barlow, sans-serif',
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0a0800', padding: 20,
      position: 'relative', overflow: 'hidden',
    }}>
      <svg style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', opacity: 0.04, pointerEvents: 'none' }} viewBox="0 0 400 800">
        {[0, 50, 100, 150, 200, 250, 300, 350, 400, 450].map(x => (
          <line key={x} x1={x} y1="0" x2={x - 800} y2="800" stroke="#f5c800" strokeWidth="1" />
        ))}
      </svg>

      <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-block', borderBottom: '3px solid #f5c800', paddingBottom: 8, marginBottom: 12 }}>
            <h1 style={{
              fontSize: 52, fontWeight: 900, color: '#f5c800',
              letterSpacing: '0.1em', lineHeight: 1,
              fontFamily: "'Barlow Condensed', sans-serif",
            }}>
              FITJOURNAL
            </h1>
          </div>
          <p style={{ color: '#5a5648', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Barlow Condensed', sans-serif" }}>
            Create your account
          </p>
        </div>

        <div style={{ background: '#161410', border: '1px solid #2a2518', borderTop: '3px solid #f5c800', padding: 28 }}>

          {/* Tabs */}
          <div style={{ display: 'flex', marginBottom: 24, borderBottom: '1px solid #2a2518' }}>
            {[['login', 'Sign In', '/login'], ['signup', 'Sign Up', '/signup']].map(([id, label, href]) => (
              <Link key={id} href={href} style={{
                flex: 1, padding: '10px', textAlign: 'center',
                fontWeight: 700, fontSize: 12, textDecoration: 'none',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                fontFamily: "'Barlow Condensed', sans-serif",
                color: id === 'signup' ? '#f5c800' : '#5a5648',
                borderBottom: id === 'signup' ? '2px solid #f5c800' : '2px solid transparent',
                marginBottom: -1,
              }}>{label}</Link>
            ))}
          </div>

          {/* Google */}
          <button onClick={handleGoogle} disabled={googleLoading} style={{
            width: '100%', padding: '11px', marginBottom: 16,
            background: 'transparent', border: '1px solid #2a2518',
            color: '#f0ede0', cursor: googleLoading ? 'not-allowed' : 'pointer',
            fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 10, opacity: googleLoading ? 0.6 : 1,
            boxSizing: 'border-box', fontFamily: 'Barlow, sans-serif',
          }}>
            <GoogleIcon />
            {googleLoading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: '#2a2518' }} />
            <span style={{ fontSize: 10, color: '#5a5648', fontWeight: 700, letterSpacing: '0.1em', fontFamily: "'Barlow Condensed', sans-serif" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: '#2a2518' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input style={inp} placeholder="Display name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            <input style={inp} placeholder="@username" value={username} onChange={e => setUsername(e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase())} />
            <input style={inp} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input style={inp} type="password" placeholder="Password (min. 6 characters)" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSignup()} />
            <button onClick={handleSignup} disabled={loading} style={{
              padding: '13px', marginTop: 4,
              background: loading ? '#111007' : '#f5c800',
              color: loading ? '#5a5648' : '#0a0800',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 14, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase',
              fontFamily: "'Barlow Condensed', sans-serif",
              transition: 'all 0.15s',
            }}>
              {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}