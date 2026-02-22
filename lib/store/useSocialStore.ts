import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

type SocialStore = {
  // Follows: Set of user IDs that the current user follows
  followingIds: Set<string>
  // Likes: Map of sessionId → Set of userIds who liked it
  likes: Map<string, Set<string>>
  // Followers count per profile (profileId → count)
  followerCounts: Map<string, number>

  // Actions
  initFollowing: (ids: string[]) => void
  initLikes: (likes: { session_id: string; user_id: string }[]) => void
  setFollowerCount: (userId: string, count: number) => void

  toggleFollow: (targetUserId: string, currentUserId: string) => Promise<void>
  toggleLike: (sessionId: string, sessionOwnerId: string, currentUserId: string) => Promise<void>

  // Selectors (computed values)
  isFollowing: (userId: string) => boolean
  isLiked: (sessionId: string, userId: string) => boolean
  getLikeCount: (sessionId: string) => number
  getFollowerCount: (userId: string) => number
}

export const useSocialStore = create<SocialStore>((set, get) => ({
  followingIds: new Set(),
  likes: new Map(),
  followerCounts: new Map(),

  // ── Init ──────────────────────────────────────────────────
  initFollowing: (ids) => set({ followingIds: new Set(ids) }),

  initLikes: (likesArray) => {
    const map = new Map<string, Set<string>>()
    for (const { session_id, user_id } of likesArray) {
      if (!map.has(session_id)) map.set(session_id, new Set())
      map.get(session_id)!.add(user_id)
    }
    set({ likes: map })
  },

  setFollowerCount: (userId, count) =>
    set((state) => {
      const next = new Map(state.followerCounts)
      next.set(userId, count)
      return { followerCounts: next }
    }),

  // ── Follow / Unfollow ─────────────────────────────────────
  toggleFollow: async (targetUserId, currentUserId) => {
    const { followingIds, followerCounts } = get()
    const supabase = createClient()
    const wasFollowing = followingIds.has(targetUserId)

    // Optimistic update
    const nextIds = new Set(followingIds)
    const nextCounts = new Map(followerCounts)
    const currentCount = nextCounts.get(targetUserId) ?? 0

    if (wasFollowing) {
      nextIds.delete(targetUserId)
      nextCounts.set(targetUserId, Math.max(0, currentCount - 1))
    } else {
      nextIds.add(targetUserId)
      nextCounts.set(targetUserId, currentCount + 1)
    }
    set({ followingIds: nextIds, followerCounts: nextCounts })

    // Persist to Supabase
    if (wasFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: currentUserId, following_id: targetUserId })

      // Notification
      await supabase.from('notifications').insert({
        user_id: targetUserId,
        actor_id: currentUserId,
        type: 'follow',
      })
    }
  },

  // ── Like / Unlike ─────────────────────────────────────────
  toggleLike: async (sessionId, sessionOwnerId, currentUserId) => {
    const { likes } = get()
    const supabase = createClient()
    const sessionLikes = new Set(likes.get(sessionId) ?? [])
    const wasLiked = sessionLikes.has(currentUserId)

    // Optimistic update
    if (wasLiked) {
      sessionLikes.delete(currentUserId)
    } else {
      sessionLikes.add(currentUserId)
    }
    const nextLikes = new Map(likes)
    nextLikes.set(sessionId, sessionLikes)
    set({ likes: nextLikes })

    // Persist
    if (wasLiked) {
      await supabase
        .from('likes')
        .delete()
        .eq('user_id', currentUserId)
        .eq('session_id', sessionId)
    } else {
      await supabase
        .from('likes')
        .insert({ user_id: currentUserId, session_id: sessionId })

      if (sessionOwnerId !== currentUserId) {
        await supabase.from('notifications').insert({
          user_id: sessionOwnerId,
          actor_id: currentUserId,
          type: 'like',
          session_id: sessionId,
        })
      }
    }
  },

  // ── Selectors ─────────────────────────────────────────────
  isFollowing: (userId) => get().followingIds.has(userId),
  isLiked: (sessionId, userId) => get().likes.get(sessionId)?.has(userId) ?? false,
  getLikeCount: (sessionId) => get().likes.get(sessionId)?.size ?? 0,
  getFollowerCount: (userId) => get().followerCounts.get(userId) ?? 0,
}))