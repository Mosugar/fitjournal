'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Session } from '@/lib/types'
import Link from 'next/link'
import toast from 'react-hot-toast'
import SessionPhotos from '@/components/SessionPhotos'

const FEELING_LABELS = ['', 'Exhausted', 'Tired', 'Normal', 'Good', 'On fire']

const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
)
const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

type Comment = {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: { username: string; display_name: string; avatar_url: string | null }
}

type Photo = { id: string; url: string; storage_path: string; created_at: string }

export default function SessionDetailClient({
  session, username, likesCount: initialLikes, userLiked: initialLiked,
  comments: initialComments, currentUserId, currentUserProfile, isOwn, sessionOwnerId,
  photos: initialPhotos = [],
}: {
  session: Session & { exercises: any[] }
  username: string
  likesCount: number
  userLiked: boolean
  comments: Comment[]
  currentUserId: string | null
  currentUserProfile: any
  isOwn: boolean
  sessionOwnerId: string
  photos?: Photo[]
}) {
  const [liked, setLiked] = useState(initialLiked)
  const [likesCount, setLikesCount] = useState(initialLikes)
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const dateStr = new Date(session.date).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  const handleLike = async () => {
    if (!currentUserId) return toast.error('Sign in to like')
    if (liked) {
      setLiked(false); setLikesCount(c => c - 1)
      await supabase.from('likes').delete().eq('user_id', currentUserId).eq('session_id', session.id)
    } else {
      setLiked(true); setLikesCount(c => c + 1)
      await supabase.from('likes').insert({ user_id: currentUserId, session_id: session.id })
      if (sessionOwnerId !== currentUserId) {
        await supabase.from('notifications').insert({
          user_id: sessionOwnerId, actor_id: currentUserId,
          type: 'like', session_id: session.id,
        })
      }
    }
  }

  const handleComment = async () => {
    if (!currentUserId) return toast.error('Sign in to comment')
    if (!newComment.trim()) return
    setPosting(true)
    const { data, error } = await supabase
      .from('comments')
      .insert({ user_id: currentUserId, session_id: session.id, content: newComment.trim() })
      .select('*, profiles(username, display_name, avatar_url)')
      .single()
    if (error) { toast.error('Error'); setPosting(false); return }
    setComments(prev => [...prev, data])
    setNewComment('')
    setPosting(false)
    if (sessionOwnerId !== currentUserId) {
      await supabase.from('notifications').insert({
        user_id: sessionOwnerId, actor_id: currentUserId,
        type: 'comment', session_id: session.id,
      })
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    await supabase.from('comments').delete().eq('id', commentId)
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  const handleDeleteSession = async () => {
    if (!confirm('Delete this session?')) return
    await supabase.from('sessions').delete().eq('id', session.id)
    toast.success('Session deleted')
    router.push(`/${username}/journal`)
    router.refresh()
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied! 🔗')
  }

  return (
    <div style={{ padding: 20, background: '#0a0800', minHeight: '100vh' }}>

      <Link href={`/${username}/journal`} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        color: '#5a5648', textDecoration: 'none', fontSize: 12,
        marginBottom: 20, fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', fontFamily: "'Barlow Condensed', sans-serif",
      }}>
        ← Journal
      </Link>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 4, height: 28, background: '#f5c800', flexShrink: 0 }} />
              <h1 style={{
                fontSize: 28, fontWeight: 900, color: '#f0ede0',
                textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1,
                fontFamily: "'Barlow Condensed', sans-serif",
              }}>
                {session.title}
              </h1>
            </div>
            <p style={{
              color: '#5a5648', fontSize: 12, textTransform: 'capitalize',
              marginLeft: 14, letterSpacing: '0.04em',
            }}>{dateStr}</p>
          </div>
          {isOwn && (
            <div style={{ display: 'flex', gap: 4 }}>
              <Link href={`/${username}/journal/${session.id}/edit`} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '7px 12px',
                background: 'transparent', border: '1px solid #f5c800',
                color: '#f5c800', textDecoration: 'none', fontSize: 11, fontWeight: 700,
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                <IconEdit /> EDIT
              </Link>
              <button onClick={handleDeleteSession} style={{
                background: 'none', border: '1px solid #2a2518',
                color: '#5a5648', cursor: 'pointer', padding: '7px 10px',
              }}>
                <IconTrash />
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginLeft: 14 }}>
          {session.feeling && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '3px 10px',
              background: '#f5c80011', color: '#f5c800',
              border: '1px solid #f5c80033',
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              {FEELING_LABELS[session.feeling]}
            </span>
          )}
          {session.tags?.map((t: string) => (
            <span key={t} style={{
              fontSize: 10, padding: '3px 10px',
              background: '#0a0800', color: '#5a5648',
              border: '1px solid #2a2518',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Notes */}
      {session.notes && (
        <div style={{ background: '#161410', border: '1px solid #2a2518', borderLeft: '3px solid #f5c800', padding: 18, marginBottom: 8 }}>
          <p style={{ fontSize: 11, color: '#5a5648', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: "'Barlow Condensed', sans-serif" }}>Notes</p>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: '#f0ede0' }}>{session.notes}</p>
        </div>
      )}

      {/* Exercises */}
      {session.exercises && session.exercises.length > 0 && (
        <div style={{ background: '#161410', border: '1px solid #2a2518', borderLeft: '3px solid #f5c800', padding: 18, marginBottom: 8 }}>
          <p style={{ fontSize: 11, color: '#5a5648', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14, fontFamily: "'Barlow Condensed', sans-serif" }}>Exercises</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {session.exercises.map((ex: any) => (
              <div key={ex.id} style={{
                display: 'grid', gridTemplateColumns: '1fr auto auto auto',
                gap: 8, alignItems: 'center',
                padding: '10px 12px', background: '#0a0800',
                border: '1px solid #2a2518',
              }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#f0ede0', textTransform: 'uppercase', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.04em' }}>{ex.name}</span>
                {ex.sets && <span style={{ fontSize: 12, color: '#5a5648', fontFamily: "'Barlow Condensed', sans-serif" }}>{ex.sets}×</span>}
                {ex.reps && <span style={{ fontSize: 12, color: '#5a5648', fontFamily: "'Barlow Condensed', sans-serif" }}>{ex.reps} reps</span>}
                {ex.weight > 0
                  ? <span style={{ fontSize: 16, fontWeight: 900, color: '#f5c800', fontFamily: "'Barlow Condensed', sans-serif" }}>{ex.weight}kg</span>
                  : <span style={{ fontSize: 11, color: '#5a5648' }}>BW</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos */}
      <SessionPhotos
        sessionId={session.id}
        userId={sessionOwnerId}
        initialPhotos={initialPhotos}
        isOwn={isOwn}
      />

      {/* Actions */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, padding: '10px 14px', background: '#161410', border: '1px solid #2a2518' }}>
        <button onClick={handleLike} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px',
          background: liked ? '#f5c80015' : 'transparent',
          border: `1px solid ${liked ? '#f5c80066' : '#2a2518'}`,
          color: liked ? '#f5c800' : '#5a5648',
          cursor: 'pointer', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          fontFamily: "'Barlow Condensed', sans-serif",
          transition: 'all 0.15s',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          {likesCount > 0 ? likesCount : 'LIKE'}
        </button>

        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px',
          background: 'transparent', border: '1px solid #2a2518',
          color: '#5a5648', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          fontFamily: "'Barlow Condensed', sans-serif",
          cursor: 'default',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {comments.length > 0 ? comments.length : 'COMMENTS'}
        </button>

        <button onClick={handleShare} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', marginLeft: 'auto',
          background: 'transparent', border: '1px solid #2a2518',
          color: '#5a5648', cursor: 'pointer', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          fontFamily: "'Barlow Condensed', sans-serif",
        }}>
          SHARE
        </button>
      </div>

      {/* Comments */}
      <div style={{ marginBottom: 80 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 4, height: 16, background: '#f5c800' }} />
          <p style={{ fontSize: 12, color: '#5a5648', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Barlow Condensed', sans-serif" }}>
            Comments {comments.length > 0 && `(${comments.length})`}
          </p>
        </div>

        {currentUserId && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 32, height: 32, padding: 2, background: '#f5c800', flexShrink: 0 }}>
              <img
                src={currentUserProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserProfile?.username}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                alt="avatar"
              />
            </div>
            <div style={{ flex: 1, display: 'flex', gap: 6 }}>
              <input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleComment()}
                placeholder="Add a comment..."
                style={{
                  flex: 1, padding: '9px 12px',
                  background: '#161410', border: '1px solid #2a2518',
                  color: '#f0ede0', fontSize: 13, outline: 'none',
                  fontFamily: 'Barlow, sans-serif',
                }}
              />
              <button onClick={handleComment} disabled={posting || !newComment.trim()} style={{
                padding: '9px 14px',
                background: posting || !newComment.trim() ? '#161410' : '#f5c800',
                color: posting || !newComment.trim() ? '#5a5648' : '#0a0800',
                border: 'none', cursor: posting ? 'not-allowed' : 'pointer',
                fontSize: 11, fontWeight: 900,
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                {posting ? '...' : 'SEND'}
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {comments.length === 0 ? (
            <div style={{ background: '#161410', border: '1px solid #2a2518', padding: '24px 20px', textAlign: 'center' }}>
              <p style={{ color: '#5a5648', fontSize: 13 }}>Be the first to comment</p>
            </div>
          ) : comments.map(c => (
            <div key={c.id} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              background: '#161410', border: '1px solid #2a2518',
              padding: 12,
            }}>
              <Link href={`/${c.profiles.username}`}>
                <div style={{ width: 30, height: 30, padding: 2, background: '#2a2518', flexShrink: 0 }}>
                  <img
                    src={c.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.profiles.username}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    alt="avatar"
                  />
                </div>
              </Link>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Link href={`/${c.profiles.username}`} style={{ textDecoration: 'none' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#f0ede0', textTransform: 'uppercase', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.04em' }}>
                      {c.profiles.display_name}
                    </span>
                    <span style={{ fontSize: 11, color: '#5a5648', marginLeft: 6 }}>@{c.profiles.username}</span>
                  </Link>
                  {(currentUserId === c.user_id || isOwn) && (
                    <button onClick={() => handleDeleteComment(c.id)} style={{ background: 'none', border: 'none', color: '#5a5648', cursor: 'pointer', padding: 2 }}>
                      <IconTrash />
                    </button>
                  )}
                </div>
                <p style={{ fontSize: 13, color: '#f0ede0', margin: 0, lineHeight: 1.4 }}>{c.content}</p>
                <p style={{ fontSize: 10, color: '#5a5648', margin: '4px 0 0' }}>
                  {new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}