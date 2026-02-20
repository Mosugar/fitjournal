'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function EditProfileClient({ profile }: { profile: Profile }) {
  const [displayName, setDisplayName] = useState(profile.display_name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [loading, setLoading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const router = useRouter()
  const supabase = createClient()

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    background: 'var(--bg3)', border: '1px solid var(--border)',
    color: 'var(--text)', fontSize: 15, outline: 'none',
    boxSizing: 'border-box',
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image trop lourde (max 2MB)')
      return
    }

    setAvatarUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `${profile.id}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true, contentType: file.type })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        toast.error(`Erreur: ${uploadError.message}`)
        setAvatarUploading(false)
        return
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
const cleanUrl = data.publicUrl
setAvatarUrl(cleanUrl)

// Sauvegarde immédiate en base de données
await supabase
  .from('profiles')
  .update({ avatar_url: cleanUrl })
  .eq('id', profile.id)

toast.success('Photo mise à jour ! 🔥')
    } catch (err) {
      console.error(err)
      toast.error('Erreur inattendue')
    }

    setAvatarUploading(false)
  }

  const handleSave = async () => {
    if (!displayName) return toast.error('Le nom est obligatoire')
    setLoading(true)

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName, bio, avatar_url: avatarUrl })
      .eq('id', profile.id)

    if (error) {
      toast.error('Erreur lors de la sauvegarde')
      setLoading(false)
      return
    }

    toast.success('Profil mis à jour ! ✅')
    router.push(`/${profile.username}`)
    router.refresh()
  }

  return (
    <div style={{ padding: 20 }}>
      <Link href={`/${profile.username}`} style={{
        color: 'var(--text2)', fontSize: 14,
        display: 'flex', alignItems: 'center', gap: 6,
        textDecoration: 'none', marginBottom: 20,
      }}>
        ← Retour au profil
      </Link>

      <h1 className="bebas" style={{ margin: '0 0 24px', fontSize: 28 }}>MODIFIER LE PROFIL</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Avatar */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
          <label style={{ fontSize: 12, color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>
            Photo de profil
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img
              src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
              alt="avatar"
              style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid var(--accent)', objectFit: 'cover' }}
            />
            <div>
              <label style={{
                display: 'inline-block',
                padding: '10px 16px', borderRadius: 10,
                background: 'var(--bg3)', border: '1px solid var(--border)',
                color: 'var(--text)', cursor: 'pointer',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 14, letterSpacing: '0.05em',
              }}>
                {avatarUploading ? 'UPLOAD...' : '📷 CHANGER LA PHOTO'}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
              </label>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--text2)' }}>JPG, PNG — max 2MB</p>
            </div>
          </div>
        </div>

        {/* Nom */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
          <label style={{ fontSize: 12, color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Nom d'affichage *
          </label>
          <input style={inputStyle} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Ton nom" />
        </div>

        {/* Username readonly */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
          <label style={{ fontSize: 12, color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Username
          </label>
          <input style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} value={`@${profile.username}`} disabled />
          <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--text2)' }}>Le username ne peut pas être modifié</p>
        </div>

        {/* Bio */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
          <label style={{ fontSize: 12, color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Bio
          </label>
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical', lineHeight: 1.5 }}
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Parle de toi, ton sport, tes objectifs..."
            maxLength={160}
          />
          <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--text2)', textAlign: 'right' }}>{bio.length}/160</p>
        </div>

        <button onClick={handleSave} disabled={loading} style={{
          width: '100%', padding: '14px 20px', borderRadius: 10,
          background: loading ? 'var(--bg3)' : 'var(--accent)',
          color: '#fff', border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 18, letterSpacing: '0.1em',
        }}>
          {loading ? 'SAUVEGARDE...' : 'SAUVEGARDER ✅'}
        </button>
      </div>
    </div>
  )
}