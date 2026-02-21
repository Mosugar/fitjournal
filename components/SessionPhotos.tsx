'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

type Photo = {
  id: string
  url: string
  created_at: string
}

export default function SessionPhotos({
  sessionId,
  userId,
  initialPhotos,
  isOwn,
}: {
  sessionId: string
  userId: string
  initialPhotos: Photo[]
  isOwn: boolean
}) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const supabase = createClient()
  const MAX_PHOTOS = 5

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const remaining = MAX_PHOTOS - photos.length
    if (remaining <= 0) { toast.error(`Max ${MAX_PHOTOS} photos per session`); return }

    const toUpload = files.slice(0, remaining)
    if (files.length > remaining) toast(`Only uploading ${remaining} photo${remaining > 1 ? 's' : ''} (max ${MAX_PHOTOS})`, { icon: 'ℹ️' })

    setUploading(true)

    for (const file of toUpload) {
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} is too large (max 5MB)`); continue }

      const ext = file.name.split('.').pop()
      const path = `sessions/${sessionId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('session-photos')
        .upload(path, file, { contentType: file.type })

      if (uploadError) { toast.error(`Failed to upload ${file.name}`); continue }

      const { data: urlData } = supabase.storage.from('session-photos').getPublicUrl(path)

      const { data: photo, error: dbError } = await supabase
        .from('session_photos')
        .insert({ session_id: sessionId, user_id: userId, url: urlData.publicUrl, storage_path: path })
        .select().single()

      if (dbError) { toast.error('DB error'); continue }
      setPhotos(prev => [...prev, photo])
    }

    toast.success('Photos uploaded! 📸')
    setUploading(false)
    // Reset input
    e.target.value = ''
  }

  const handleDelete = async (photo: Photo & { storage_path?: string }) => {
    if (!confirm('Delete this photo?')) return
    await supabase.from('session_photos').delete().eq('id', photo.id)
    if ((photo as any).storage_path) {
      await supabase.storage.from('session-photos').remove([(photo as any).storage_path])
    }
    setPhotos(prev => prev.filter(p => p.id !== photo.id))
    toast.success('Photo deleted')
  }

  if (photos.length === 0 && !isOwn) return null

  return (
    <div style={{ background: '#161410', border: '1px solid #2a2518', borderLeft: '3px solid #f5c800', padding: 18, marginBottom: 8 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <p style={{
          fontSize: 11, color: '#5a5648', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0,
          fontFamily: "'Barlow Condensed', sans-serif",
        }}>
          Photos {photos.length > 0 && `(${photos.length}/${MAX_PHOTOS})`}
        </p>
        {isOwn && photos.length < MAX_PHOTOS && (
          <label style={{
            display: 'inline-block', padding: '5px 14px',
            background: uploading ? 'transparent' : '#f5c800',
            border: `1px solid ${uploading ? '#2a2518' : '#f5c800'}`,
            color: uploading ? '#5a5648' : '#0a0800',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontSize: 10, fontWeight: 900,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            fontFamily: "'Barlow Condensed', sans-serif",
          }}>
            {uploading ? 'UPLOADING...' : '+ ADD PHOTOS'}
            <input
              type="file" accept="image/*" multiple
              onChange={handleUpload} disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
        )}
      </div>

      {photos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ color: '#5a5648', fontSize: 12 }}>No photos yet</p>
          {isOwn && (
            <label style={{
              display: 'inline-block', marginTop: 8, padding: '8px 20px',
              background: 'transparent', border: '1px dashed #2a2518',
              color: '#5a5648', cursor: 'pointer',
              fontSize: 11, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              fontFamily: "'Barlow Condensed', sans-serif",
            }}>
              📸 Upload photos
              <input type="file" accept="image/*" multiple onChange={handleUpload} style={{ display: 'none' }} />
            </label>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: photos.length === 1 ? '1fr' : photos.length === 2 ? '1fr 1fr' : 'repeat(3, 1fr)',
          gap: 4,
        }}>
          {photos.map((photo, i) => (
            <div key={photo.id} style={{
              position: 'relative',
              overflow: 'hidden', cursor: 'pointer',
              gridColumn: photos.length >= 3 && photos.length % 2 !== 0 && i === 0 ? '1 / -1' : 'auto',
              paddingBottom: photos.length >= 3 && photos.length % 2 !== 0 && i === 0 ? '40%' : photos.length === 1 ? '56%' : '100%',
            }} onClick={() => setLightbox(photo.url)}>
              <img
                src={photo.url}
                alt="session photo"
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%', objectFit: 'cover',
                  filter: 'grayscale(20%)',
                  transition: 'filter 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.filter = 'grayscale(0%)')}
                onMouseLeave={e => (e.currentTarget.style.filter = 'grayscale(20%)')}
              />
              {isOwn && (
                <button
                  onClick={ev => { ev.stopPropagation(); handleDelete(photo as any) }}
                  style={{
                    position: 'absolute', top: 6, right: 6,
                    background: '#0a0800cc', border: '1px solid #2a2518',
                    color: '#5a5648', cursor: 'pointer',
                    width: 26, height: 26, fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >×</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, background: '#0a0800ee',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 20,
          }}
        >
          <img
            src={lightbox}
            alt="full"
            style={{
              maxWidth: '100%', maxHeight: '90vh',
              objectFit: 'contain',
              border: '2px solid #f5c800',
            }}
          />
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: 'fixed', top: 20, right: 20,
              background: '#0a0800', border: '1px solid #f5c800',
              color: '#f5c800', width: 36, height: 36,
              cursor: 'pointer', fontSize: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>
        </div>
      )}
    </div>
  )
}