'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import Link from 'next/link'

const FEELING_COLORS = ['', '#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#00c8ff']
const FEELING_LABELS = ['', 'Épuisé', 'Fatigué', 'Normal', 'Bien', 'Au top 🔥']

type Exercise = { name: string; sets: string; reps: string; weight: string }

export default function AddSessionClient({ username, userId }: { username: string; userId: string }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [feeling, setFeeling] = useState(3)
  const [tags, setTags] = useState('')
  const [notes, setNotes] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>([{ name: '', sets: '', reps: '', weight: '' }])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    background: 'var(--bg3)', border: '1px solid var(--border)',
    color: 'var(--text)', fontSize: 14, outline: 'none',
    boxSizing: 'border-box',
  }

  const addExercise = () => setExercises([...exercises, { name: '', sets: '', reps: '', weight: '' }])
  const removeExercise = (i: number) => setExercises(exercises.filter((_, idx) => idx !== i))
  const updateExercise = (i: number, field: keyof Exercise, val: string) => {
    const updated = [...exercises]
    updated[i][field] = val
    setExercises(updated)
  }

  const handleSave = async () => {
    if (!title || !date) return toast.error('Titre et date obligatoires')
    setLoading(true)

    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        user_id: userId,
        title,
        date,
        feeling,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        notes,
      })
      .select()
      .single()

    if (error || !session) {
      toast.error('Erreur lors de la sauvegarde')
      setLoading(false)
      return
    }

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

    toast.success('Séance enregistrée ! 💪')
    router.push(`/${username}/journal`)
    router.refresh()
  }

  return (
    <div style={{ padding: 20 }}>
      <Link href={`/${username}/journal`} style={{
        background: 'none', border: 'none', color: 'var(--text2)',
        cursor: 'pointer', fontSize: 14, marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 6,
        textDecoration: 'none',
      }}>
        ← Retour
      </Link>

      <h1 className="bebas" style={{ margin: '0 0 24px', fontSize: 28 }}>NOUVELLE SÉANCE</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Titre */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
          <label style={{ fontSize: 12, color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Titre *
          </label>
          <input style={inputStyle} placeholder="ex: Squat day 💪" value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        {/* Date */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
          <label style={{ fontSize: 12, color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Date *
          </label>
          <input style={inputStyle} type="date" value={date} onChange={e => setDate(e.target.value)} />
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
                cursor: 'pointer', fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 16, transition: 'all 0.15s',
              }}>
                {v}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--text2)' }}>
            <span>Épuisé</span><span>Au top</span>
          </div>
        </div>

        {/* Tags */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
          <label style={{ fontSize: 12, color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Tags (séparés par virgules)
          </label>
          <input style={inputStyle} placeholder="ex: jambes, force, squat" value={tags} onChange={e => setTags(e.target.value)} />
        </div>

        {/* Exercises */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
          <label style={{ fontSize: 12, color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>
            Exercices
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {exercises.map((ex, i) => (
              <div key={i} style={{ background: 'var(--bg3)', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <input
                    style={{ ...inputStyle, flex: 1 }}
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
                      <input
                        style={inputStyle} type="number" placeholder="0"
                        value={ex[field]}
                        onChange={e => updateExercise(i, field, e.target.value)}
                      />
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
          <label style={{ fontSize: 12, color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Notes libres
          </label>
          <textarea
            style={{ ...inputStyle, minHeight: 100, resize: 'vertical', lineHeight: 1.5 }}
            placeholder="Parle de ta séance, tes ressentis, tes progrès..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading || !title || !date}
          style={{
            width: '100%', padding: '14px 20px', borderRadius: 10,
            background: loading || !title || !date ? 'var(--bg3)' : 'var(--accent)',
            color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: '0.1em',
            opacity: !title || !date ? 0.5 : 1,
          }}
        >
          {loading ? 'ENREGISTREMENT...' : 'ENREGISTRER LA SÉANCE 💪'}
        </button>
      </div>
    </div>
  )
}