import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import AppShell from '@/components/AppShell'
import ChatClient from './ChatClient'

export default async function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myProfile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  // Verify user is participant
  const { data: participation } = await supabase
    .from('conversation_participants')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .single()

  if (!participation) return notFound()

  // Get other participant
  const { data: otherParticipation } = await supabase
    .from('conversation_participants')
    .select('user_id, profiles(id, username, display_name, avatar_url, sport)')
    .eq('conversation_id', conversationId)
    .neq('user_id', user.id)
    .single()

  // Get messages
  const { data: messages } = await supabase
    .from('messages')
    .select('*, profiles(username, display_name, avatar_url)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  // Mark as read
  await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)

  return (
    <AppShell profile={myProfile}>
      <ChatClient
        conversationId={conversationId}
        currentUserId={user.id}
        currentProfile={myProfile}
        otherProfile={(otherParticipation?.profiles as any) || null}
        initialMessages={messages || []}
      />
    </AppShell>
  )
}