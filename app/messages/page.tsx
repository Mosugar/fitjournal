import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppShell from '@/components/AppShell'
import MessagesClient from './MessagesClient'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myProfile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  // Get all conversations the user is part of
  const { data: participations } = await supabase
    .from('conversation_participants')
    .select('conversation_id, last_read_at')
    .eq('user_id', user.id)

  const conversationIds = participations?.map(p => p.conversation_id) || []

  let conversations: any[] = []

  if (conversationIds.length > 0) {
    // Get the other participant for each conversation
    const { data: otherParticipants } = await supabase
      .from('conversation_participants')
      .select('conversation_id, user_id, profiles(id, username, display_name, avatar_url)')
      .in('conversation_id', conversationIds)
      .neq('user_id', user.id)

    // Get last message for each conversation
    const { data: lastMessages } = await supabase
      .from('messages')
      .select('conversation_id, content, created_at, sender_id')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: false })

    conversations = conversationIds.map(cid => {
      const other = otherParticipants?.find(p => p.conversation_id === cid)
      const lastMsg = lastMessages?.find(m => m.conversation_id === cid)
      const myParticipation = participations?.find(p => p.conversation_id === cid)
      const unread = lastMsg &&
        myParticipation?.last_read_at &&
        new Date(lastMsg.created_at) > new Date(myParticipation.last_read_at) &&
        lastMsg.sender_id !== user.id

      return {
        id: cid,
        other: other?.profiles,
        lastMessage: lastMsg,
        unread,
      }
    }).filter(c => c.other).sort((a, b) => {
      if (!a.lastMessage) return 1
      if (!b.lastMessage) return -1
      return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
    })
  }

  return (
    <AppShell profile={myProfile}>
      <MessagesClient
        conversations={conversations}
        currentUserId={user.id}
        currentProfile={myProfile}
      />
    </AppShell>
  )
}