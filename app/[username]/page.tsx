import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AppShell from '@/components/AppShell'
import ProfileClient from './ProfileClient'

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('username', username).single()
  if (!profile) return notFound()

  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: sessions },
    { data: myProfile },
    { count: followersCount },
    { count: followingCount },
    { data: followRow },
    { data: palmares },
    { data: personalRecords },
  ] = await Promise.all([
    supabase.from('sessions').select('*, exercises(*)').eq('user_id', profile.id).order('date', { ascending: false }),
    user ? supabase.from('profiles').select('*').eq('id', user.id).single() : Promise.resolve({ data: null }),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id),
    user && user.id !== profile.id
      ? supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', profile.id).single()
      : Promise.resolve({ data: null }),
    supabase.from('palmares').select('*').eq('user_id', profile.id).order('year', { ascending: false }),
    supabase.from('personal_records').select('*').eq('user_id', profile.id).order('lift', { ascending: true }),
  ])

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
        palmares={palmares || []}
        personalRecords={personalRecords || []}
      />
    </AppShell>
  )
}