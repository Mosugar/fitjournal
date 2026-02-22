'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useSocialStore } from '@/lib/store/useSocialStore'
import { useUserStore } from '@/lib/store/useUserStore'
import toast from 'react-hot-toast'

const FEELING_LABELS = ['', 'Épuisé', 'Fatigué', 'Normal', 'Bien', 'Au top']
const PAGE_SIZE = 10

type Props = {
  initialSessions: any[]
  hasMore: boolean
}

export default function FeedClient({ initialSessions, hasMore: initialHasMore }: Props) {
  const [sessions, setSessions] = useState(initialSessions)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const loaderRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const profile = useUserStore((s) => s.profile)
  const currentUserId = profile?.id ?? null

  const isFollowing = useSocialStore((s) => s.isFollowing)
  const isLiked = useSocialStore((s) => s.isLiked)
  const getLikeCount = useSocialStore((s) => s.getLikeCount)
  const toggleFollow = useSocialStore((s) => s.toggleFollow)
  const toggleLike = useSocialStore((s) => s.toggleLike)
  const initLikes = useSocialStore((s) => s.initLikes)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)

    const { data } = await supabase
      .from('sessions')
      .select('*, exercises(*), profiles(id, username, display_name, avatar_url)')
      .order('created_at', { ascending: false })
      .range(sessions.length, sessions.length + PAGE_SIZE - 1)

    if (!data || data.length === 0) {
      setHasMore(false)
      setLoading(false)
      return
    }

    const newLikes = await supabase
      .from('likes')
      .select('session_id, user_id')
      .in('session_id', data.map(s => s.id))
    if (newLikes.data) initLikes(newLikes.data)

    setSessions(prev => [...prev, ...data])
    setHasMore(data.length === PAGE_SIZE)
    setLoading(false)
  }, [loading, hasMore, sessions.length])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore() },
      { threshold: 0.1 }
    )
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [loadMore])

  const handleLike = (session: any) => {
    if (!currentUserId) return toast.error('Sign in to like')
    toggleLike(session.id, session.profiles.id, currentUserId)
  }

  const handleFollow = (userId: string) => {
    if (!currentUserId) return toast.error('Sign in to follow')
    if (userId === currentUserId) return
    const nowFollowing = !isFollowing(userId)
    toggleFollow(userId, currentUserId)
    toast.success(nowFollowing ? 'Following! 🔥' : 'Unfollowed')
  }

  return (
    <div style={{ padding: 20, background: '#0a0800', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24, borderBottom: '1px solid #2a2518', paddingBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 4, height: 28, background: '#f5c800' }} />
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#f0ede0', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Barlow Condensed', sans-serif" }}>Feed</h1>
        </div>
        <p style={{ color: '#5a5648', fontSize: 13, marginTop: 4, marginLeft: 14 }}>Community sessions</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sessions.length === 0 ? (
          <div style={{ background: '#161410', border: '1px solid #2a2518', padding: '48px 20px', textAlign: 'center' }}>
            <p style={{ color: '#5a5648', fontSize: 14 }}>No sessions yet</p>
          </div>
        ) : sessions.map((s: any) => {
          const userLiked = isLiked(s.id, currentUserId ?? '')
          const likeCount = getLikeCount(s.id)
          const isOwn = s.profiles.id === currentUserId
          const following = isFollowing(s.profiles.id)

          return (
            <div key={s.id} style={{ background: '#161410', border: '1px solid #2a2518', borderLeft: '3px solid #2a2518' }}>
              <div style={{ padding: '12px 14px 10px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #2a2518' }}>
                <Link href={`/${s.profiles.username}`}>
                  <div style={{ width: 36, height: 36, padding: 2, background: '#f5c800', flexShrink: 0 }}>
                    <Image
                      src={s.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.profiles.username}`}
                      alt={s.profiles.display_name}
                      width={32} height={32}
                      style={{ objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                </Link>
                <div style={{ flex: 1 }}>
                  <Link href={`/${s.profiles.username}`} style={{ textDecoration: 'none' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#f0ede0', fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.profiles.display_name}</span>
                    <span style={{ fontSize: 11, color: '#5a5648', marginLeft: 6 }}>@{s.profiles.username}</span>
                  </Link>
                  <p style={{ fontSize: 11, color: '#5a5648', margin: 0 }}>
                    {new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {s.feeling && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', background: '#f5c80011', color: '#f5c800', border: '1px solid #f5c80033', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {FEELING_LABELS[s.feeling]}
                    </span>
                  )}
                  {!isOwn && currentUserId && (
                    <button onClick={() => handleFollow(s.profiles.id)} style={{
                      padding: '4px 12px', border: `1px solid ${following ? '#2a2518' : '#f5c800'}`,
                      background: following ? 'transparent' : '#f5c800', color: following ? '#5a5648' : '#0a0800',
                      cursor: 'pointer', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Barlow Condensed', sans-serif",
                    }}>
                      {following ? 'FOLLOWING' : '+ FOLLOW'}
                    </button>
                  )}
                </div>
              </div>

              <Link href={`/${s.profiles.username}/journal/${s.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ padding: '12px 14px' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: '#f0ede0', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, fontFamily: "'Barlow Condensed', sans-serif" }}>{s.title}</h3>
                  {s.notes && <p style={{ fontSize: 13, color: '#5a5648', lineHeight: 1.5, marginBottom: 8 }}>{s.notes.substring(0, 100)}{s.notes.length > 100 ? '...' : ''}</p>}
                  {s.exercises?.length > 0 && (
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {s.exercises.slice(0, 4).map((ex: any) => (
                        <span key={ex.id} style={{ fontSize: 10, padding: '2px 8px', background: '#0a0800', color: '#5a5648', border: '1px solid #2a2518', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          {ex.name}{ex.weight > 0 ? ` · ${ex.weight}kg` : ''}
                        </span>
                      ))}
                      {s.exercises.length > 4 && <span style={{ fontSize: 11, color: '#5a5648' }}>+{s.exercises.length - 4}</span>}
                    </div>
                  )}
                </div>
              </Link>

              <div style={{ padding: '8px 14px', borderTop: '1px solid #2a2518', display: 'flex', alignItems: 'center', gap: 6 }}>
                <button onClick={() => handleLike(s)} style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px',
                  background: userLiked ? '#f5c80015' : 'transparent', border: `1px solid ${userLiked ? '#f5c80066' : '#2a2518'}`,
                  color: userLiked ? '#f5c800' : '#5a5648', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Barlow Condensed', sans-serif", transition: 'all 0.15s',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill={userLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {likeCount > 0 ? likeCount : 'LIKE'}
                </button>
                <Link href={`/${s.profiles.username}/journal/${s.id}`} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: 'transparent', border: '1px solid #2a2518', color: '#5a5648', textDecoration: 'none', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Barlow Condensed', sans-serif" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  COMMENT
                </Link>
                <Link href={`/${s.profiles.username}/journal/${s.id}`} style={{ marginLeft: 'auto', fontSize: 11, color: '#f5c800', textDecoration: 'none', fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.08em' }}>VIEW →</Link>
              </div>
            </div>
          )
        })}

        {/* Infinite scroll trigger + loader */}
        <div ref={loaderRef} style={{ padding: '20px 0', textAlign: 'center' }}>
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 6, height: 6, background: '#f5c800', borderRadius: '50%', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          )}
          {!hasMore && sessions.length > 0 && (
            <p style={{ color: '#2a2518', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', fontFamily: "'Barlow Condensed', sans-serif" }}>— END OF FEED —</p>
          )}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,80%,100%{transform:scale(0.6);opacity:.4} 40%{transform:scale(1);opacity:1} }`}</style>
    </div>
  )
}