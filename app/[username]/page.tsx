import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AppShell from '@/components/AppShell'
import ProfileClient from './ProfileClient'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) return notFound()

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*, exercises(*)')
    .eq('user_id', profile.id)
    .order('date', { ascending: false })

  const { data: myProfile } = user
    ? await supabase.from('profiles').select('*').eq('id', user.id).single()
    : { data: null }

  // Followers count (people who follow this profile)
  const { count: followersCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profile.id)

  // Following count (people this profile follows)
  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', profile.id)

  // Is the current user following this profile?
  const { data: followRow } = user && user.id !== profile.id
    ? await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', profile.id)
        .single()
    : { data: null }

  const isOwn = user?.id === profile.id

  return (
    <AppShell profile={myProfile}>
      <ProfileClient
        profile={profile}
        sessions={sessions || []}
        isOwn={isOwn}
        followersCount={followersCount || 0}
        followingCount={followingCount || 0}
        isFollowing={!!followRow}
        currentUserId={user?.id || null}
      />
    </AppShell>
  )
}