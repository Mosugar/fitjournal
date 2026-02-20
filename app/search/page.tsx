import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import SearchClient from './SearchClient'

export default async function SearchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: myProfile } = user ? await supabase.from('profiles').select('*').eq('id', user.id).single() : { data: null }

  return (
    <AppShell profile={myProfile}>
      <SearchClient />
    </AppShell>
  )
}