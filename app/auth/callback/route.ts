import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', data.user.id)
        .single()

      if (profile) {
        // Existing user → go to their profile
        return NextResponse.redirect(`${origin}/${profile.username}`)
      } else {
        // New Google user → create profile and redirect to onboarding
        const emailUsername = data.user.email?.split('@')[0]?.replace(/[^a-z0-9_]/gi, '').toLowerCase() || 'user'
        const username = `${emailUsername}${Math.floor(Math.random() * 999)}`
        const displayName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || emailUsername
        const avatarUrl = data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null

        await supabase.from('profiles').insert({
          id: data.user.id,
          username,
          display_name: displayName,
          bio: '',
          avatar_url: avatarUrl,
        })

        // Redirect to edit profile so they can pick a proper username
        return NextResponse.redirect(`${origin}/${username}/edit`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}