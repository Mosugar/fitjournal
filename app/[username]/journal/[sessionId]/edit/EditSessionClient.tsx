'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Session } from '@/lib/types'
import toast from 'react-hot-toast'
import Link from 'next/link'

const FEELING_COLORS = ['', '#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#00c8ff']
const FEELING_LABELS = ['', 'Épuisé', 'Fatigué', 'Normal', 'Bien', 'Au top 🔥']

type Exercise = { id?: string; name: string; sets: string; reps: string; weight: string }

export default function EditSessionClient({
  session,
  username,
}: {
  session: Session & { exercises: any[] }
  username: string
}) {
  const [title, setTitle] = useState(session.title)
  const [date, setDate] = useState(session.date)
  const [feeling, setFeeling] = useState(session.feeling || 3)
  const [tags, setTags] = useState(session.tags?.join(', ') || '')
  const [notes, setNotes] = useState(session.notes || '')
  const [exercises, setExercises] = useState<Exercise[]>(
    session.exercises?.length > 0
      ? session.exercises.map(e => ({
          id: e.id,
          name: e.name,
          sets: e.sets?.toString() || '',
          reps: e.reps?.toString() || '',
          weight: e.weight?.toString() || '',
        }))
      : [{ name: '', sets: '', reps: '', weight: '' }]
  )
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    background: 'var(--bg3)', border: '1px solid var(--border)',
    color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  }

  const addExercise = () => setExercises([...exercises, { name: '', sets: '', reps: '', weight: '' }])
  const removeExercise = (i: number) => setExercises(exercises.filter((_, idx) => idx !== i))
  const updateExercise = (i: number, field: keyof Exercise, val: string) => {
    const updated = [...exercises]
    updated[i] = { ...updated[i], [field]: val }
    setExercises(updated)
  }

  const handleSave = async () => {
    if (!title || !date) return toast.error('Titre et date obligatoires')
    setLoading(true)

    // Update session
    const { error } = await supabase
      .from('sessions')
      .update({
        title,
        date,
        feeling,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        notes,
      })
      .eq('id', session.id)

    if (error) { toast.error('Erreur lors de la sauvegarde'); setLoading(false); return }

    // Delete all existing exercises and re-insert
    await supabase.from('exercises').delete().eq('session_id', session.id)

    const validExercises = exercises.filter(e => e.name.trim())
    if (validExercises.length > 0) {
      await supabase.from('exercises').insert(
        validExercises.map(e => ({
          session_id: session.id,
          name: e.name,
          sets: parseInt(e.sets) || null,
          reps: parseInt(e.reps) || null,
          weight: parseFloat(e.weight) || null,
        }))
      )
    }

    toast.success('Séance mise à jour ! ✅')
    router.push(`/${username}/journal/${session.id}`)
    router.refresh()
  }

  return (
    <div style={{ padding: 20 }}>
      <Link href={`/${username}/journal/${session.id}`} style={{
        color: 'var(--text2)', fontSize: 14,
        display: 'flex', alignItems: 'center', gap: 6,
        textDecoration: 'none', marginBottom: 20,
      }}>
        ← Retour à la séance
      </Link>

      <h1 className="condensed" style={{ margin: '0 0 24px', fontSize: 28, fontWeight: 900 }}>MODIFIER LA SÉANCE</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Titre */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
          <label style={{ fontSize: 12, color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Titre *</label>
          <input style={inp} value={title} onChange={e => setTitle(e.target.value)} placeholder="ex: Squat day 💪" />
        </div>

        {/* Date */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
          <label style={{ fontSize: 12, color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Date *</label>
          <input style={inp} type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        {/* Feeling */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
          <label style={{ fontSize: 12, color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
            Ressenti — {FEELING_LABELS[feeling]}
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1, 2, 3, 4, 5].map(v => (
              <button key={v} onClick={() => setFeeling(v)} style={{
                flex: 1, padding: '10px 0', borderRadius: 10,
                border: `2px solid ${feeling === v ? FEELING_COLORS[v] : 'var(--border)'}`,
                background: feeling === v ? FEELING_COLORS[v] + '22' : 'var(--bg3)',
                color: feeling === v ? FEELING_COLORS[v] : 'var(--text2)',
                cursor: 'pointer', fontSize: 16, fontWeight: 700, transition: 'all 0.15s',
              }}>{v}</button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--text2)' }}>
            <span>Épuisé</span><span>Au top</span>
          </div>
        </div>

        {/* Tags */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
          <label style={{ fontSize: 12, color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Tags (séparés par virgules)</label>
          <input style={inp} placeholder="ex: jambes, force, squat" value={tags} onChange={e => setTags(e.target.value)} />
        </div>

        {/* Exercises */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
          <label style={{ fontSize: 12, color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>Exercices</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {exercises.map((ex, i) => (
              <div key={i} style={{ background: 'var(--bg3)', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <input
                    style={{ ...inp, flex: 1 }}
                    placeholder="Nom de l'exercice"
                    value={ex.name}
                    onChange={e => updateExercise(i, 'name', e.target.value)}
                  />
                  {exercises.length > 1 && (
                    <button onClick={() => removeExercise(i)} style={{
                      background: 'none', border: 'none', color: '#ff3b30',
                      cursor: 'pointer', fontSize: 20, padding: '0 4px',
                    }}>×</button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {([['sets', 'Séries'], ['reps', 'Reps'], ['weight', 'Poids (kg)']] as const).map(([field, label]) => (
                    <div key={field}>
                      <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>{label}</div>
                      <input style={inp} type="number" placeholder="0" value={ex[field]} onChange={e => updateExercise(i, field, e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button onClick={addExercise} style={{
            marginTop: 10, width: '100%', padding: '10px',
            background: 'transparent', border: '1px dashed var(--border)',
            borderRadius: 10, color: 'var(--text2)', cursor: 'pointer', fontSize: 14,
          }}>
            + Ajouter un exercice
          </button>
        </div>

        {/* Notes */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
          <label style={{ fontSize: 12, color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Notes libres</label>
          <textarea
            style={{ ...inp, minHeight: 100, resize: 'vertical', lineHeight: 1.5 }}
            placeholder="Parle de ta séance..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <button onClick={handleSave} disabled={loading} style={{
          width: '100%', padding: '14px 20px', borderRadius: 10,
          background: loading ? 'var(--bg3)' : 'var(--accent)',
          color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: 18, fontWeight: 700, letterSpacing: '0.05em',
        }}>
          {loading ? 'SAUVEGARDE...' : 'SAUVEGARDER ✅'}
        </button>
      </div>
    </div>
  )
}