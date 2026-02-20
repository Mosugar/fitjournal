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
  if (mins < 1) return "À l'instant"
  if (mins < 60) return `${mins}min`
  if (hours < 24) return `${hours}h`
  return `${days}j`
}

const typeConfig = {
  like: {
    emoji: '❤️',
    label: (sessionTitle: string) => `a aimé ta séance "${sessionTitle}"`,
  },
  comment: {
    emoji: '💬',
    label: (sessionTitle: string) => `a commenté ta séance "${sessionTitle}"`,
  },
  follow: {
    emoji: '🔥',
    label: () => 'a commencé à te suivre',
  },
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
    <div style={{ padding: 20 }} className="fadeUp">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="condensed" style={{
          fontSize: 32, fontWeight: 900,
          textTransform: 'uppercase', marginBottom: 6, lineHeight: 1,
        }}>
          Notifications
        </h1>
        {unreadCount > 0 && (
          <span style={{
            fontSize: 12, fontWeight: 600,
            padding: '3px 10px', borderRadius: 20,
            background: 'var(--accent)', color: '#fff',
          }}>
            {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '60px 20px', textAlign: 'center',
        }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>🔔</p>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>
            Aucune notification pour l'instant.<br />
            Quand quelqu'un aime ou commente ta séance, tu le verras ici.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map((n, i) => {
            const config = typeConfig[n.type]
            const href = n.type === 'follow'
              ? `/${n.actor.username}`
              : `/${currentUsername}/journal/${n.sessions?.id}`

            return (
              <Link key={n.id} href={href} style={{ textDecoration: 'none' }}>
                <div
                  className="fadeUp"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: n.read ? 'var(--card)' : 'rgba(255,69,0,0.05)',
                    border: `1px solid ${n.read ? 'var(--border)' : 'rgba(255,69,0,0.25)'}`,
                    borderRadius: 14, padding: '12px 16px',
                    boxShadow: 'var(--shadow)',
                    animationDelay: `${i * 0.03}s`,
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Avatar + emoji badge */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img
                      src={n.actor.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.actor.username}`}
                      style={{
                        width: 44, height: 44, borderRadius: '50%',
                        objectFit: 'cover', border: '2px solid var(--border)',
                      }}
                      alt="avatar"
                    />
                    <span style={{
                      position: 'absolute', bottom: -3, right: -3,
                      fontSize: 15, lineHeight: 1,
                    }}>
                      {config.emoji}
                    </span>
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, color: 'var(--text)', margin: 0, lineHeight: 1.4 }}>
                      <span style={{ fontWeight: 700 }}>{n.actor.display_name}</span>
                      {' '}
                      <span style={{ color: 'var(--text2)' }}>
                        {config.label(n.sessions?.title || '')}
                      </span>
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text2)', margin: '3px 0 0' }}>
                      {timeAgo(n.created_at)}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: 'var(--accent)', flexShrink: 0,
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