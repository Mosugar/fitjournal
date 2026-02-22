import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AppShell from '@/components/AppShell'
import JournalClient from './JournalClient'
import { getCachedProfile, getCachedMyProfile, getCachedSessions } from '@/lib/cache/queries'

export default async function JournalPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [profile, myProfile, follows] = await Promise.all([
    getCachedProfile(username),
    user ? getCachedMyProfile(user.id) : null,
    user ? supabase.from('follows').select('following_id').eq('follower_id', user.id).then(r => r.data ?? []) : [],
  ])

  if (!profile) return notFound()

  const sessions = await getCachedSessions(profile.id)
  const isOwn = user?.id === profile.id
  const followingIds = follows?.map((f: any) => f.following_id) ?? []

  return (
    <AppShell profile={myProfile} followingIds={followingIds}>
      <JournalClient sessions={sessions} isOwn={isOwn} username={username} />
    </AppShell>
  )
}