import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'
import Link from 'next/link'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: myProfile } = user ? await supabase.from('profiles').select('*').eq('id', user.id).single() : { data: null }

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*, exercises(*), profiles(username, display_name, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(30)

  const { data: likes } = await supabase
    .from('likes')
    .select('session_id, user_id')

  const FEELING_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']
  const FEELING_LABELS = ['', 'Épuisé', 'Fatigué', 'Normal', 'Bien', 'Au top']

  return (
    <AppShell profile={myProfile}>
      <div style={{ padding: 20 }} className="fadeUp">
        <h1 className="condensed" style={{ fontSize: 32, fontWeight: 900, textTransform: 'uppercase', marginBottom: 4 }}>Feed</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24 }}>Les séances de la communauté</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!sessions || sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text2)' }}>
              <p style={{ fontSize: 14 }}>Aucune séance pour l'instant</p>
            </div>
          ) : sessions.map((s: any, i: number) => {
            const sessionLikes = likes?.filter(l => l.session_id === s.id) || []
            const userLiked = sessionLikes.some(l => l.user_id === user?.id)

            return (
              <div key={s.id} style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: 16, overflow: 'hidden',
                boxShadow: 'var(--shadow)',
                animationDelay: `${i * 0.04}s`,
              }} className="fadeUp">
                {/* User header */}
                <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Link href={`/${s.profiles.username}`}>
                    <img
                      src={s.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.profiles.username}`}
                      style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }}
                      alt="avatar"
                    />
                  </Link>
                  <div style={{ flex: 1 }}>
                    <Link href={`/${s.profiles.username}`} style={{ textDecoration: 'none' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{s.profiles.display_name}</span>
                      <span style={{ fontSize: 12, color: 'var(--text2)', marginLeft: 6 }}>@{s.profiles.username}</span>
                    </Link>
                    <p style={{ fontSize: 12, color: 'var(--text2)', margin: 0 }}>
                      {new Date(s.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                  {s.feeling && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
                      background: FEELING_COLORS[s.feeling] + '18',
                      color: FEELING_COLORS[s.feeling],
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: FEELING_COLORS[s.feeling], display: 'inline-block' }} />
                      {FEELING_LABELS[s.feeling]}
                    </span>
                  )}
                </div>

                {/* Session content */}
                <Link href={`/${s.profiles.username}/journal/${s.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ padding: '0 16px 12px' }}>
                    <h3 className="condensed" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{s.title}</h3>
                    {s.notes && (
                      <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 8 }}>
                        {s.notes.substring(0, 120)}{s.notes.length > 120 ? '...' : ''}
                      </p>
                    )}
                    {s.exercises && s.exercises.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {s.exercises.slice(0, 4).map((ex: any) => (
                          <span key={ex.id} style={{
                            fontSize: 11, padding: '3px 8px', borderRadius: 20,
                            background: 'var(--bg3)', color: 'var(--text2)', fontWeight: 500,
                          }}>
                            {ex.name}{ex.weight > 0 ? ` · ${ex.weight}kg` : ''}
                          </span>
                        ))}
                        {s.exercises.length > 4 && (
                          <span style={{ fontSize: 11, color: 'var(--text2)', padding: '3px 0' }}>+{s.exercises.length - 4} autres</span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>

                {/* Footer — likes count */}
                <div style={{
                  padding: '10px 16px',
                  borderTop: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: 16,
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: userLiked ? '#ef4444' : 'var(--text2)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={userLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    {sessionLikes.length > 0 ? sessionLikes.length : ''}
                  </span>
                  <Link href={`/${s.profiles.username}/journal/${s.id}`} style={{
                    marginLeft: 'auto', fontSize: 13, color: 'var(--accent)',
                    textDecoration: 'none', fontWeight: 500,
                  }}>
                    Voir la séance →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}