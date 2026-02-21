import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PalmaresClient from './PalmaresClient'

export default async function PalmaresPage({ params }: { params: { username: string } }) {
  const supabase = await createClient()

  // getUser() is secure but requires middleware to refresh token
  // getSession() works as fallback if middleware isn't set up
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single()

  if (!profile) redirect('/')

  // If not logged in or not the owner → redirect to profile
  if (!user || user.id !== profile.id) redirect(`/${params.username}`)

  const { data: palmares } = await supabase
    .from('palmares')
    .select('*')
    .eq('user_id', profile.id)
    .order('year', { ascending: false })

  return <PalmaresClient profile={profile} initialPalmares={palmares || []} />
}