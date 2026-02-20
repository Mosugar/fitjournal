'use client'

import { useTheme } from '@/components/ThemeProvider'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types'
import { useEffect, useState } from 'react'

const IconProfile = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
)
const IconFeed = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const IconJournal = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="4" y="3" width="16" height="18" rx="2"/>
    <line x1="8" y1="8" x2="16" y2="8"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
    <line x1="8" y1="16" x2="12" y2="16"/>
  </svg>
)
const IconSearch = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const IconSun = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="4"/>
    <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
    <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
    <line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
  </svg>
)
const IconMoon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

export default function AppShell({ children, profile }: { children: React.ReactNode; profile: Profile | null }) {
  const { dark, setDark } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!profile) return

    // Fetch initial unread count
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('read', false)
      setUnreadCount(count || 0)
    }
    fetchUnread()

    // Realtime: increment badge when a new notification arrives
    const channel = supabase
      .channel('notif-bell')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${profile.id}`,
      }, () => {
        setUnreadCount(c => c + 1)
      })
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
    : pathname === '/notifications' ? 'notifications'
    : pathname.includes('/journal') ? 'journal'
    : 'profile'

  const tabs = [
    { id: 'profile', label: 'PROFIL', icon: <IconProfile />, href: `/${username}` },
    { id: 'feed',    label: 'FEED',   icon: <IconFeed />,    href: '/feed' },
    { id: 'journal', label: 'LOG',    icon: <IconJournal />, href: `/${username}/journal` },
    { id: 'search',  label: 'SEARCH', icon: <IconSearch />,  href: '/search' },
    { id: 'notifications', label: 'NOTIFS', icon: <IconBell />, href: '/notifications' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
        padding: '0 16px',
        height: 52,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Link href={username ? `/${username}` : '/'} style={{ textDecoration: 'none' }}>
          <span className="condensed" style={{
            fontSize: 22, fontWeight: 900,
            color: 'var(--accent)', letterSpacing: '0.08em',
          }}>
            FITJOURNAL
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setDark(!dark)} style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'var(--bg3)', border: '1px solid var(--border)',
            cursor: 'pointer', color: 'var(--text2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {dark ? <IconSun /> : <IconMoon />}
          </button>

          {profile && (
            <Link href={`/${username}`}>
              <img
                src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                alt="avatar"
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  border: '2px solid var(--accent)',
                  objectFit: 'cover', cursor: 'pointer',
                }}
              />
            </Link>
          )}

          <button onClick={handleLogout} style={{
            background: 'none', border: 'none',
            color: 'var(--text2)', cursor: 'pointer',
            fontSize: 12, fontWeight: 500,
          }}>
            Quitter
          </button>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 72 }}>
        {children}
      </main>

      {/* Bottom Nav */}
      {username && (
        <nav style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 480,
          background: 'var(--bg2)',
          borderTop: '1px solid var(--border)',
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
                  flex: 1, padding: '9px 0 7px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  textDecoration: 'none', position: 'relative',
                  color: active ? 'var(--accent)' : 'var(--text2)',
                  transition: 'color 0.15s',
                }}
                onClick={() => {
                  if (t.id === 'notifications') setUnreadCount(0)
                }}
              >
                {/* Active top indicator */}
                {active && (
                  <span style={{
                    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                    width: 18, height: 2, background: 'var(--accent)', borderRadius: 2,
                  }} />
                )}

                {/* Icon with badge */}
                <div style={{ position: 'relative' }}>
                  {t.icon}
                  {t.id === 'notifications' && unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: -5, right: -7,
                      background: 'var(--accent)', color: '#fff',
                      borderRadius: '50%', minWidth: 16, height: 16,
                      fontSize: 9, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid var(--bg2)',
                      padding: '0 2px',
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>

                <span className="condensed" style={{
                  fontSize: 8, fontWeight: 700, letterSpacing: '0.1em',
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