import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppShell from '@/components/AppShell'
import AddSessionClient from './AddSessionClient'

export default async function AddSessionPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.username !== username) redirect(`/${profile?.username || ''}`)

  return (
    <AppShell profile={profile}>
      <AddSessionClient username={username} userId={user.id} />
    </AppShell>
  )
}