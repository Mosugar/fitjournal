'use client'

import { Profile, Session } from '@/lib/types'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useSocialStore } from '@/lib/store/useSocialStore'
import { useUserStore } from '@/lib/store/useUserStore'
import toast from 'react-hot-toast'

const G = {
  black: '#0a0800', dark: '#111007', card: '#161410',
  gold: '#f5c800', goldDim: '#c9a200', white: '#f0ede0',
  grey: '#5a5648', border: '#2a2518',
}

const TornTop = () => (
  <svg viewBox="0 0 480 28" preserveAspectRatio="none"
    style={{ display: 'block', width: '100%', height: 28, position: 'absolute', top: -1, left: 0, zIndex: 2 }}>
    <path d="M0,28 L0,18 Q12,6 24,15 Q36,24 48,10 Q60,0 72,12 Q84,22 96,8 Q108,0 120,14 Q132,26 144,12 Q156,2 168,16 Q180,28 192,10 Q204,0 216,14 Q228,26 240,8 Q252,0 264,16 Q276,28 288,12 Q300,2 312,18 Q324,28 336,14 Q348,4 360,18 Q372,28 384,12 Q396,2 408,16 Q420,28 432,10 Q444,0 456,14 Q468,24 480,18 L480,28 Z"
      fill={G.dark} />
  </svg>
)
const TornBottom = () => (
  <svg viewBox="0 0 480 28" preserveAspectRatio="none"
    style={{ display: 'block', width: '100%', height: 28, position: 'absolute', bottom: -1, left: 0, zIndex: 2 }}>
    <path d="M0,0 L0,10 Q12,22 24,13 Q36,4 48,18 Q60,28 72,16 Q84,6 96,20 Q108,28 120,14 Q132,4 144,18 Q156,28 168,12 Q180,2 192,18 Q204,28 216,14 Q228,4 240,20 Q252,28 264,12 Q276,2 288,16 Q300,26 312,10 Q324,2 336,18 Q348,26 360,10 Q372,2 384,16 Q396,28 408,12 Q420,4 432,20 Q444,28 456,14 Q468,6 480,14 L480,0 Z"
      fill={G.dark} />
  </svg>
)

const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const IconFlame = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C9 7 6 8 6 13a6 6 0 0 0 12 0c0-4-3-7-6-11zm0 18a4 4 0 0 1-4-4c0-2.5 1.5-4 4-7 2.5 3 4 4.5 4 7a4 4 0 0 1-4 4z"/>
  </svg>
)
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconMsg = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)

function calcStreak(sessions: Session[]): number {
  if (sessions.length === 0) return 0
  const dates = [...new Set(sessions.map(s => s.date))].sort((a, b) => b.localeCompare(a))
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  if (dates[0] !== todayStr && dates[0] !== yesterdayStr) return 0
  let streak = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]); const curr = new Date(dates[i])
    if (Math.round((prev.getTime() - curr.getTime()) / 86400000) === 1) streak++; else break
  }
  return streak
}

type Palmares = {
  id: string; year: string; competition: string
  category: string; result: string; federation: string
}
type PR = {
  id: string; lift: string; weight: number; unit: string
  video_url: string | null; validated: boolean
}

type Props = {
  profile: Profile
  sessions: Session[]
  isOwn: boolean
  followersCount: number
  followingCount: number
  palmares?: Palmares[]
  personalRecords?: PR[]
}

export default function ProfileClient({
  profile,
  sessions,
  isOwn,
  followersCount: initialFollowersCount,
  followingCount,
  palmares = [],
  personalRecords = [],
}: Props) {
  const recentSessions = sessions.slice(0, 3)
  const streak = calcStreak(sessions)
  const supabase = createClient()
  const router = useRouter()
  const [messaging, setMessaging] = useState(false)

  // ── Store hooks ───────────────────────────────────────────
  const currentUser = useUserStore((s) => s.profile)
  const currentUserId = currentUser?.id ?? null

  const isFollowing = useSocialStore((s) => s.isFollowing)
  const toggleFollow = useSocialStore((s) => s.toggleFollow)
  const getFollowerCount = useSocialStore((s) => s.getFollowerCount)
  const setFollowerCount = useSocialStore((s) => s.setFollowerCount)

  // Seed the follower count into the store if not already set
  const storeCount = getFollowerCount(profile.id)
  const followersCount = storeCount > 0 ? storeCount : initialFollowersCount

  const following = isFollowing(profile.id)

  const handleFollow = () => {
    if (!currentUserId) return toast.error('Sign in to follow')
    // If not yet in store, seed the initial count first
    if (storeCount === 0) setFollowerCount(profile.id, initialFollowersCount)
    toggleFollow(profile.id, currentUserId)
    toast.success(following ? 'Unfollowed' : 'Following! 🔥')
  }

  const handleMessage = async () => {
    if (!currentUserId) return toast.error('Sign in to message')
    setMessaging(true)

    const { data: myParticipations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId)

    const myConvIds = myParticipations?.map(p => p.conversation_id) || []

    if (myConvIds.length > 0) {
      const { data: shared } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', profile.id)
        .in('conversation_id', myConvIds)
        .single()

      if (shared) {
        router.push(`/messages/${shared.conversation_id}`)
        setMessaging(false)
        return
      }
    }

    const { data: conv, error } = await supabase.from('conversations').insert({}).select().single()
    if (error || !conv) { toast.error('Could not start conversation'); setMessaging(false); return }

    await supabase.from('conversation_participants').insert([
      { conversation_id: conv.id, user_id: currentUserId },
      { conversation_id: conv.id, user_id: profile.id },
    ])

    router.push(`/messages/${conv.id}`)
    setMessaging(false)
  }

  const BIG3 = ['Squat', 'Bench Press', 'Deadlift']
  const big3PRs = BIG3.map(lift => personalRecords.find(p => p.lift === lift)).filter(Boolean) as PR[]
  const displayPRs = [...big3PRs, ...personalRecords.filter(p => !BIG3.includes(p.lift))].slice(0, 3)

  return (
    <div style={{ background: G.black, minHeight: '100vh', fontFamily: "'Barlow Condensed', sans-serif" }}>

      {/* ══ BANNER ══ */}
      <div style={{ position: 'relative', height: 240, overflow: 'hidden' }}>
        {(profile as any).banner_url ? (
          <Image
            src={(profile as any).banner_url}
            alt="banner"
            fill
            sizes="480px"
            style={{ objectFit: 'cover', filter: 'grayscale(60%) brightness(0.55)' }}
            priority
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: `linear-gradient(160deg, ${G.black} 0%, #1a1500 40%, #2d2000 70%, ${G.black} 100%)` }}>
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }} viewBox="0 0 480 240">
              {[0, 40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480].map(x => (
                <line key={x} x1={x} y1="0" x2={x - 240} y2="240" stroke={G.gold} strokeWidth="1" />
              ))}
            </svg>
          </div>
        )}
        <div style={{ position: 'absolute', top: 24, left: -10, right: -10, height: 4, background: G.gold, transform: 'rotate(-1.5deg)', boxShadow: `0 0 20px ${G.gold}66` }} />
        {profile.sport && (
          <div style={{ position: 'absolute', top: 36, left: 16, background: G.gold, padding: '3px 14px 3px 10px', clipPath: 'polygon(0 0, 100% 0, 92% 100%, 0% 100%)' }}>
            <span style={{ color: G.black, fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em' }}>#{profile.sport.toUpperCase()}</span>
          </div>
        )}
        <TornBottom />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, background: `linear-gradient(transparent, ${G.black})` }} />
      </div>

      <div style={{ padding: '0 16px', marginTop: -60, position: 'relative', zIndex: 3 }}>

        {/* ══ AVATAR + BUTTONS ══ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 88, height: 88, borderRadius: 4, padding: 3, background: `linear-gradient(135deg, ${G.gold}, ${G.goldDim})`, boxShadow: `0 0 30px ${G.gold}44`, position: 'relative' }}>
              <Image
                src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                alt="avatar"
                width={82}
                height={82}
                style={{ borderRadius: 2, objectFit: 'cover', filter: 'grayscale(20%)' }}
                priority
              />
            </div>
            {streak > 0 && (
              <div style={{ position: 'absolute', bottom: -6, right: -6, background: G.gold, borderRadius: 2, padding: '2px 6px', display: 'flex', alignItems: 'center', gap: 2, border: `2px solid ${G.black}` }}>
                <IconFlame /><span style={{ color: G.black, fontSize: 11, fontWeight: 900 }}>{streak}</span>
              </div>
            )}
          </div>

          {isOwn ? (
            <Link href={`/${profile.username}/edit`} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              background: 'transparent', border: `1px solid ${G.gold}`, color: G.gold,
              textDecoration: 'none', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>
              <IconEdit /> EDIT PROFILE
            </Link>
          ) : currentUserId && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleFollow} style={{
                padding: '8px 16px', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
                background: following ? 'transparent' : G.gold,
                color: following ? G.gold : G.black,
                outline: following ? `1px solid ${G.gold}` : 'none',
                transition: 'all 0.15s',
              }}>
                {following ? 'FOLLOWING ✓' : '+ FOLLOW'}
              </button>
              <button onClick={handleMessage} disabled={messaging} style={{
                padding: '8px 14px', cursor: messaging ? 'not-allowed' : 'pointer',
                fontSize: 13, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
                background: 'transparent', color: messaging ? G.grey : G.gold,
                border: `1px solid ${messaging ? G.grey : G.gold}`,
                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
              }}>
                <IconMsg /> {messaging ? '...' : 'MSG'}
              </button>
            </div>
          )}
        </div>

        {/* ══ NAME ══ */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 38, fontWeight: 900, color: G.white, textTransform: 'uppercase', lineHeight: 0.9, letterSpacing: '0.04em', marginBottom: 4 }}>
            {profile.display_name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 40, height: 3, background: G.gold }} />
            <span style={{ fontSize: 12, color: G.grey, fontWeight: 600, letterSpacing: '0.1em' }}>@{profile.username}</span>
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
            <span style={{ fontSize: 13 }}>
              <strong style={{ color: G.gold }}>{followersCount}</strong>
              <span style={{ color: G.grey }}> followers</span>
            </span>
            <span style={{ fontSize: 13 }}>
              <strong style={{ color: G.gold }}>{followingCount}</strong>
              <span style={{ color: G.grey }}> following</span>
            </span>
          </div>
          {profile.bio && <p style={{ fontSize: 14, color: G.grey, lineHeight: 1.5 }}>{profile.bio}</p>}
        </div>

        {/* ══ STATS ══ */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ background: G.card, border: `1px solid ${G.border}`, borderLeft: `3px solid ${G.gold}`, padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>
              <div style={{ textAlign: 'center', borderRight: `1px solid ${G.border}`, padding: '8px 0' }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: G.gold, lineHeight: 1 }}>{sessions.length}</div>
                <div style={{ fontSize: 10, color: G.grey, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 2 }}>SESSIONS</div>
              </div>
              <div style={{ textAlign: 'center', borderRight: `1px solid ${G.border}`, padding: '8px 0' }}>
                <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1, color: streak > 0 ? G.gold : G.grey, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                  {streak > 0 && <IconFlame />}{streak}
                </div>
                <div style={{ fontSize: 10, color: G.grey, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 2 }}>STREAK</div>
              </div>
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: G.gold, lineHeight: 1 }}>
                  {new Set(sessions.flatMap(s => s.exercises?.map((e: any) => e.name) || [])).size}
                </div>
                <div style={{ fontSize: 10, color: G.grey, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 2 }}>EXERCISES</div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ PERSONAL RECORDS ══ */}
        {(displayPRs.length > 0 || isOwn) && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 4, height: 20, background: G.gold }} />
              <h2 style={{ fontSize: 20, fontWeight: 900, color: G.white, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Personal Records</h2>
              <div style={{ flex: 1, height: 1, background: G.border }} />
              {isOwn && (
                <Link href={`/${profile.username}/prs`} style={{ fontSize: 10, color: G.gold, textDecoration: 'none', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', border: `1px solid ${G.gold}44`, padding: '4px 12px' }}>EDIT →</Link>
              )}
            </div>
            {displayPRs.length === 0 ? (
              <Link href={`/${profile.username}/prs`} style={{ textDecoration: 'none' }}>
                <div style={{ background: G.card, border: `1px dashed ${G.border}`, padding: '24px', textAlign: 'center' }}>
                  <p style={{ color: G.grey, fontSize: 13 }}>+ Add your personal records</p>
                </div>
              </Link>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: displayPRs.length < 3 ? `repeat(${displayPRs.length}, 1fr)` : '1fr 1fr 1fr', gap: 6 }}>
                  {displayPRs.map(pr => (
                    <div key={pr.id} style={{ background: G.card, border: `1px solid ${G.border}`, borderTop: `3px solid ${pr.validated ? G.gold : G.border}`, padding: '14px 10px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', bottom: -6, right: -2, fontSize: 52, fontWeight: 900, color: G.gold, opacity: 0.04, lineHeight: 1, pointerEvents: 'none' }}>{pr.weight}</div>
                      <div style={{ fontSize: 11, color: G.grey, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 6, textTransform: 'uppercase' }}>{pr.lift}</div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: G.gold, lineHeight: 1 }}>
                        {pr.weight}<span style={{ fontSize: 13, color: G.grey, fontWeight: 600 }}>{pr.unit}</span>
                      </div>
                      {pr.video_url && <div style={{ fontSize: 10, color: G.grey, marginTop: 4 }}>🎥</div>}
                      {!pr.validated && <div style={{ fontSize: 9, color: G.grey, marginTop: 2, letterSpacing: '0.08em' }}>pending</div>}
                    </div>
                  ))}
                </div>
                {big3PRs.length === 3 && (
                  <div style={{ marginTop: 6, background: G.card, border: `1px solid ${G.border}`, borderLeft: `3px solid ${G.gold}`, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: G.grey, fontWeight: 700, letterSpacing: '0.1em' }}>BIG 3 TOTAL</span>
                    <span style={{ fontSize: 22, fontWeight: 900, color: G.gold }}>{big3PRs.reduce((sum, p) => sum + p.weight, 0)}kg</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ══ PALMARÈS ══ */}
        {(palmares.length > 0 || isOwn) && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 4, height: 20, background: G.gold }} />
              <h2 style={{ fontSize: 20, fontWeight: 900, color: G.white, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Palmarès</h2>
              <div style={{ flex: 1, height: 1, background: G.border }} />
              {isOwn && (
                <Link href={`/${profile.username}/palmares`} style={{ fontSize: 10, color: G.gold, textDecoration: 'none', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', border: `1px solid ${G.gold}44`, padding: '4px 12px' }}>EDIT →</Link>
              )}
            </div>
            {palmares.length === 0 ? (
              <Link href={`/${profile.username}/palmares`} style={{ textDecoration: 'none' }}>
                <div style={{ background: G.card, border: `1px dashed ${G.border}`, padding: '24px', textAlign: 'center' }}>
                  <p style={{ color: G.grey, fontSize: 13 }}>+ Add your competition results</p>
                </div>
              </Link>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {palmares.slice(0, 5).map((p, i) => (
                  <div key={p.id} style={{ background: G.card, border: `1px solid ${G.border}`, borderLeft: `3px solid ${i === 0 ? G.gold : G.border}`, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 20, lineHeight: 1, minWidth: 28 }}>{p.result}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: G.white, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{p.competition}</div>
                        <div style={{ fontSize: 11, color: G.grey, marginTop: 1 }}>{[p.category, p.federation].filter(Boolean).join(' · ')}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 900, color: G.gold, background: `${G.gold}11`, padding: '3px 8px', border: `1px solid ${G.gold}33`, flexShrink: 0 }}>{p.year}</div>
                  </div>
                ))}
                {palmares.length > 5 && (
                  <Link href={`/${profile.username}/palmares`} style={{ textAlign: 'center', padding: '10px', color: G.grey, fontSize: 12, textDecoration: 'none', border: `1px solid ${G.border}`, fontWeight: 700, letterSpacing: '0.08em', display: 'block' }}>
                    +{palmares.length - 5} more results →
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ RECENT SESSIONS ══ */}
        <div style={{ marginBottom: 24, position: 'relative' }}>
          <div style={{ position: 'relative', background: G.card, borderTop: `1px solid ${G.border}`, paddingTop: 16 }}>
            <TornTop />
            <div style={{ padding: '0 0 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 4, height: 20, background: G.gold }} />
                <h2 style={{ fontSize: 20, fontWeight: 900, color: G.white, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recent Sessions</h2>
              </div>
              <Link href={`/${profile.username}/journal`} style={{ display: 'flex', alignItems: 'center', gap: 4, color: G.gold, textDecoration: 'none', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                ALL <IconArrow />
              </Link>
            </div>

            {recentSessions.length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center' }}>
                <p style={{ color: G.grey, fontSize: 14, marginBottom: 16 }}>{isOwn ? 'Start your first session!' : 'No sessions yet'}</p>
                {isOwn && (
                  <Link href={`/${profile.username}/journal/add`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: G.gold, color: G.black, textDecoration: 'none', fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    <IconPlus /> NEW SESSION
                  </Link>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {recentSessions.map((s, i) => (
                  <Link key={s.id} href={`/${profile.username}/journal/${s.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: i === 0 ? `${G.gold}08` : 'transparent',
                      border: `1px solid ${i === 0 ? G.gold + '44' : G.border}`,
                      borderLeft: `3px solid ${i === 0 ? G.gold : G.border}`,
                      padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: G.white, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{s.title}</div>
                        <div style={{ fontSize: 11, color: G.grey }}>
                          {new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {s.exercises && s.exercises.length > 0 && ` · ${s.exercises.length} exercises`}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {s.feeling && <span style={{ width: 6, height: 6, background: s.feeling >= 4 ? G.gold : G.grey, display: 'inline-block' }} />}
                        <span style={{ color: G.gold }}><IconArrow /></span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <TornBottom />
          </div>
        </div>

        <div style={{ height: 80 }} />
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');`}</style>
    </div>
  )
}