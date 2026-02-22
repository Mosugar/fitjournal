import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

type NotifStore = {
  unreadNotifs: number
  unreadMessages: number
  isSubscribed: boolean
  setUnreadNotifs: (count: number) => void
  setUnreadMessages: (count: number) => void
  clearNotifs: () => void
  clearMessages: () => void
  subscribe: (userId: string) => () => void
}

const G = {
  card: '#161410', border: '#2a2518', gold: '#f5c800',
  white: '#f0ede0', grey: '#5a5648', black: '#0a0800',
}

function showMessageToast(payload: any) {
  const preview = payload.message_preview || 'Sent you a message'
  const convId = payload.conversation_id

  toast(
    (t) => {
      const div = document.createElement('div')
      div.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;cursor:pointer;" onclick="window.location.href='/messages/${convId}'">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5c800" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <div>
            <div style="font-size:12px;font-weight:900;color:#f0ede0;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px;font-family:'Barlow Condensed',sans-serif;">
              New Message
            </div>
            <div style="font-size:12px;color:#5a5648;font-family:Barlow,sans-serif;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
              ${preview.substring(0, 50)}
            </div>
          </div>
        </div>
      `
      return div as any
    },
    {
      duration: 5000,
      position: 'top-center',
      style: {
        background: G.card,
        border: `1px solid ${G.border}`,
        borderLeft: `3px solid ${G.gold}`,
        padding: '12px 16px',
        color: G.white,
        maxWidth: 320,
        boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
      },
    }
  )
}

function showNotifToast(type: string) {
  const messages: Record<string, string> = {
    like: '❤️ Someone liked your session',
    follow: '🔥 Someone started following you',
    comment: '💬 Someone commented on your session',
  }
  const text = messages[type] || '🔔 New notification'

  toast(text, {
    duration: 4000,
    position: 'top-center',
    style: {
      background: G.card,
      border: `1px solid ${G.border}`,
      borderLeft: `3px solid ${G.gold}`,
      padding: '12px 16px',
      color: G.white,
      fontFamily: "'Barlow Condensed', sans-serif",
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: '0.06em',
      maxWidth: 320,
      boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
    },
  })
}

export const useNotifStore = create<NotifStore>((set, get) => ({
  unreadNotifs: 0,
  unreadMessages: 0,
  isSubscribed: false,

  setUnreadNotifs: (count) => set({ unreadNotifs: count }),
  setUnreadMessages: (count) => set({ unreadMessages: count }),
  clearNotifs: () => set({ unreadNotifs: 0 }),
  clearMessages: () => set({ unreadMessages: 0 }),

  subscribe: (userId: string) => {
    if (get().isSubscribed) return () => {}
    const supabase = createClient()

    const fetchCounts = async () => {
      const [{ count: notifCount }, { count: msgCount }] = await Promise.all([
        supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('read', false).neq('type', 'message'),
        supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('read', false).eq('type', 'message'),
      ])
      set({ unreadNotifs: notifCount ?? 0, unreadMessages: msgCount ?? 0 })
    }

    fetchCounts()

    const channel = supabase
      .channel(`notifs-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        if (payload.new.type === 'message') {
          set((s) => ({ unreadMessages: s.unreadMessages + 1 }))
          showMessageToast(payload.new)
        } else {
          set((s) => ({ unreadNotifs: s.unreadNotifs + 1 }))
          showNotifToast(payload.new.type)
        }
      })
      .subscribe()

    set({ isSubscribed: true })

    return () => {
      supabase.removeChannel(channel)
      set({ isSubscribed: false })
    }
  },
}))