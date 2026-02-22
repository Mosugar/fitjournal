import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AppShell from '@/components/AppShell'
import ProfileClient from './ProfileClient'
import {
  getCachedProfile,
  getCachedMyProfile,
  getCachedSessions,
  getCachedPalmares,
  getCachedPRs,
  getCachedFollowCounts,
} from '@/lib/cache/queries'

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [profile, myProfile, follows] = await Promise.all([
    getCachedProfile(username),
    user ? getCachedMyProfile(user.id) : null,
    user ? supabase.from('follows').select('following_id').eq('follower_id', user.id).then(r => r.data) : [],
  ])

  if (!profile) return notFound()

  const [sessions, { followers, following }, palmares, personalRecords] = await Promise.all([
    getCachedSessions(profile.id),
    getCachedFollowCounts(profile.id),
    getCachedPalmares(profile.id),
    getCachedPRs(profile.id),
  ])

  const isOwn = user?.id === profile.id
  const followingIds = follows?.map((f: any) => f.following_id) ?? []

  return (
    <AppShell profile={myProfile} followingIds={followingIds}>
      <ProfileClient
        profile={profile}
        sessions={sessions}
        isOwn={isOwn}
        followersCount={followers}
        followingCount={following}
        palmares={palmares}
        personalRecords={personalRecords}
      />
    </AppShell>
  )
}