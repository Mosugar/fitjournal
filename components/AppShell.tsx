'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types'
import { useEffect, useState } from 'react'

const IconProfile = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
)
const IconFeed = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const IconJournal = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="4" y="3" width="16" height="18" rx="2"/>
    <line x1="8" y1="8" x2="16" y2="8"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
    <line x1="8" y1="16" x2="12" y2="16"/>
  </svg>
)
const IconSearch = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconMessage = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const IconSun = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="4"/>
    <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
    <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
    <line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
  </svg>
)
const IconMoon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

export default function AppShell({ children, profile }: { children: React.ReactNode; profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [unreadCount, setUnreadCount] = useState(0)
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    setDark(saved !== 'light')
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    if (!profile) return
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('read', false)
      setUnreadCount(count || 0)
    }
    fetchUnread()
    const channel = supabase
      .channel('notif-bell')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${profile.id}`,
      }, () => setUnreadCount(c => c + 1))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [profile?.id])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const username = profile?.username

  const currentTab =
    pathname === '/feed' ? 'feed'
    : pathname === '/search' ? 'search'
    : pathname.startsWith('/messages') ? 'messages'
    : pathname.includes('/journal') ? 'journal'
    : 'profile'

  const tabs = [
    { id: 'profile',  label: 'PROFIL', icon: <IconProfile />, href: `/${username}` },
    { id: 'feed',     label: 'FEED',   icon: <IconFeed />,    href: '/feed' },
    { id: 'journal',  label: 'LOG',    icon: <IconJournal />, href: `/${username}/journal` },
    { id: 'search',   label: 'SEARCH', icon: <IconSearch />,  href: '/search' },
    { id: 'messages', label: 'MSG',    icon: <IconMessage />, href: '/messages' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0800' }}>

      {/* Header — like Instagram: logo left, bells + avatar right */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#0f0d00',
        borderBottom: '1px solid #2a2518',
        padding: '0 16px',
        height: 52,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Link href={username ? `/${username}` : '/'} style={{ textDecoration: 'none' }}>
          <span style={{
            fontSize: 22, fontWeight: 900,
            color: '#f5c800', letterSpacing: '0.1em',
            fontFamily: "'Barlow Condensed', sans-serif",
          }}>
            FITJOURNAL
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Theme toggle */}
          <button onClick={() => setDark(!dark)} style={{
            width: 36, height: 36,
            background: 'transparent', border: 'none',
            cursor: 'pointer', color: '#5a5648',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {dark ? <IconSun /> : <IconMoon />}
          </button>

          {/* Notifications bell — Instagram style in header */}
          {profile && (
            <Link href="/notifications" onClick={() => setUnreadCount(0)} style={{
              width: 36, height: 36, position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: pathname === '/notifications' ? '#f5c800' : '#5a5648',
              textDecoration: 'none',
            }}>
              <IconBell />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 4,
                  background: '#f5c800', color: '#0a0800',
                  borderRadius: '50%', minWidth: 16, height: 16,
                  fontSize: 9, fontWeight: 900,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #0f0d00',
                  padding: '0 2px',
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* Avatar */}
          {profile && (
            <Link href={`/${username}`}>
              <div style={{ width: 30, height: 30, padding: 2, background: '#f5c800' }}>
                <img
                  src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                  alt="avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </Link>
          )}

          <button onClick={handleLogout} style={{
            background: 'none', border: 'none',
            color: '#5a5648', cursor: 'pointer',
            fontSize: 11, fontWeight: 700,
            fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: '0.1em', textTransform: 'uppercase',
            marginLeft: 4,
          }}>
            Quit
          </button>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 72 }}>
        {children}
      </main>

      {/* Bottom Nav — 5 tabs, clean like Instagram */}
      {username && (
        <nav style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 480,
          background: '#0f0d00',
          borderTop: '1px solid #2a2518',
          display: 'flex', zIndex: 100,
          paddingBottom: 'env(safe-area-inset-bottom, 0)',
        }}>
          {tabs.map(t => {
            const active = currentTab === t.id
            return (
              <Link
                key={t.id}
                href={t.href}
                style={{
                  flex: 1, padding: '10px 0 8px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  textDecoration: 'none', position: 'relative',
                  color: active ? '#f5c800' : '#3a3428',
                  transition: 'color 0.15s',
                }}
              >
                {active && (
                  <span style={{
                    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                    width: 24, height: 2, background: '#f5c800',
                  }} />
                )}
                {t.icon}
                <span style={{
                  fontSize: 8, fontWeight: 700, letterSpacing: '0.08em',
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}>
                  {t.label}
                </span>
              </Link>
            )
          })}
        </nav>
      )}
    </div>
  )
}