import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppShell from '@/components/AppShell'
import NotificationsClient from './NotificationsClient'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: myProfile },
    { data: notifications },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('notifications')
      .select('*, actor:profiles!notifications_actor_id_fkey(username, display_name, avatar_url), sessions(id, title)')
      .eq('user_id', user.id)
      .neq('type', 'message')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  // Mark all as read
  await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)

  return (
    <AppShell profile={myProfile}>
      <NotificationsClient
        notifications={notifications || []}
        currentUsername={myProfile?.username || ''}
      />
    </AppShell>
  )
}