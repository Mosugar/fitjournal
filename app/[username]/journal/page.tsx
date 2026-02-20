import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AppShell from '@/components/AppShell'
import JournalClient from './JournalClient'

export default async function JournalPage({
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

  const isOwn = user?.id === profile.id

  return (
    <AppShell profile={myProfile}>
      <JournalClient sessions={sessions || []} isOwn={isOwn} username={username} />
    </AppShell>
  )
}