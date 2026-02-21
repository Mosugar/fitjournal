import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AppShell from '@/components/AppShell'
import SessionDetailClient from './SessionDetailClient'

export default async function SessionPage({
  params,
}: {
  params: { username: string; sessionId: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('username', params.username).single()
  if (!profile) return notFound()

  const { data: session } = await supabase
    .from('sessions')
    .select('*, exercises(*)')
    .eq('id', params.sessionId)
    .eq('user_id', profile.id)
    .single()
  if (!session) return notFound()

  const { data: myProfile } = user
    ? await supabase.from('profiles').select('*').eq('id', user.id).single()
    : { data: null }

  const { data: likesData } = await supabase
    .from('likes').select('user_id').eq('session_id', session.id)

  const { data: comments } = await supabase
    .from('comments')
    .select('*, profiles(username, display_name, avatar_url)')
    .eq('session_id', session.id)
    .order('created_at', { ascending: true })

  // Fetch photos
  const { data: photos } = await supabase
    .from('session_photos')
    .select('*')
    .eq('session_id', session.id)
    .order('created_at', { ascending: true })

  const isOwn = user?.id === profile.id
  const likesCount = likesData?.length || 0
  const userLiked = likesData?.some(l => l.user_id === user?.id) || false

  return (
    <AppShell profile={myProfile}>
      <SessionDetailClient
        session={session}
        username={params.username}
        likesCount={likesCount}
        userLiked={userLiked}
        comments={comments || []}
        currentUserId={user?.id || null}
        currentUserProfile={myProfile}
        isOwn={isOwn}
        sessionOwnerId={profile.id}
        photos={photos || []}
      />
    </AppShell>
  )
}