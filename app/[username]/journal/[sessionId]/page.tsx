import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AppShell from '@/components/AppShell'
import SessionDetailClient from './SessionDetailClient'
import { getCachedProfile } from '@/lib/cache/queries'
import { unstable_cache } from 'next/cache'
import { createClient as createAnon } from '@supabase/supabase-js'

// Cache the session + exercises (changes rarely after creation)
const getCachedSession = (sessionId: string, userId: string) =>
  unstable_cache(
    async () => {
      const supabase = createAnon(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data } = await supabase
        .from('sessions')
        .select('*, exercises(*)')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single()
      return data
    },
    [`session-${sessionId}`],
    { revalidate: 60, tags: [`session-${sessionId}`] }
  )()

export default async function SessionPage({ params }: { params: Promise<{ username: string; sessionId: string }> }) {
  const { username, sessionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Profile is cached
  const [profile, myProfile, follows] = await Promise.all([
    getCachedProfile(username),
    user ? supabase.from('profiles').select('*').eq('id', user.id).single().then(r => r.data) : null,
    user ? supabase.from('follows').select('following_id').eq('follower_id', user.id).then(r => r.data ?? []) : [],
  ])

  if (!profile) return notFound()

  // Session is cached — safe, no auth-sensitive data
  const session = await getCachedSession(sessionId, profile.id)
  if (!session) return notFound()

  // Likes, comments, photos are NOT cached — they change frequently and need to be fresh
  const [likesData, comments, photos] = await Promise.all([
    supabase.from('likes').select('user_id').eq('session_id', sessionId).then(r => r.data ?? []),
    supabase.from('comments').select('*, profiles(username, display_name, avatar_url)').eq('session_id', sessionId).order('created_at', { ascending: true }).then(r => r.data ?? []),
    supabase.from('session_photos').select('*').eq('session_id', sessionId).order('created_at', { ascending: true }).then(r => r.data ?? []),
  ])

  const isOwn = user?.id === profile.id
  const likesCount = likesData.length
  const userLiked = likesData.some((l: any) => l.user_id === user?.id)
  const followingIds = follows?.map((f: any) => f.following_id) ?? []

  return (
    <AppShell profile={myProfile} followingIds={followingIds}>
      <SessionDetailClient
        session={session}
        username={username}
        likesCount={likesCount}
        userLiked={userLiked}
        comments={comments}
        currentUserId={user?.id || null}
        currentUserProfile={myProfile}
        isOwn={isOwn}
        sessionOwnerId={profile.id}
        photos={photos}
      />
    </AppShell>
  )
}