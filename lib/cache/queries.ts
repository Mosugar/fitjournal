import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

const TTL = {
  profile: 60,
  sessions: 30,
  feed: 20,
  palmares: 300,
  prs: 120,
  follows: 30,
}

// Anon client — no cookies, safe inside unstable_cache.
// Works as long as your RLS allows public read on these tables.
function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export const getCachedProfile = (username: string) =>
  unstable_cache(
    async () => {
      const { data } = await getAnonClient().from('profiles').select('*').eq('username', username).single()
      return data
    },
    [`profile-${username}`],
    { revalidate: TTL.profile, tags: [`profile-${username}`] }
  )()

export const getCachedSessions = (userId: string) =>
  unstable_cache(
    async () => {
      const { data } = await getAnonClient().from('sessions').select('*, exercises(*)').eq('user_id', userId).order('date', { ascending: false })
      return data ?? []
    },
    [`sessions-${userId}`],
    { revalidate: TTL.sessions, tags: [`sessions-${userId}`] }
  )()

export const getCachedPalmares = (userId: string) =>
  unstable_cache(
    async () => {
      const { data } = await getAnonClient().from('palmares').select('*').eq('user_id', userId).order('year', { ascending: false })
      return data ?? []
    },
    [`palmares-${userId}`],
    { revalidate: TTL.palmares, tags: [`palmares-${userId}`] }
  )()

export const getCachedPRs = (userId: string) =>
  unstable_cache(
    async () => {
      const { data } = await getAnonClient().from('personal_records').select('*').eq('user_id', userId).order('lift', { ascending: true })
      return data ?? []
    },
    [`prs-${userId}`],
    { revalidate: TTL.prs, tags: [`prs-${userId}`] }
  )()

export const getCachedFollowCounts = (profileId: string) =>
  unstable_cache(
    async () => {
      const supabase = getAnonClient()
      const [{ count: followers }, { count: following }] = await Promise.all([
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profileId),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profileId),
      ])
      return { followers: followers ?? 0, following: following ?? 0 }
    },
    [`follows-${profileId}`],
    { revalidate: TTL.follows, tags: [`follows-${profileId}`] }
  )()

export const getCachedFeed = () =>
  unstable_cache(
    async () => {
      const { data } = await getAnonClient()
        .from('sessions')
        .select('*, exercises(*), profiles(id, username, display_name, avatar_url)')
        .order('created_at', { ascending: false })
        .range(0, 9)
      return data ?? []
    },
    ['feed-page-1'],
    { revalidate: TTL.feed, tags: ['feed'] }
  )()

// Current logged-in user's own profile — keyed by userId, short TTL
export const getCachedMyProfile = (userId: string) =>
  unstable_cache(
    async () => {
      const { data } = await getAnonClient().from('profiles').select('*').eq('id', userId).single()
      return data
    },
    [`my-profile-${userId}`],
    { revalidate: 30, tags: [`my-profile-${userId}`] }
  )()