'use client'

import { useEffect } from 'react'
import { useUserStore } from '@/lib/store/useUserStore'
import { useSocialStore } from '@/lib/store/useSocialStore'
import { useNotifStore } from '@/lib/store/useNotifStore'
import { Profile } from '@/lib/types'

type Props = {
  profile: Profile | null
  followingIds?: string[]
  likes?: { session_id: string; user_id: string }[]
  followerCounts?: { userId: string; count: number }[]
}

/**
 * Drop this in AppShell (or any layout) to hydrate all stores at once.
 * Server components fetch the data, this component pushes it into Zustand.
 */
export default function StoreInitializer({
  profile,
  followingIds = [],
  likes = [],
  followerCounts = [],
}: Props) {
  const setProfile = useUserStore((s) => s.setProfile)
  const initFollowing = useSocialStore((s) => s.initFollowing)
  const initLikes = useSocialStore((s) => s.initLikes)
  const setFollowerCount = useSocialStore((s) => s.setFollowerCount)
  const subscribe = useNotifStore((s) => s.subscribe)

  // Hydrate user
  useEffect(() => {
    setProfile(profile)
  }, [profile?.id])

  // Hydrate social
  useEffect(() => {
    initFollowing(followingIds)
  }, [followingIds.join(',')])

  useEffect(() => {
    initLikes(likes)
  }, [likes.length])

  useEffect(() => {
    for (const { userId, count } of followerCounts) {
      setFollowerCount(userId, count)
    }
  }, [followerCounts.length])

  // Start real-time notif subscription
  useEffect(() => {
    if (!profile?.id) return
    const unsubscribe = subscribe(profile.id)
    return unsubscribe
  }, [profile?.id])

  return null
}