import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppShell from '@/components/AppShell'
import PersonalRecordsClient from './PersonalRecordsClient'

export default async function PersonalRecordsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) redirect('/')
  if (!user || user.id !== profile.id) redirect(`/${username}`)

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: prs } = await supabase
    .from('personal_records')
    .select('*')
    .eq('user_id', profile.id)
    .order('weight', { ascending: false })

  return (
    <AppShell profile={myProfile}>
      <PersonalRecordsClient profile={profile} initialPRs={prs || []} />
    </AppShell>
  )
}