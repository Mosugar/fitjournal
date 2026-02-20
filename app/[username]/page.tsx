import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AppShell from '@/components/AppShell'
import ProfileClient from './ProfileClient'

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()

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

  const { data: myProfile } = authUser ? await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single() : { data: null }

  const isOwn = authUser?.id === profile.id

  return (
    <AppShell profile={myProfile}>
      <ProfileClient
        profile={profile}
        sessions={sessions || []}
        isOwn={isOwn}
      />
    </AppShell>
  )
}