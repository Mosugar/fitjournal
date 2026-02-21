'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types'
import Link from 'next/link'
import toast from 'react-hot-toast'

const SPORTS = [
  'Powerlifter', 'Weightlifter', 'Bodybuilder', 'CrossFitter',
  'Football', 'Rugby', 'Basketball', 'Sprinter',
  'Marathon', 'Swimming', 'Judo', 'Boxing', 'Wrestling', 'Other',
]

export default function EditProfileClient({ profile }: { profile: Profile }) {
  const [displayName, setDisplayName] = useState(profile.display_name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [sport, setSport] = useState(profile.sport || '')
  const [loading, setLoading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [bannerUploading, setBannerUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const [bannerUrl, setBannerUrl] = useState(profile.banner_url || '')
  const [newUsername, setNewUsername] = useState(profile.username)
  const [usernameLoading, setUsernameLoading] = useState(false)
  const [usernameError, setUsernameError] = useState('')

  const router = useRouter()
  const supabase = createClient()

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    background: '#0a0800', border: '1px solid #2a2518',
    color: '#f0ede0', fontSize: 14, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'Barlow, sans-serif',
  }

  const section: React.CSSProperties = {
    background: '#161410', border: '1px solid #2a2518',
    borderLeft: '3px solid #f5c800', padding: 20, marginBottom: 8,
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11, color: '#5a5648', letterSpacing: '0.12em',
    textTransform: 'uppercase', display: 'block', marginBottom: 10,
    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Max 2MB'); return }
    setAvatarUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${profile.id}.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type })
    if (error) { toast.error(error.message); setAvatarUploading(false); return }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    setAvatarUrl(data.publicUrl)
    await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', profile.id)
    toast.success('Photo updated!')
    setAvatarUploading(false)
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return }
    setBannerUploading(true)
    const ext = file.name.split('.').pop()
    const path = `banner_${profile.id}.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type })
    if (error) { toast.error(error.message); setBannerUploading(false); return }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    setBannerUrl(data.publicUrl)
    await supabase.from('profiles').update({ banner_url: data.publicUrl }).eq('id', profile.id)
    toast.success('Banner updated!')
    setBannerUploading(false)
  }

  const handleUsernameChange = async () => {
    const cleaned = newUsername.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setNewUsername(cleaned)
    setUsernameError('')
    if (cleaned === profile.username) return
    if (cleaned.length < 3) { setUsernameError('Min 3 characters'); return }
    if (cleaned.length > 20) { setUsernameError('Max 20 characters'); return }
    setUsernameLoading(true)

    // Check cooldown
    const lastChange = (profile as any).last_username_change
    if (lastChange) {
      const daysSince = (Date.now() - new Date(lastChange).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSince < 30) {
        const daysLeft = Math.ceil(30 - daysSince)
        setUsernameError(`Available in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`)
        setUsernameLoading(false)
        return
      }
    }

    // Check availability
    const { data: existing } = await supabase.from('profiles').select('id').eq('username', cleaned).single()
    if (existing) { setUsernameError('Username already taken'); setUsernameLoading(false); return }

    const { error } = await supabase
      .from('profiles')
      .update({ username: cleaned, last_username_change: new Date().toISOString() })
      .eq('id', profile.id)

    if (error) { toast.error('Error updating username'); setUsernameLoading(false); return }

    toast.success('Username updated! ✅')
    setUsernameLoading(false)
    router.push(`/${cleaned}/edit`)
    router.refresh()
  }

  const handleSave = async () => {
    if (!displayName) return toast.error('Name is required')
    setLoading(true)
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName, bio, avatar_url: avatarUrl, banner_url: bannerUrl, sport })
      .eq('id', profile.id)
    if (error) { toast.error('Error saving'); setLoading(false); return }
    toast.success('Profile updated ✅')
    router.push(`/${profile.username}`)
    router.refresh()
  }

  return (
    <div style={{ padding: 20, background: '#0a0800', minHeight: '100vh', fontFamily: 'Barlow, sans-serif' }}>

      <Link href={`/${profile.username}`} style={{
        color: '#5a5648', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
        textDecoration: 'none', marginBottom: 24,
        fontFamily: "'Barlow Condensed', sans-serif",
        letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>
        ← Back to profile
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ width: 4, height: 28, background: '#f5c800' }} />
        <h1 style={{
          fontSize: 28, fontWeight: 900, color: '#f5c800',
          textTransform: 'uppercase', letterSpacing: '0.06em',
          fontFamily: "'Barlow Condensed', sans-serif",
        }}>EDIT PROFILE</h1>
      </div>

      {/* Banner */}
      <div style={section}>
        <label style={labelStyle}>Banner (1200×400 · max 5MB)</label>
        <div style={{
          width: '100%', height: 90, marginBottom: 12,
          background: '#111007', border: '1px solid #2a2518',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        }}>
          {bannerUrl
            ? <img src={bannerUrl} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(40%)' }} />
            : <span style={{ color: '#5a5648', fontSize: 12 }}>No banner</span>
          }
        </div>
        <label style={{
          display: 'inline-block', padding: '8px 16px',
          background: 'transparent', border: '1px solid #f5c800',
          color: '#f5c800', cursor: 'pointer',
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          {bannerUploading ? 'UPLOADING...' : '🖼 CHANGE BANNER'}
          <input type="file" accept="image/*" onChange={handleBannerUpload} style={{ display: 'none' }} />
        </label>
      </div>

      {/* Avatar */}
      <div style={section}>
        <label style={labelStyle}>Profile photo (max 2MB)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 60, height: 60, padding: 3, background: '#f5c800', flexShrink: 0 }}>
            <img src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
              alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <label style={{
            display: 'inline-block', padding: '8px 16px',
            background: '#f5c800', border: 'none', color: '#0a0800', cursor: 'pointer',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 12, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            {avatarUploading ? 'UPLOADING...' : '📷 CHANGE'}
            <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* Display name */}
      <div style={section}>
        <label style={labelStyle}>Display name *</label>
        <input style={inp} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
      </div>

      {/* Username */}
      <div style={section}>
        <label style={labelStyle}>Username</label>
        <p style={{ fontSize: 11, color: '#5a5648', marginBottom: 10, lineHeight: 1.5 }}>
          Can be changed once every 30 days. All your links will update automatically.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: '#5a5648', fontSize: 14,
            }}>@</span>
            <input
              style={{ ...inp, paddingLeft: 26 }}
              value={newUsername}
              onChange={e => {
                setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                setUsernameError('')
              }}
              placeholder="username"
              maxLength={20}
            />
          </div>
          <button
            onClick={handleUsernameChange}
            disabled={usernameLoading || newUsername === profile.username}
            style={{
              padding: '11px 16px', flexShrink: 0,
              background: newUsername === profile.username ? 'transparent' : '#f5c800',
              border: `1px solid ${newUsername === profile.username ? '#2a2518' : '#f5c800'}`,
              color: newUsername === profile.username ? '#5a5648' : '#0a0800',
              cursor: usernameLoading || newUsername === profile.username ? 'not-allowed' : 'pointer',
              fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
              fontFamily: "'Barlow Condensed', sans-serif",
            }}
          >
            {usernameLoading ? '...' : 'SAVE'}
          </button>
        </div>
        {usernameError && (
          <p style={{ fontSize: 11, color: '#e63000', marginTop: 6, letterSpacing: '0.06em', fontFamily: "'Barlow Condensed', sans-serif" }}>
            ⚠ {usernameError}
          </p>
        )}
      </div>

      {/* Sport */}
      <div style={section}>
        <label style={labelStyle}>Main discipline</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SPORTS.map(s => (
            <button key={s} onClick={() => setSport(sport === s ? '' : s)} style={{
              padding: '6px 14px',
              background: sport === s ? '#f5c800' : 'transparent',
              border: `1px solid ${sport === s ? '#f5c800' : '#2a2518'}`,
              color: sport === s ? '#0a0800' : '#5a5648',
              cursor: 'pointer', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              fontFamily: "'Barlow Condensed', sans-serif",
              transition: 'all 0.1s',
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div style={section}>
        <label style={labelStyle}>Bio</label>
        <textarea
          style={{ ...inp, minHeight: 80, resize: 'vertical', lineHeight: 1.5 }}
          value={bio} onChange={e => setBio(e.target.value)}
          placeholder="Tell us about you, your sport, your goals..."
          maxLength={160}
        />
        <p style={{ margin: '6px 0 0', fontSize: 11, color: '#5a5648', textAlign: 'right' }}>{bio.length}/160</p>
      </div>

      <button onClick={handleSave} disabled={loading} style={{
        width: '100%', padding: '14px 20px',
        background: loading ? '#161410' : '#f5c800',
        color: loading ? '#5a5648' : '#0a0800',
        border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 18, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase',
        marginBottom: 40,
      }}>
        {loading ? 'SAVING...' : 'SAVE PROFILE ✅'}
      </button>
    </div>
  )
}