import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AppShell from '@/components/AppShell'
import SessionDetailClient from './SessionDetailClient'

export default async function SessionPage({ params }: { params: Promise<{ username: string; sessionId: string }> }) {
  const { username, sessionId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('username', username).single()
  if (!profile) return notFound()

  const { data: session } = await supabase
    .from('sessions').select('*, exercises(*)').eq('id', sessionId).eq('user_id', profile.id).single()
  if (!session) return notFound()

  const [
    { data: myProfile },
    { data: likesData },
    { data: comments },
    { data: photos },
  ] = await Promise.all([
    user ? supabase.from('profiles').select('*').eq('id', user.id).single() : Promise.resolve({ data: null }),
    supabase.from('likes').select('user_id').eq('session_id', session.id),
    supabase.from('comments').select('*, profiles(username, display_name, avatar_url)').eq('session_id', session.id).order('created_at', { ascending: true }),
    supabase.from('session_photos').select('*').eq('session_id', session.id).order('created_at', { ascending: true }),
  ])

  const isOwn = user?.id === profile.id
  const likesCount = likesData?.length || 0
  const userLiked = likesData?.some(l => l.user_id === user?.id) || false

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
        sessionOwnerId={profile.id}
        photos={photos || []}
      />
    </AppShell>
  )
}