'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import Link from 'next/link'

const FEELING_LABELS = ['', 'Exhausted', 'Tired', 'Normal', 'Good', 'On fire']

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

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    background: '#0a0800', border: '1px solid #2a2518',
    color: '#f0ede0', fontSize: 14, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'Barlow, sans-serif',
  }

  const section: React.CSSProperties = {
    background: '#161410', border: '1px solid #2a2518',
    borderLeft: '3px solid #f5c800', padding: 20, marginBottom: 8,
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11, color: '#5a5648', letterSpacing: '0.12em',
    textTransform: 'uppercase', display: 'block', marginBottom: 10,
    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
  }

  const addExercise = () => setExercises([...exercises, { name: '', sets: '', reps: '', weight: '' }])
  const removeExercise = (i: number) => setExercises(exercises.filter((_, idx) => idx !== i))
  const updateExercise = (i: number, field: keyof Exercise, val: string) => {
    const updated = [...exercises]
    updated[i][field] = val
    setExercises(updated)
  }

  const handleSave = async () => {
    if (!title || !date) return toast.error('Title and date are required')
    setLoading(true)

    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        user_id: userId, title, date, feeling,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        notes,
      })
      .select().single()

    if (error || !session) { toast.error('Error saving session'); setLoading(false); return }

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

    toast.success('Session saved! 💪')
    router.push(`/${username}/journal`)
    router.refresh()
  }

  return (
    <div style={{ padding: 20, background: '#0a0800', minHeight: '100vh' }}>

      <Link href={`/${username}/journal`} style={{
        color: '#5a5648', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
        textDecoration: 'none', marginBottom: 24,
        fontFamily: "'Barlow Condensed', sans-serif",
        letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>
        ← Back
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ width: 4, height: 28, background: '#f5c800' }} />
        <h1 style={{
          fontSize: 28, fontWeight: 900, color: '#f5c800',
          textTransform: 'uppercase', letterSpacing: '0.06em',
          fontFamily: "'Barlow Condensed', sans-serif",
        }}>NEW SESSION</h1>
      </div>

      {/* Title */}
      <div style={section}>
        <label style={labelStyle}>Title *</label>
        <input style={inp} placeholder="e.g. Squat day 💪" value={title} onChange={e => setTitle(e.target.value)} />
      </div>

      {/* Date */}
      <div style={section}>
        <label style={labelStyle}>Date *</label>
        <input style={inp} type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>

      {/* Feeling */}
      <div style={section}>
        <label style={labelStyle}>Feeling — {FEELING_LABELS[feeling]}</label>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1, 2, 3, 4, 5].map(v => (
            <button key={v} onClick={() => setFeeling(v)} style={{
              flex: 1, padding: '10px 0',
              border: `1px solid ${feeling === v ? '#f5c800' : '#2a2518'}`,
              background: feeling === v ? '#f5c800' : 'transparent',
              color: feeling === v ? '#0a0800' : '#5a5648',
              cursor: 'pointer', fontSize: 15, fontWeight: 900,
              fontFamily: "'Barlow Condensed', sans-serif",
              transition: 'all 0.15s',
            }}>{v}</button>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: '#5a5648', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.08em' }}>
          <span>EXHAUSTED</span><span>ON FIRE</span>
        </div>
      </div>

      {/* Tags */}
      <div style={section}>
        <label style={labelStyle}>Tags (comma separated)</label>
        <input style={inp} placeholder="e.g. legs, strength, squat" value={tags} onChange={e => setTags(e.target.value)} />
      </div>

      {/* Exercises */}
      <div style={section}>
        <label style={labelStyle}>Exercises</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {exercises.map((ex, i) => (
            <div key={i} style={{ background: '#0a0800', border: '1px solid #2a2518', padding: 12 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <input
                  style={{ ...inp, flex: 1 }}
                  placeholder="Exercise name"
                  value={ex.name}
                  onChange={e => updateExercise(i, 'name', e.target.value)}
                />
                {exercises.length > 1 && (
                  <button onClick={() => removeExercise(i)} style={{
                    background: 'none', border: '1px solid #2a2518',
                    color: '#5a5648', cursor: 'pointer', fontSize: 16,
                    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>×</button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {([['sets', 'SETS'], ['reps', 'REPS'], ['weight', 'KG']] as const).map(([field, label]) => (
                  <div key={field}>
                    <div style={{ fontSize: 9, color: '#5a5648', marginBottom: 4, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}>{label}</div>
                    <input style={inp} type="number" placeholder="0" value={ex[field]} onChange={e => updateExercise(i, field, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={addExercise} style={{
          marginTop: 8, width: '100%', padding: '10px',
          background: 'transparent', border: '1px dashed #2a2518',
          color: '#5a5648', cursor: 'pointer', fontSize: 12,
          fontFamily: "'Barlow Condensed', sans-serif",
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          + ADD EXERCISE
        </button>
      </div>

      {/* Notes */}
      <div style={section}>
        <label style={labelStyle}>Notes</label>
        <textarea
          style={{ ...inp, minHeight: 100, resize: 'vertical', lineHeight: 1.5 }}
          placeholder="Talk about your session, feelings, progress..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>

      <button onClick={handleSave} disabled={loading || !title || !date} style={{
        width: '100%', padding: '14px 20px',
        background: loading || !title || !date ? '#161410' : '#f5c800',
        color: loading || !title || !date ? '#5a5648' : '#0a0800',
        border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 18, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase',
        opacity: !title || !date ? 0.5 : 1,
        marginBottom: 40,
      }}>
        {loading ? 'SAVING...' : 'SAVE SESSION 💪'}
      </button>
    </div>
  )
}