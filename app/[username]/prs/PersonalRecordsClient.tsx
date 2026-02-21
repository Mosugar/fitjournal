'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'

type PR = {
  id: string
  lift: string
  weight: number
  unit: string
  video_url: string | null
  validated: boolean
}

const COMMON_LIFTS = [
  'Squat', 'Bench Press', 'Deadlift', 'Overhead Press',
  'Clean & Jerk', 'Snatch', 'Front Squat', 'Romanian Deadlift',
  'Pull-up', 'Dip',
]

export default function PersonalRecordsClient({
  profile,
  initialPRs,
}: {
  profile: { id: string; username: string }
  initialPRs: PR[]
}) {
  const [prs, setPRs] = useState<PR[]>(initialPRs)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ lift: '', weight: '', unit: 'kg', video_url: '' })
  const [customLift, setCustomLift] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 14px',
    background: '#0a0800', border: '1px solid #2a2518',
    color: '#f0ede0', fontSize: 13, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'Barlow, sans-serif',
  }

  const label: React.CSSProperties = {
    fontSize: 10, color: '#5a5648', letterSpacing: '0.12em',
    textTransform: 'uppercase', display: 'block', marginBottom: 6,
    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
  }

  const resetForm = () => {
    setForm({ lift: '', weight: '', unit: 'kg', video_url: '' })
    setAdding(false)
    setEditingId(null)
    setCustomLift(false)
  }

  const handleSave = async () => {
    if (!form.lift || !form.weight) return toast.error('Lift and weight are required')
    const weight = parseFloat(form.weight)
    if (isNaN(weight) || weight <= 0) return toast.error('Invalid weight')
    setLoading(true)

    if (editingId) {
      const { error } = await supabase.from('personal_records').update({
        lift: form.lift, weight, unit: form.unit,
        video_url: form.video_url || null, validated: false,
      }).eq('id', editingId)
      if (error) { toast.error('Error saving'); setLoading(false); return }
      setPRs(prev => prev.map(p => p.id === editingId ? { ...p, lift: form.lift, weight, unit: form.unit, video_url: form.video_url || null, validated: false } : p))
      toast.success('PR updated ✅')
    } else {
      // Check if lift already exists
      const existingLift = prs.find(p => p.lift.toLowerCase() === form.lift.toLowerCase())
      if (existingLift) {
        if (weight <= existingLift.weight) {
          toast.error(`Your current ${form.lift} PR is ${existingLift.weight}${existingLift.unit}. Enter a higher weight!`)
          setLoading(false)
          return
        }
        // Update existing
        const { error } = await supabase.from('personal_records').update({
          weight, unit: form.unit, video_url: form.video_url || null, validated: false,
        }).eq('id', existingLift.id)
        if (error) { toast.error('Error saving'); setLoading(false); return }
        setPRs(prev => prev.map(p => p.id === existingLift.id ? { ...p, weight, unit: form.unit, video_url: form.video_url || null, validated: false } : p))
        toast.success('PR updated! 💪')
      } else {
        const { data, error } = await supabase.from('personal_records').insert({
          user_id: profile.id, lift: form.lift, weight, unit: form.unit,
          video_url: form.video_url || null,
        }).select().single()
        if (error) { toast.error('Error saving'); setLoading(false); return }
        setPRs(prev => [...prev, data])
        toast.success('PR added! 🔥')
      }
    }

    setLoading(false)
    resetForm()
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this PR?')) return
    await supabase.from('personal_records').delete().eq('id', id)
    setPRs(prev => prev.filter(p => p.id !== id))
    toast.success('Deleted')
  }

  const startEdit = (p: PR) => {
    setForm({ lift: p.lift, weight: p.weight.toString(), unit: p.unit, video_url: p.video_url || '' })
    setEditingId(p.id)
    setAdding(true)
    if (!COMMON_LIFTS.includes(p.lift)) setCustomLift(true)
  }

  // Big 3 total
  const squat = prs.find(p => p.lift === 'Squat')?.weight || 0
  const bench = prs.find(p => p.lift === 'Bench Press')?.weight || 0
  const deadlift = prs.find(p => p.lift === 'Deadlift')?.weight || 0
  const total = squat + bench + deadlift

  return (
    <div style={{ padding: 20, background: '#0a0800', minHeight: '100vh' }}>

      <Link href={`/${profile.username}`} style={{
        color: '#5a5648', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
        textDecoration: 'none', marginBottom: 24,
        fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>← Back to profile</Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 4, height: 28, background: '#f5c800' }} />
          <h1 style={{
            fontSize: 28, fontWeight: 900, color: '#f5c800',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            fontFamily: "'Barlow Condensed', sans-serif",
          }}>PERSONAL RECORDS</h1>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)} style={{
            padding: '8px 16px', background: '#f5c800', border: 'none',
            color: '#0a0800', cursor: 'pointer', fontSize: 12, fontWeight: 900,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            fontFamily: "'Barlow Condensed', sans-serif",
          }}>+ ADD PR</button>
        )}
      </div>

      {/* Big 3 total */}
      {total > 0 && (
        <div style={{
          background: '#161410', border: '1px solid #2a2518',
          borderTop: '3px solid #f5c800', padding: '16px 20px', marginBottom: 12,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{
            fontSize: 12, color: '#5a5648', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            fontFamily: "'Barlow Condensed', sans-serif",
          }}>BIG 3 TOTAL</span>
          <span style={{
            fontSize: 32, fontWeight: 900, color: '#f5c800',
            fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.04em',
          }}>{total}kg</span>
        </div>
      )}

      {/* Form */}
      {adding && (
        <div style={{
          background: '#161410', border: '1px solid #2a2518',
          borderTop: '3px solid #f5c800', padding: 20, marginBottom: 12,
        }}>
          <p style={{
            fontSize: 13, fontWeight: 700, color: '#f5c800', marginBottom: 16,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            fontFamily: "'Barlow Condensed', sans-serif",
          }}>
            {editingId ? 'EDIT PR' : 'NEW PR'}
          </p>

          {/* Lift selector */}
          <div style={{ marginBottom: 10 }}>
            <span style={label}>Exercise *</span>
            {!customLift ? (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
                  {COMMON_LIFTS.map(l => (
                    <button key={l} onClick={() => setForm(f => ({ ...f, lift: l }))} style={{
                      padding: '5px 12px',
                      background: form.lift === l ? '#f5c800' : 'transparent',
                      border: `1px solid ${form.lift === l ? '#f5c800' : '#2a2518'}`,
                      color: form.lift === l ? '#0a0800' : '#5a5648',
                      cursor: 'pointer', fontSize: 11, fontWeight: 700,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      fontFamily: "'Barlow Condensed', sans-serif",
                      transition: 'all 0.1s',
                    }}>{l}</button>
                  ))}
                </div>
                <button onClick={() => setCustomLift(true)} style={{
                  background: 'none', border: 'none', color: '#5a5648', cursor: 'pointer',
                  fontSize: 11, padding: 0, textDecoration: 'underline',
                  fontFamily: 'Barlow, sans-serif',
                }}>
                  + Custom exercise
                </button>
              </>
            ) : (
              <>
                <input style={inp} placeholder="Exercise name" value={form.lift}
                  onChange={e => setForm(f => ({ ...f, lift: e.target.value }))} />
                <button onClick={() => { setCustomLift(false); setForm(f => ({ ...f, lift: '' })) }} style={{
                  background: 'none', border: 'none', color: '#5a5648', cursor: 'pointer',
                  fontSize: 11, marginTop: 6, padding: 0, textDecoration: 'underline',
                  fontFamily: 'Barlow, sans-serif',
                }}>
                  ← Choose from list
                </button>
              </>
            )}
          </div>

          {/* Weight + unit */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginBottom: 10 }}>
            <div>
              <span style={label}>Weight *</span>
              <input style={inp} type="number" min="0" step="0.5" placeholder="e.g. 200"
                value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
            </div>
            <div>
              <span style={label}>Unit</span>
              <div style={{ display: 'flex', height: 41 }}>
                {['kg', 'lbs'].map(u => (
                  <button key={u} onClick={() => setForm(f => ({ ...f, unit: u }))} style={{
                    padding: '0 14px',
                    background: form.unit === u ? '#f5c800' : 'transparent',
                    border: `1px solid ${form.unit === u ? '#f5c800' : '#2a2518'}`,
                    color: form.unit === u ? '#0a0800' : '#5a5648',
                    cursor: 'pointer', fontSize: 12, fontWeight: 700,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    letterSpacing: '0.06em',
                  }}>{u}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Video URL */}
          <div style={{ marginBottom: 16 }}>
            <span style={label}>Video URL (optional)</span>
            <input style={inp} placeholder="https://youtube.com/..."
              value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} />
            <p style={{ fontSize: 10, color: '#5a5648', marginTop: 5, fontFamily: 'Barlow, sans-serif' }}>
              Link a video of your lift for credibility. PRs with video will show a 🎥 badge.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} disabled={loading} style={{
              flex: 1, padding: '11px',
              background: loading ? '#111007' : '#f5c800',
              color: loading ? '#5a5648' : '#0a0800',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
              fontFamily: "'Barlow Condensed', sans-serif",
            }}>
              {loading ? 'SAVING...' : editingId ? 'UPDATE' : 'ADD PR'}
            </button>
            <button onClick={resetForm} style={{
              padding: '11px 20px', background: 'transparent',
              border: '1px solid #2a2518', color: '#5a5648',
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              fontFamily: "'Barlow Condensed', sans-serif",
            }}>CANCEL</button>
          </div>
        </div>
      )}

      {/* PR list */}
      {prs.length === 0 ? (
        <div style={{
          background: '#161410', border: '1px solid #2a2518',
          padding: '48px 20px', textAlign: 'center',
        }}>
          <p style={{ color: '#5a5648', fontSize: 14 }}>No PRs yet. Add your first personal record!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {prs.sort((a, b) => b.weight - a.weight).map(p => (
            <div key={p.id} style={{
              background: '#161410', border: '1px solid #2a2518',
              borderLeft: `3px solid ${p.validated ? '#f5c800' : '#2a2518'}`,
              padding: '12px 16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 16, fontWeight: 800, color: '#f0ede0',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}>{p.lift}</span>
                  {p.video_url && <span style={{ fontSize: 12 }}>🎥</span>}
                  {p.validated && (
                    <span style={{
                      fontSize: 9, padding: '1px 7px',
                      background: '#f5c80015', color: '#f5c800',
                      border: '1px solid #f5c80033',
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700, letterSpacing: '0.1em',
                    }}>VALIDATED ✓</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#5a5648', marginTop: 2 }}>
                  {!p.validated && 'Pending validation'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontSize: 28, fontWeight: 900, color: '#f5c800',
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}>{p.weight}<span style={{ fontSize: 13, color: '#5a5648' }}>{p.unit}</span></span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => startEdit(p)} style={{
                    padding: '5px 10px', background: 'transparent',
                    border: '1px solid #f5c800', color: '#f5c800', cursor: 'pointer',
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}>EDIT</button>
                  <button onClick={() => handleDelete(p.id)} style={{
                    padding: '5px 10px', background: 'transparent',
                    border: '1px solid #2a2518', color: '#5a5648', cursor: 'pointer',
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}>DEL</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}