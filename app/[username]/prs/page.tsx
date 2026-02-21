import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PersonalRecordsClient from './PersonalRecordsClient'

export default async function PersonalRecordsPage({ params }: { params: { username: string } }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single()

  if (!profile) redirect('/')

  if (!user || user.id !== profile.id) redirect(`/${params.username}`)

  const { data: prs } = await supabase
    .from('personal_records')
    .select('*')
    .eq('user_id', profile.id)
    .order('weight', { ascending: false })

  return <PersonalRecordsClient profile={profile} initialPRs={prs || []} />
}