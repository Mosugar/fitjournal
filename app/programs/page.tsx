import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'

const PROGRAMS = [
  { id: 'p1', title: 'Force — 12 Semaines', description: 'Powerlifting · Squat, Bench, Deadlift', level: 'Intermédiaire', duration: '12 sem', file: '/programs/programme-force.pdf', color: '#ff4500' },
  { id: 'p2', title: 'Hypertrophie', description: 'Prise de masse · 4 jours/semaine', level: 'Tous niveaux', duration: '8 sem', file: '/programs/programme-hypertrophie.pdf', color: '#0066ff' },
  { id: 'p3', title: 'Running Débutant', description: 'De 0 à 5km · Cardio progressif', level: 'Débutant', duration: '8 sem', file: '/programs/programme-running.pdf', color: '#00c853' },
]

const IconDownload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)

export default async function ProgramsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: myProfile } = user ? await supabase.from('profiles').select('*').eq('id', user.id).single() : { data: null }

  return (
    <AppShell profile={myProfile}>
      <div style={{ padding: 20 }} className="fadeUp">
        <h1 className="condensed" style={{ fontSize: 32, fontWeight: 900, textTransform: 'uppercase', marginBottom: 4 }}>
          Programmes
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24 }}>
          Télécharge nos plans d'entraînement gratuits
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PROGRAMS.map((p, i) => (
            <div key={p.id} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 16, padding: 18,
              boxShadow: 'var(--shadow)',
              animationDelay: `${i * 0.08}s`,
            }} className="fadeUp">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Color bar */}
                <div style={{
                  width: 4, height: 52, borderRadius: 4,
                  background: p.color, flexShrink: 0,
                }} />

                <div style={{ flex: 1 }}>
                  <div className="condensed" style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>{p.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>{p.description}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 20,
                      background: 'var(--bg3)', color: 'var(--text2)', fontWeight: 500,
                    }}>{p.level}</span>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 20,
                      background: 'var(--bg3)', color: 'var(--text2)', fontWeight: 500,
                    }}>{p.duration}</span>
                  </div>
                </div>

                <a href={p.file} download style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 14px', borderRadius: 10,
                  background: p.color + '15',
                  border: `1px solid ${p.color}30`,
                  color: p.color,
                  textDecoration: 'none',
                  fontSize: 13, fontWeight: 600,
                  flexShrink: 0,
                }}>
                  <IconDownload /> PDF
                </a>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 24, padding: 16,
          background: 'var(--bg3)', borderRadius: 12,
          border: '1px dashed var(--border)',
          textAlign: 'center',
        }}>
          <p style={{ color: 'var(--text2)', fontSize: 13, margin: 0 }}>
            Pour ajouter tes PDFs → place-les dans <code style={{ fontFamily: 'monospace', fontSize: 12 }}>public/programs/</code>
          </p>
        </div>
      </div>
    </AppShell>
  )
}