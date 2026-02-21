'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'

const FEELING_LABELS = ['', 'Épuisé', 'Fatigué', 'Normal', 'Bien', 'Au top']

type Props = {
  sessions: any[]
  likes: { session_id: string; user_id: string }[]
  follows: { following_id: string }[]
  currentUserId: string | null
  currentUserProfile: any
}

export default function FeedClient({
  sessions,
  likes: initialLikes,
  follows: initialFollows,
  currentUserId,
  currentUserProfile,
}: Props) {
  const [likes, setLikes] = useState(initialLikes)
  const [follows, setFollows] = useState(initialFollows)
  const supabase = createClient()

  const isFollowing = (userId: string) => follows.some(f => f.following_id === userId)

  const handleLike = async (session: any) => {
    if (!currentUserId) return toast.error('Sign in to like')
    const already = likes.some(l => l.session_id === session.id && l.user_id === currentUserId)
    if (already) {
      setLikes(prev => prev.filter(l => !(l.session_id === session.id && l.user_id === currentUserId)))
      await supabase.from('likes').delete().eq('user_id', currentUserId).eq('session_id', session.id)
    } else {
      setLikes(prev => [...prev, { session_id: session.id, user_id: currentUserId }])
      await supabase.from('likes').insert({ user_id: currentUserId, session_id: session.id })
      if (session.profiles.id !== currentUserId) {
        await supabase.from('notifications').insert({
          user_id: session.profiles.id, actor_id: currentUserId,
          type: 'like', session_id: session.id,
        })
      }
    }
  }

  const handleFollow = async (userId: string) => {
    if (!currentUserId) return toast.error('Sign in to follow')
    if (userId === currentUserId) return
    const already = isFollowing(userId)
    if (already) {
      setFollows(prev => prev.filter(f => f.following_id !== userId))
      await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', userId)
      toast.success('Unfollowed')
    } else {
      setFollows(prev => [...prev, { following_id: userId }])
      await supabase.from('follows').insert({ follower_id: currentUserId, following_id: userId })
      await supabase.from('notifications').insert({ user_id: userId, actor_id: currentUserId, type: 'follow' })
      toast.success('Following! 🔥')
    }
  }

  return (
    <div style={{ padding: 20, background: '#0a0800', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: 24, borderBottom: '1px solid #2a2518', paddingBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 4, height: 28, background: '#f5c800' }} />
          <h1 style={{
            fontSize: 32, fontWeight: 900, color: '#f0ede0',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            fontFamily: "'Barlow Condensed', sans-serif",
          }}>Feed</h1>
        </div>
        <p style={{ color: '#5a5648', fontSize: 13, marginTop: 4, marginLeft: 14 }}>Community sessions</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sessions.length === 0 ? (
          <div style={{
            background: '#161410', border: '1px solid #2a2518',
            padding: '48px 20px', textAlign: 'center',
          }}>
            <p style={{ color: '#5a5648', fontSize: 14 }}>No sessions yet</p>
          </div>
        ) : sessions.map((s: any) => {
          const sessionLikes = likes.filter(l => l.session_id === s.id)
          const userLiked = sessionLikes.some(l => l.user_id === currentUserId)
          const isOwn = s.profiles.id === currentUserId
          const following = isFollowing(s.profiles.id)

          return (
            <div key={s.id} style={{
              background: '#161410',
              border: '1px solid #2a2518',
              borderLeft: '3px solid #2a2518',
            }}>

              {/* User header */}
              <div style={{
                padding: '12px 14px 10px',
                display: 'flex', alignItems: 'center', gap: 10,
                borderBottom: '1px solid #2a2518',
              }}>
                <Link href={`/${s.profiles.username}`}>
                  <div style={{ width: 36, height: 36, padding: 2, background: '#f5c800', flexShrink: 0 }}>
                    <img
                      src={s.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.profiles.username}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      alt="avatar"
                    />
                  </div>
                </Link>

                <div style={{ flex: 1 }}>
                  <Link href={`/${s.profiles.username}`} style={{ textDecoration: 'none' }}>
                    <span style={{
                      fontSize: 14, fontWeight: 700, color: '#f0ede0',
                      fontFamily: "'Barlow Condensed', sans-serif",
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>
                      {s.profiles.display_name}
                    </span>
                    <span style={{ fontSize: 11, color: '#5a5648', marginLeft: 6 }}>@{s.profiles.username}</span>
                  </Link>
                  <p style={{ fontSize: 11, color: '#5a5648', margin: 0 }}>
                    {new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {s.feeling && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 8px',
                      background: '#f5c80011', color: '#f5c800',
                      border: '1px solid #f5c80033',
                      fontFamily: "'Barlow Condensed', sans-serif",
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                    }}>
                      {FEELING_LABELS[s.feeling]}
                    </span>
                  )}

                  {!isOwn && currentUserId && (
                    <button onClick={() => handleFollow(s.profiles.id)} style={{
                      padding: '4px 12px',
                      border: `1px solid ${following ? '#2a2518' : '#f5c800'}`,
                      background: following ? 'transparent' : '#f5c800',
                      color: following ? '#5a5648' : '#0a0800',
                      cursor: 'pointer', fontSize: 10, fontWeight: 900,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      fontFamily: "'Barlow Condensed', sans-serif",
                    }}>
                      {following ? 'FOLLOWING' : '+ FOLLOW'}
                    </button>
                  )}
                </div>
              </div>

              {/* Session content */}
              <Link href={`/${s.profiles.username}/journal/${s.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ padding: '12px 14px' }}>
                  <h3 style={{
                    fontSize: 18, fontWeight: 900, color: '#f0ede0',
                    textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6,
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}>
                    {s.title}
                  </h3>
                  {s.notes && (
                    <p style={{ fontSize: 13, color: '#5a5648', lineHeight: 1.5, marginBottom: 8 }}>
                      {s.notes.substring(0, 100)}{s.notes.length > 100 ? '...' : ''}
                    </p>
                  )}
                  {s.exercises && s.exercises.length > 0 && (
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {s.exercises.slice(0, 4).map((ex: any) => (
                        <span key={ex.id} style={{
                          fontSize: 10, padding: '2px 8px',
                          background: '#0a0800', color: '#5a5648',
                          border: '1px solid #2a2518',
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontWeight: 600, letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                        }}>
                          {ex.name}{ex.weight > 0 ? ` · ${ex.weight}kg` : ''}
                        </span>
                      ))}
                      {s.exercises.length > 4 && (
                        <span style={{ fontSize: 11, color: '#5a5648' }}>+{s.exercises.length - 4}</span>
                      )}
                    </div>
                  )}
                </div>
              </Link>

              {/* Footer */}
              <div style={{
                padding: '8px 14px',
                borderTop: '1px solid #2a2518',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <button onClick={() => handleLike(s)} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 12px',
                  background: userLiked ? '#f5c80015' : 'transparent',
                  border: `1px solid ${userLiked ? '#f5c80066' : '#2a2518'}`,
                  color: userLiked ? '#f5c800' : '#5a5648',
                  cursor: 'pointer', fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  transition: 'all 0.15s',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill={userLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {sessionLikes.length > 0 ? sessionLikes.length : 'LIKE'}
                </button>

                <Link href={`/${s.profiles.username}/journal/${s.id}`} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 12px',
                  background: 'transparent', border: '1px solid #2a2518',
                  color: '#5a5648', textDecoration: 'none',
                  fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  COMMENT
                </Link>

                <Link href={`/${s.profiles.username}/journal/${s.id}`} style={{
                  marginLeft: 'auto', fontSize: 11, color: '#f5c800',
                  textDecoration: 'none', fontWeight: 700,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  letterSpacing: '0.08em',
                }}>
                  VIEW →
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}