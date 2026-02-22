import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import FeedClient from './FeedClient'
import { getCachedFeed, getCachedMyProfile } from '@/lib/cache/queries'

const PAGE_SIZE = 10

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [myProfile, sessions, likes, follows] = await Promise.all([
    user ? getCachedMyProfile(user.id) : null,
    getCachedFeed(),
    supabase.from('likes').select('session_id, user_id').then(r => r.data ?? []),
    user ? supabase.from('follows').select('following_id').eq('follower_id', user.id).then(r => r.data ?? []) : [],
  ])

  const followingIds = follows?.map((f: any) => f.following_id) ?? []
  const hasMore = sessions.length === PAGE_SIZE

  return (
    <AppShell profile={myProfile} followingIds={followingIds} likes={likes}>
      <FeedClient initialSessions={sessions} hasMore={hasMore} />
    </AppShell>
  )
}