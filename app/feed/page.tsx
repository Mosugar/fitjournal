import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import FeedClient from './FeedClient'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: myProfile },
    { data: sessions },
    { data: likes },
    { data: follows },
  ] = await Promise.all([
    user ? supabase.from('profiles').select('*').eq('id', user.id).single() : Promise.resolve({ data: null }),
    supabase.from('sessions').select('*, exercises(*), profiles(id, username, display_name, avatar_url)').order('created_at', { ascending: false }).limit(30),
    supabase.from('likes').select('session_id, user_id'),
    user ? supabase.from('follows').select('following_id').eq('follower_id', user.id) : Promise.resolve({ data: [] }),
  ])

  return (
    <AppShell profile={myProfile}>
      <FeedClient
        sessions={sessions || []}
        likes={likes || []}
        follows={follows || []}
        currentUserId={user?.id || null}
        currentUserProfile={myProfile}
      />
    </AppShell>
  )
}