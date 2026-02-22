import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

type NotifStore = {
  unreadNotifs: number
  unreadMessages: number
  isSubscribed: boolean

  setUnreadNotifs: (count: number) => void
  setUnreadMessages: (count: number) => void
  clearNotifs: () => void
  clearMessages: () => void

  // Real-time subscription (call once in AppShell)
  subscribe: (userId: string) => () => void
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

    // Fetch initial counts
    const fetchCounts = async () => {
      const [{ count: notifCount }, { count: msgCount }] = await Promise.all([
        supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('read', false)
          .neq('type', 'message'),
        supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('read', false)
          .eq('type', 'message'),
      ])
      set({
        unreadNotifs: notifCount ?? 0,
        unreadMessages: msgCount ?? 0,
      })
    }

    fetchCounts()

    // Real-time listener
    const channel = supabase
      .channel(`notifs-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new.type === 'message') {
            set((s) => ({ unreadMessages: s.unreadMessages + 1 }))
          } else {
            set((s) => ({ unreadNotifs: s.unreadNotifs + 1 }))
          }
        }
      )
      .subscribe()

    set({ isSubscribed: true })

    // Return cleanup function
    return () => {
      supabase.removeChannel(channel)
      set({ isSubscribed: false })
    }
  },
}))