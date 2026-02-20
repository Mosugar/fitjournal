import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import AppShell from '@/components/AppShell'
import EditSessionClient from './EditSessionClient'

export default async function EditSessionPage({
  params,
}: {
  params: Promise<{ username: string; sessionId: string }>
}) {
  const { username, sessionId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: session } = await supabase
    .from('sessions')
    .select('*, exercises(*)')
    .eq('id', sessionId)
    .single()

  if (!session) return notFound()
  if (session.user_id !== user.id) redirect(`/${username}/journal/${sessionId}`)

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <AppShell profile={profile}>
      <EditSessionClient session={session} username={username} />
    </AppShell>
  )
}