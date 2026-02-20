import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AppShell from '@/components/AppShell'
import SessionDetailClient from './SessionDetailClient'

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ username: string; sessionId: string }>
}) {
  const { username, sessionId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: session } = await supabase
    .from('sessions')
    .select('*, exercises(*)')
    .eq('id', sessionId)
    .single()

  if (!session) return notFound()

  const { data: likes } = await supabase
    .from('likes')
    .select('user_id')
    .eq('session_id', sessionId)

  const { data: comments } = await supabase
    .from('comments')
    .select('*, profiles(username, display_name, avatar_url)')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  const { data: myProfile } = user
    ? await supabase.from('profiles').select('*').eq('id', user.id).single()
    : { data: null }

  const likesCount = likes?.length || 0
  const userLiked = likes?.some(l => l.user_id === user?.id) || false
  const isOwn = user?.id === session.user_id

  return (
    <AppShell profile={myProfile}>
      <SessionDetailClient
        session={session}
        username={username}
        likesCount={likesCount}
        userLiked={userLiked}
        comments={comments || []}
        currentUserId={user?.id || null}
        currentUserProfile={myProfile}
        isOwn={isOwn}
      />
    </AppShell>
  )
}