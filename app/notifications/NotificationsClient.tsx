'use client'

import Link from 'next/link'

type Notification = {
  id: string
  type: 'like' | 'comment' | 'follow'
  read: boolean
  created_at: string
  actor: { username: string; display_name: string; avatar_url: string | null }
  sessions: { id: string; title: string } | null
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m`
  if (hours < 24) return `${hours}h`
  return `${days}d`
}

const typeConfig = {
  like:    { label: '#f5c800', tag: 'LIKE',    text: (t: string) => `liked your session "${t}"` },
  comment: { label: '#f0ede0', tag: 'COMMENT', text: (t: string) => `commented on "${t}"` },
  follow:  { label: '#f5c800', tag: 'FOLLOW',  text: () => 'started following you' },
}

export default function NotificationsClient({
  notifications,
  currentUsername,
}: {
  notifications: Notification[]
  currentUsername: string
}) {
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div style={{ padding: 20, background: '#0a0800', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: 24, borderBottom: '1px solid #2a2518', paddingBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 4, height: 28, background: '#f5c800' }} />
          <h1 style={{
            fontSize: 32, fontWeight: 900, color: '#f0ede0',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            fontFamily: "'Barlow Condensed', sans-serif",
          }}>Notifications</h1>
        </div>
        {unreadCount > 0 && (
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 10px',
            background: '#f5c800', color: '#0a0800',
            fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            {unreadCount} NEW
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{
          background: '#161410', border: '1px solid #2a2518',
          borderLeft: '3px solid #2a2518',
          padding: '60px 20px', textAlign: 'center',
        }}>
          <p style={{ color: '#5a5648', fontSize: 14 }}>
            No notifications yet.<br />
            When someone likes or comments your session, you'll see it here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {notifications.map((n) => {
            const config = typeConfig[n.type]
            const href = n.type === 'follow'
              ? `/${n.actor.username}`
              : `/${currentUsername}/journal/${n.sessions?.id}`

            return (
              <Link key={n.id} href={href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: n.read ? '#161410' : '#f5c80008',
                  border: `1px solid ${n.read ? '#2a2518' : '#f5c80033'}`,
                  borderLeft: `3px solid ${n.read ? '#2a2518' : '#f5c800'}`,
                  padding: '12px 14px',
                  transition: 'all 0.15s',
                }}>
                  {/* Avatar */}
                  <div style={{ width: 40, height: 40, padding: 2, background: n.read ? '#2a2518' : '#f5c800', flexShrink: 0 }}>
                    <img
                      src={n.actor.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.actor.username}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      alt="avatar"
                    />
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{
                        fontSize: 9, fontWeight: 900, padding: '2px 7px',
                        background: '#f5c80015', color: '#f5c800',
                        border: '1px solid #f5c80033',
                        fontFamily: "'Barlow Condensed', sans-serif",
                        letterSpacing: '0.12em',
                      }}>
                        {config.tag}
                      </span>
                      <span style={{ fontSize: 11, color: '#5a5648' }}>{timeAgo(n.created_at)}</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#f0ede0', margin: 0, lineHeight: 1.4 }}>
                      <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em', fontFamily: "'Barlow Condensed', sans-serif" }}>
                        {n.actor.display_name}
                      </span>
                      {' '}
                      <span style={{ color: '#5a5648' }}>
                        {config.text(n.sessions?.title || '')}
                      </span>
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <span style={{
                      width: 7, height: 7,
                      background: '#f5c800', flexShrink: 0,
                    }} />
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}