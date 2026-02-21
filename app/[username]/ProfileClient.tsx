'use client'

import { Profile, Session, Palmares, PersonalRecord } from '@/lib/types'
import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const FEELING_COLORS = ['', '#888', '#aaa', '#f5c800', '#f5c800', '#f5c800']

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
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C9 7 6 8 6 13a6 6 0 0 0 12 0c0-4-3-7-6-11zm0 18a4 4 0 0 1-4-4c0-2.5 1.5-4 4-7 2.5 3 4 4.5 4 7a4 4 0 0 1-4 4z"/>
  </svg>
)
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const TornEdge = ({ flip = false }: { flip?: boolean }) => (
  <svg
    viewBox="0 0 480 32"
    preserveAspectRatio="none"
    style={{
      display: 'block', width: '100%', height: 32,
      transform: flip ? 'scaleY(-1)' : 'none',
    }}
  >
    <path
      d="M0,32 L0,20 Q8,8 16,18 Q24,28 32,14 Q40,4 48,16 Q56,26 64,12 Q72,2 80,16 Q88,28 96,14 Q104,4 112,18 Q120,28 128,12 Q136,2 144,18 Q152,28 160,12 Q168,4 176,18 Q184,28 192,10 Q200,0 208,16 Q216,28 224,12 Q232,2 240,18 Q248,28 256,14 Q264,4 272,18 Q280,28 288,12 Q296,2 304,16 Q312,26 320,12 Q328,2 336,16 Q344,28 352,14 Q360,4 368,18 Q376,28 384,12 Q392,2 400,18 Q408,28 416,14 Q424,4 432,18 Q440,28 448,12 Q456,4 464,18 Q472,26 480,20 L480,32 Z"
      fill="#0a0800"
    />
  </svg>
)

function calcStreak(sessions: Session[]): number {
  if (sessions.length === 0) return 0
  const dates = [...new Set(sessions.map(s => s.date))].sort((a, b) => b.localeCompare(a))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  if (dates[0] !== todayStr && dates[0] !== yesterdayStr) return 0
  let streak = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 1) { streak++ } else { break }
  }
  return streak
}

type Props = {
  profile: Profile
  sessions: Session[]
  isOwn: boolean
  followersCount: number
  followingCount: number
  isFollowing?: boolean
  currentUserId?: string | null
  palmares?: Palmares[]
  personalRecords?: PersonalRecord[]
}

export default function ProfileClient({
  profile,
  sessions,
  isOwn,
  followersCount: initialFollowersCount,
  followingCount,
  isFollowing: initialIsFollowing = false,
  currentUserId = null,
  palmares = [],
  personalRecords = [],
}: Props) {
  const recentSessions = sessions.slice(0, 3)
  const streak = calcStreak(sessions)
  const supabase = createClient()
  const [following, setFollowing] = useState(initialIsFollowing)
  const [followersCount, setFollowersCount] = useState(initialFollowersCount)

  const handleFollow = async () => {
    if (!currentUserId) return toast.error('Connecte-toi pour suivre')
    if (following) {
      setFollowing(false)
      setFollowersCount(c => c - 1)
      await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', profile.id)
      toast.success('Abonnement annulé')
    } else {
      setFollowing(true)
      setFollowersCount(c => c + 1)
      await supabase.from('follows').insert({ follower_id: currentUserId, following_id: profile.id })
      await supabase.from('notifications').insert({ user_id: profile.id, actor_id: currentUserId, type: 'follow' })
      toast.success('Abonné ! 🔥')
    }
  }

  const uniqueExercises = new Set(sessions.flatMap(s => s.exercises?.map(e => e.name) || [])).size

  return (
    <div style={{ background: '#0a0800', minHeight: '100vh' }}>

      {/* ── BANNER ── */}
      <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
        {profile.banner_url ? (
          <img
            src={profile.banner_url}
            alt="banner"
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(50%) brightness(0.6)' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(160deg, #0a0800 0%, #1c1500 40%, #2e2000 70%, #0a0800 100%)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* diagonal lines */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07 }} viewBox="0 0 480 220">
              {[0, 48, 96, 144, 192, 240, 288, 336, 384, 432, 480, 528].map(x => (
                <line key={x} x1={x} y1="0" x2={x - 220} y2="220" stroke="#f5c800" strokeWidth="1" />
              ))}
            </svg>
          </div>
        )}

        {/* Sport badge */}
        {profile.sport && (
          <div style={{
            position: 'absolute', top: 20, left: 16,
            background: '#f5c800',
            padding: '4px 16px 4px 12px',
            clipPath: 'polygon(0 0, 100% 0, 94% 100%, 0 100%)',
          }}>
            <span style={{
              color: '#0a0800', fontSize: 12, fontWeight: 900,
              textTransform: 'uppercase', letterSpacing: '0.14em',
              fontFamily: "'Barlow Condensed', sans-serif",
            }}>
              #{profile.sport.toUpperCase()}
            </span>
          </div>
        )}

        {/* Gold stripe */}
        <div style={{
          position: 'absolute', bottom: 40, left: 0, right: 0,
          height: 3, background: '#f5c800',
          transform: 'rotate(-0.8deg)',
          boxShadow: '0 0 20px #f5c80066',
        }} />

        {/* Torn bottom */}
        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0 }}>
          <TornEdge />
        </div>
      </div>

      <div style={{ padding: '0 16px', marginTop: -52, position: 'relative', zIndex: 3 }}>

        {/* ── AVATAR ROW ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>

          <div style={{ position: 'relative' }}>
            {/* Gold frame */}
            <div style={{
              width: 86, height: 86,
              padding: 3,
              background: 'linear-gradient(135deg, #f5c800, #c9a200)',
              boxShadow: '0 0 24px #f5c80044',
            }}>
              <img
                src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                alt="avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'grayscale(15%)' }}
              />
            </div>

          </div>

          {isOwn ? (
            <Link href={`/${profile.username}/edit`} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid #f5c800',
              color: '#f5c800',
              textDecoration: 'none', fontSize: 12, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.1em',
              fontFamily: "'Barlow Condensed', sans-serif",
            }}>
              <IconEdit /> Modifier
            </Link>
          ) : currentUserId && (
            <button onClick={handleFollow} style={{
              padding: '8px 20px',
              border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 900, letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontFamily: "'Barlow Condensed', sans-serif",
              background: following ? 'transparent' : '#f5c800',
              color: following ? '#f5c800' : '#0a0800',
              outline: following ? '1px solid #f5c800' : 'none',
              transition: 'all 0.15s',
            }}>
              {following ? 'ABONNÉ ✓' : '+ SUIVRE'}
            </button>
          )}
        </div>

        {/* ── NAME + BIO ── */}
        <div style={{ marginBottom: 22 }}>
          <h1 style={{
            fontSize: 36, fontWeight: 900,
            color: '#f0ede0', textTransform: 'uppercase',
            lineHeight: 0.95, letterSpacing: '0.03em',
            marginBottom: 6,
            fontFamily: "'Barlow Condensed', sans-serif",
          }}>
            {profile.display_name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 32, height: 3, background: '#f5c800' }} />
            <span style={{ fontSize: 12, color: '#5a5648', fontWeight: 600, letterSpacing: '0.1em' }}>
              @{profile.username}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#f0ede0', fontFamily: "'Barlow Condensed', sans-serif" }}>
              <strong style={{ color: '#f5c800' }}>{followersCount}</strong>
              {' '}<span style={{ color: '#5a5648' }}>abonnés</span>
            </span>
            <span style={{ fontSize: 13, color: '#f0ede0', fontFamily: "'Barlow Condensed', sans-serif" }}>
              <strong style={{ color: '#f5c800' }}>{followingCount}</strong>
              {' '}<span style={{ color: '#5a5648' }}>abonnements</span>
            </span>
          </div>

          {profile.bio && (
            <p style={{ fontSize: 14, color: '#5a5648', lineHeight: 1.5 }}>{profile.bio}</p>
          )}
        </div>

        {/* ── STATS ── */}
        <div style={{
          background: '#161410',
          border: '1px solid #2a2518',
          borderLeft: '3px solid #f5c800',
          marginBottom: 24,
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        }}>
          {[
            { value: sessions.length, label: 'SÉANCES' },
            { value: streak, label: 'STREAK', flame: true },
            { value: uniqueExercises, label: 'EXERCICES' },
          ].map((stat, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '16px 8px',
              borderRight: i < 2 ? '1px solid #2a2518' : 'none',
            }}>
              <div style={{
                fontSize: 34, fontWeight: 900, lineHeight: 1,
                color: stat.value > 0 ? '#f5c800' : '#5a5648',
                fontFamily: "'Barlow Condensed', sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                marginBottom: 4,
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 9, color: '#5a5648', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── PERSONAL RECORDS ── */}
        {personalRecords.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 4, height: 18, background: '#f5c800' }} />
              <h2 style={{
                fontSize: 18, fontWeight: 900, color: '#f0ede0',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                fontFamily: "'Barlow Condensed', sans-serif",
              }}>Records Perso</h2>
              <div style={{ flex: 1, height: 1, background: '#2a2518' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(personalRecords.length, 3)}, 1fr)`, gap: 6 }}>
              {personalRecords.map(pr => (
                <div key={pr.id} style={{
                  background: '#161410',
                  border: '1px solid #2a2518',
                  borderTop: '3px solid #f5c800',
                  padding: '14px 10px',
                  textAlign: 'center',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', bottom: -8, right: -2,
                    fontSize: 48, fontWeight: 900, color: '#f5c800',
                    opacity: 0.04, lineHeight: 1, pointerEvents: 'none',
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}>{pr.weight}</div>
                  <div style={{ fontSize: 10, color: '#5a5648', fontWeight: 700, letterSpacing: '0.15em', marginBottom: 6, textTransform: 'uppercase' }}>
                    {pr.lift}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: '#f5c800', lineHeight: 1, fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {pr.weight}<span style={{ fontSize: 12, color: '#5a5648', fontWeight: 600 }}>kg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PALMARÈS ── */}
        {palmares.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 4, height: 18, background: '#f5c800' }} />
              <h2 style={{
                fontSize: 18, fontWeight: 900, color: '#f0ede0',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                fontFamily: "'Barlow Condensed', sans-serif",
              }}>Palmarès</h2>
              <div style={{ flex: 1, height: 1, background: '#2a2518' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {palmares.map((p, i) => (
                <div key={p.id} style={{
                  background: '#161410',
                  border: '1px solid #2a2518',
                  borderLeft: `3px solid ${i === 0 ? '#f5c800' : '#2a2518'}`,
                  padding: '12px 14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 20, lineHeight: 1 }}>
                      {p.result.includes('1') ? '🥇' : p.result.includes('2') ? '🥈' : p.result.includes('3') ? '🥉' : '🏅'}
                    </span>
                    <div>
                      <div style={{
                        fontSize: 14, fontWeight: 700, color: '#f0ede0',
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                        fontFamily: "'Barlow Condensed', sans-serif",
                      }}>
                        {p.competition}
                      </div>
                      <div style={{ fontSize: 11, color: '#5a5648', marginTop: 2 }}>
                        {p.result}{p.category ? ` · ${p.category}` : ''}{p.federation ? ` · ${p.federation}` : ''}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 900, color: '#f5c800',
                    background: '#f5c80011',
                    padding: '3px 8px',
                    border: '1px solid #f5c80033',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    letterSpacing: '0.08em',
                  }}>
                    {p.year}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SÉANCES RÉCENTES ── */}
        <div style={{ marginBottom: 80 }}>

          {/* Torn top */}
          <div style={{ marginLeft: -16, marginRight: -16 }}>
            <TornEdge flip />
          </div>

          <div style={{
            background: '#161410',
            marginLeft: -16, marginRight: -16,
            padding: '20px 16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 4, height: 18, background: '#f5c800' }} />
                <h2 style={{
                  fontSize: 18, fontWeight: 900, color: '#f0ede0',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}>Séances récentes</h2>
              </div>
              <Link href={`/${profile.username}/journal`} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                color: '#f5c800', textDecoration: 'none',
                fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: "'Barlow Condensed', sans-serif",
              }}>
                TOUT VOIR <IconArrow />
              </Link>
            </div>

            {recentSessions.length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center' }}>
                <p style={{ color: '#5a5648', fontSize: 14, marginBottom: 16 }}>
                  {isOwn ? 'Lance ta première séance !' : "Aucune séance pour l'instant"}
                </p>
                {isOwn && (
                  <Link href={`/${profile.username}/journal/add`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '10px 20px',
                    background: '#f5c800', color: '#0a0800',
                    textDecoration: 'none', fontSize: 13, fontWeight: 900,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}>
                    <IconPlus /> NOUVELLE SÉANCE
                  </Link>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {recentSessions.map((s, i) => (
                  <Link key={s.id} href={`/${profile.username}/journal/${s.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: i === 0 ? '#f5c80008' : 'transparent',
                      border: '1px solid #2a2518',
                      borderLeft: `3px solid ${i === 0 ? '#f5c800' : '#2a2518'}`,
                      padding: '12px 14px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div>
                        <div style={{
                          fontSize: 15, fontWeight: 800, color: '#f0ede0',
                          textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2,
                          fontFamily: "'Barlow Condensed', sans-serif",
                        }}>
                          {s.title}
                        </div>
                        <div style={{ fontSize: 11, color: '#5a5648' }}>
                          {new Date(s.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {s.exercises && s.exercises.length > 0 && ` · ${s.exercises.length} exos`}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {s.feeling && (
                          <span style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: FEELING_COLORS[s.feeling], display: 'inline-block',
                          }} />
                        )}
                        <span style={{ color: '#f5c800' }}><IconArrow /></span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Torn bottom */}
          <div style={{ marginLeft: -16, marginRight: -16 }}>
            <TornEdge />
          </div>
        </div>

      </div>
    </div>
  )
}