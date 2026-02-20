'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Session } from '@/lib/types'
import Link from 'next/link'
import toast from 'react-hot-toast'

const FEELING_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']
const FEELING_LABELS = ['', 'Épuisé', 'Fatigué', 'Normal', 'Bien', 'Au top']

const IconHeart = ({ filled }: { filled: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)
const IconComment = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const IconShare = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
)
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
)
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const IconBack = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)

type Comment = {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: { username: string; display_name: string; avatar_url: string | null }
}

export default function SessionDetailClient({
  session, username, likesCount: initialLikes, userLiked: initialLiked,
  comments: initialComments, currentUserId, currentUserProfile, isOwn,
}: {
  session: Session & { exercises: any[] }
  username: string
  likesCount: number
  userLiked: boolean
  comments: Comment[]
  currentUserId: string | null
  currentUserProfile: any
  isOwn: boolean
}) {
  const [liked, setLiked] = useState(initialLiked)
  const [likesCount, setLikesCount] = useState(initialLikes)
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const date = new Date(session.date)
  const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const handleLike = async () => {
    if (!currentUserId) return toast.error('Connecte-toi pour liker')
    if (liked) {
      setLiked(false); setLikesCount(c => c - 1)
      await supabase.from('likes').delete().eq('user_id', currentUserId).eq('session_id', session.id)
    } else {
      setLiked(true); setLikesCount(c => c + 1)
      await supabase.from('likes').insert({ user_id: currentUserId, session_id: session.id })
    }
  }

  const handleComment = async () => {
    if (!currentUserId) return toast.error('Connecte-toi pour commenter')
    if (!newComment.trim()) return
    setPosting(true)
    const { data, error } = await supabase
      .from('comments')
      .insert({ user_id: currentUserId, session_id: session.id, content: newComment.trim() })
      .select('*, profiles(username, display_name, avatar_url)')
      .single()
    if (error) { toast.error('Erreur'); setPosting(false); return }
    setComments(prev => [...prev, data])
    setNewComment('')
    setPosting(false)
  }

  const handleDeleteComment = async (commentId: string) => {
    await supabase.from('comments').delete().eq('id', commentId)
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  const handleDeleteSession = async () => {
    if (!confirm('Supprimer cette séance ?')) return
    await supabase.from('sessions').delete().eq('id', session.id)
    toast.success('Séance supprimée')
    router.push(`/${username}/journal`)
    router.refresh()
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Lien copié ! 🔗')
  }

  return (
    <div style={{ padding: 20 }} className="fadeUp">
      <Link href={`/${username}/journal`} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        color: 'var(--text2)', textDecoration: 'none', fontSize: 14,
        marginBottom: 20, fontWeight: 500,
      }}>
        <IconBack /> Journal
      </Link>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h1 className="condensed" style={{ fontSize: 30, fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>
              {session.title}
            </h1>
            <p style={{ color: 'var(--text2)', fontSize: 13, textTransform: 'capitalize', marginBottom: 10 }}>{dateStr}</p>
          </div>
          {isOwn && (
            <div style={{ display: 'flex', gap: 4 }}>
              <Link href={`/${username}/journal/${session.id}/edit`} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '7px 12px', borderRadius: 8,
                background: 'var(--bg3)', border: '1px solid var(--border)',
                color: 'var(--text)', textDecoration: 'none', fontSize: 13, fontWeight: 500,
              }}>
                <IconEdit /> Modifier
              </Link>
              <button onClick={handleDeleteSession} style={{
                background: 'none', border: 'none', color: 'var(--text2)',
                cursor: 'pointer', padding: 8,
              }}>
                <IconTrash />
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {session.feeling && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
              background: FEELING_COLORS[session.feeling] + '18',
              color: FEELING_COLORS[session.feeling],
              border: `1px solid ${FEELING_COLORS[session.feeling]}30`,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: FEELING_COLORS[session.feeling], display: 'inline-block' }} />
              {FEELING_LABELS[session.feeling]}
            </span>
          )}
          {session.tags?.map((t: string) => (
            <span key={t} style={{
              fontSize: 12, padding: '4px 10px', borderRadius: 20,
              background: 'var(--bg3)', color: 'var(--text2)', fontWeight: 500,
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Notes */}
      {session.notes && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, marginBottom: 12, boxShadow: 'var(--shadow)' }}>
          <p style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Notes</p>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text)' }}>{session.notes}</p>
        </div>
      )}

      {/* Exercises */}
      {session.exercises && session.exercises.length > 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, marginBottom: 12, boxShadow: 'var(--shadow)' }}>
          <p style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Exercices</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {session.exercises.map((ex: any) => (
              <div key={ex.id} style={{
                display: 'grid', gridTemplateColumns: '1fr auto auto auto',
                gap: 8, alignItems: 'center',
                padding: '10px 14px', background: 'var(--bg3)', borderRadius: 10,
              }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{ex.name}</span>
                {ex.sets && <span style={{ fontSize: 13, color: 'var(--text2)' }}>{ex.sets} ×</span>}
                {ex.reps && <span style={{ fontSize: 13, color: 'var(--text2)' }}>{ex.reps} reps</span>}
                {ex.weight > 0
                  ? <span className="condensed" style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>{ex.weight}kg</span>
                  : <span style={{ fontSize: 12, color: 'var(--text2)' }}>PdC</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, padding: '12px 16px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)' }}>
        <button onClick={handleLike} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: liked ? '#ef444415' : 'var(--bg3)',
          color: liked ? '#ef4444' : 'var(--text2)',
          fontSize: 14, fontWeight: 600, transition: 'all 0.15s',
        }}>
          <IconHeart filled={liked} />
          {likesCount > 0 && likesCount}
        </button>

        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: 'var(--bg3)', color: 'var(--text2)', fontSize: 14, fontWeight: 600,
        }}>
          <IconComment />
          {comments.length > 0 && comments.length}
        </button>

        <button onClick={handleShare} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: 'var(--bg3)', color: 'var(--text2)',
          fontSize: 14, fontWeight: 600, marginLeft: 'auto',
        }}>
          <IconShare /> Partager
        </button>
      </div>

      {/* Comments */}
      <div style={{ marginBottom: 80 }}>
        <p style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
          Commentaires {comments.length > 0 && `(${comments.length})`}
        </p>

        {currentUserId && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'flex-start' }}>
            <img
              src={currentUserProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserProfile?.username}`}
              style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--border)' }}
              alt="avatar"
            />
            <div style={{ flex: 1, display: 'flex', gap: 8 }}>
              <input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleComment()}
                placeholder="Ajoute un commentaire..."
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 10,
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  color: 'var(--text)', fontSize: 14, outline: 'none',
                }}
              />
              <button onClick={handleComment} disabled={posting || !newComment.trim()} style={{
                padding: '10px 14px', borderRadius: 10, border: 'none',
                background: posting || !newComment.trim() ? 'var(--bg3)' : 'var(--accent)',
                color: '#fff', cursor: posting ? 'not-allowed' : 'pointer',
                fontSize: 13, fontWeight: 600,
              }}>
                {posting ? '...' : 'Envoyer'}
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {comments.length === 0 ? (
            <p style={{ color: 'var(--text2)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
              Sois le premier à commenter 💬
            </p>
          ) : comments.map(c => (
            <div key={c.id} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 12,
            }}>
              <Link href={`/${c.profiles.username}`}>
                <img
                  src={c.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.profiles.username}`}
                  style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
                  alt="avatar"
                />
              </Link>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Link href={`/${c.profiles.username}`} style={{ textDecoration: 'none' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{c.profiles.display_name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text2)', marginLeft: 6 }}>@{c.profiles.username}</span>
                  </Link>
                  {(currentUserId === c.user_id || isOwn) && (
                    <button onClick={() => handleDeleteComment(c.id)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', padding: 2 }}>
                      <IconTrash />
                    </button>
                  )}
                </div>
                <p style={{ fontSize: 14, color: 'var(--text)', margin: 0, lineHeight: 1.4 }}>{c.content}</p>
                <p style={{ fontSize: 11, color: 'var(--text2)', margin: '4px 0 0' }}>
                  {new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}