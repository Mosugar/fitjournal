'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types'
import Link from 'next/link'
import toast from 'react-hot-toast'

const SPORTS = [
  'Powerlifter', 'Haltérophile', 'Bodybuilder', 'CrossFitter',
  'Footballeur', 'Rugbyman', 'Basketteur', 'Sprinter',
  'Marathonien', 'Nageur', 'Judoka', 'Boxeur', 'Lutteur', 'Autre',
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
  const router = useRouter()
  const supabase = createClient()

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    background: '#111007', border: '1px solid #2a2518',
    color: '#f0ede0', fontSize: 14, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'Barlow, sans-serif',
  }

  const section: React.CSSProperties = {
    background: '#161410',
    border: '1px solid #2a2518',
    borderLeft: '3px solid #f5c800',
    padding: 20, marginBottom: 10,
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
    toast.success('Photo mise à jour !')
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
    toast.success('Bannière mise à jour !')
    setBannerUploading(false)
  }

  const handleSave = async () => {
    if (!displayName) return toast.error('Le nom est obligatoire')
    setLoading(true)
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName, bio, avatar_url: avatarUrl, banner_url: bannerUrl, sport })
      .eq('id', profile.id)
    if (error) { toast.error('Erreur sauvegarde'); setLoading(false); return }
    toast.success('Profil mis à jour ✅')
    router.push(`/${profile.username}`)
    router.refresh()
  }

  return (
    <div style={{ background: '#0a0800', minHeight: '100vh', padding: 20, fontFamily: 'Barlow, sans-serif' }}>

      <Link href={`/${profile.username}`} style={{
        color: '#5a5648', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
        textDecoration: 'none', marginBottom: 24,
        fontFamily: "'Barlow Condensed', sans-serif",
        letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>
        ← Retour au profil
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ width: 4, height: 28, background: '#f5c800' }} />
        <h1 style={{
          fontSize: 28, fontWeight: 900, color: '#f5c800',
          textTransform: 'uppercase', letterSpacing: '0.06em',
          fontFamily: "'Barlow Condensed', sans-serif",
        }}>
          MODIFIER LE PROFIL
        </h1>
      </div>

      {/* Banner */}
      <div style={section}>
        <label style={labelStyle}>Bannière (1200×400 · max 5MB)</label>
        <div style={{
          width: '100%', height: 90, marginBottom: 12, overflow: 'hidden',
          background: '#111007', border: '1px solid #2a2518',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {bannerUrl
            ? <img src={bannerUrl} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(40%)' }} />
            : <span style={{ color: '#5a5648', fontSize: 12 }}>Aucune bannière</span>
          }
        </div>
        <label style={{
          display: 'inline-block', padding: '8px 16px',
          background: 'transparent', border: '1px solid #f5c800',
          color: '#f5c800', cursor: 'pointer',
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          {bannerUploading ? 'UPLOAD...' : '🖼 CHANGER LA BANNIÈRE'}
          <input type="file" accept="image/*" onChange={handleBannerUpload} style={{ display: 'none' }} />
        </label>
      </div>

      {/* Avatar */}
      <div style={section}>
        <label style={labelStyle}>Photo de profil (max 2MB)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 60, height: 60, padding: 3, background: '#f5c800', flexShrink: 0 }}>
            <img
              src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
              alt="avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <label style={{
            display: 'inline-block', padding: '8px 16px',
            background: '#f5c800', border: 'none',
            color: '#0a0800', cursor: 'pointer',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 12, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            {avatarUploading ? 'UPLOAD...' : '📷 CHANGER'}
            <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* Nom */}
      <div style={section}>
        <label style={labelStyle}>Nom d'affichage *</label>
        <input style={inp} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Ton nom" />
      </div>

      {/* Username readonly */}
      <div style={{ ...section, borderLeft: '3px solid #2a2518' }}>
        <label style={labelStyle}>Username (non modifiable)</label>
        <input style={{ ...inp, opacity: 0.4, cursor: 'not-allowed' }} value={`@${profile.username}`} disabled />
      </div>

      {/* Sport */}
      <div style={section}>
        <label style={labelStyle}>Discipline principale</label>
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
            }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div style={section}>
        <label style={labelStyle}>Bio</label>
        <textarea
          style={{ ...inp, minHeight: 80, resize: 'vertical', lineHeight: 1.5 }}
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder="Parle de toi, ton sport, tes objectifs..."
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
        transition: 'all 0.15s', marginBottom: 40,
      }}>
        {loading ? 'SAUVEGARDE...' : 'SAUVEGARDER ✅'}
      </button>
    </div>
  )
}