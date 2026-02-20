import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AppShell from '@/components/AppShell'
import Link from 'next/link'

const FEELING_COLORS = ['', '#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#00c8ff']
const FEELING_LABELS = ['', 'Épuisé', 'Fatigué', 'Normal', 'Bien', 'Au top 🔥']

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

  const { data: myProfile } = user ? await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() : { data: null }

  const date = new Date(session.date)
  const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <AppShell profile={myProfile}>
      <div style={{ padding: 20 }}>
        <Link href={`/${username}/journal`} style={{
          color: 'var(--text2)', fontSize: 14,
          display: 'flex', alignItems: 'center', gap: 6,
          textDecoration: 'none', marginBottom: 16,
        }}>
          ← Retour au journal
        </Link>

        <div style={{ marginBottom: 20 }}>
          <h1 className="bebas" style={{ margin: '0 0 4px', fontSize: 28 }}>{session.title}</h1>
          <p style={{ margin: '0 0 12px', color: 'var(--text2)', fontSize: 14, textTransform: 'capitalize' }}>{dateStr}</p>
          {session.feeling && (
            <span style={{
              fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              background: FEELING_COLORS[session.feeling] + '22',
              color: FEELING_COLORS[session.feeling],
              border: `1px solid ${FEELING_COLORS[session.feeling]}44`,
              letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>
              {FEELING_LABELS[session.feeling]}
            </span>
          )}
          {session.tags && session.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
              {session.tags.map((t: string) => (
                <span key={t} style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 12,
                  background: 'var(--bg3)', color: 'var(--text2)',
                  border: '1px solid var(--border)', fontFamily: 'monospace',
                }}>#{t}</span>
              ))}
            </div>
          )}
        </div>

        {session.notes && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Notes</h3>
            <p style={{ margin: 0, lineHeight: 1.6, fontSize: 15 }}>{session.notes}</p>
          </div>
        )}

        {session.exercises && session.exercises.length > 0 && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Exercices</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {session.exercises.map((ex: any) => (
                <div key={ex.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr auto auto auto',
                  gap: 8, alignItems: 'center',
                  padding: '10px 14px', background: 'var(--bg3)', borderRadius: 10,
                }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{ex.name}</span>
                  {ex.sets && <span style={{ fontSize: 13, color: 'var(--text2)' }}>{ex.sets} séries</span>}
                  {ex.reps && <span style={{ fontSize: 13, color: 'var(--text2)' }}>× {ex.reps} reps</span>}
                  {ex.weight > 0 ? (
                    <span className="bebas" style={{ fontSize: 14, color: 'var(--accent)', letterSpacing: '0.05em' }}>{ex.weight}kg</span>
                  ) : (
                    <span style={{ fontSize: 13, color: 'var(--text2)' }}>PdC</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}