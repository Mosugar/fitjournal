'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'

type Palmares = {
  id: string
  year: string
  competition: string
  category: string
  result: string
  federation: string
}

const MEDALS = ['🥇', '🥈', '🥉', '4', '5', 'Top 8', 'Qualified', 'Participated']

export default function PalmaresClient({
  profile,
  initialPalmares,
}: {
  profile: { id: string; username: string }
  initialPalmares: Palmares[]
}) {
  const [palmares, setPalmares] = useState<Palmares[]>(initialPalmares)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ year: new Date().getFullYear().toString(), competition: '', category: '', result: '🥇', federation: '' })
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
    setForm({ year: new Date().getFullYear().toString(), competition: '', category: '', result: '🥇', federation: '' })
    setAdding(false)
    setEditingId(null)
  }

  const handleSave = async () => {
    if (!form.competition || !form.year) return toast.error('Competition and year are required')
    setLoading(true)

    if (editingId) {
      const { error } = await supabase.from('palmares').update(form).eq('id', editingId)
      if (error) { toast.error('Error saving'); setLoading(false); return }
      setPalmares(prev => prev.map(p => p.id === editingId ? { ...p, ...form } : p))
      toast.success('Updated ✅')
    } else {
      const { data, error } = await supabase.from('palmares').insert({ ...form, user_id: profile.id }).select().single()
      if (error) { toast.error('Error saving'); setLoading(false); return }
      setPalmares(prev => [data, ...prev])
      toast.success('Added! 🏆')
    }

    setLoading(false)
    resetForm()
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this result?')) return
    await supabase.from('palmares').delete().eq('id', id)
    setPalmares(prev => prev.filter(p => p.id !== id))
    toast.success('Deleted')
  }

  const startEdit = (p: Palmares) => {
    setForm({ year: p.year, competition: p.competition, category: p.category, result: p.result, federation: p.federation })
    setEditingId(p.id)
    setAdding(true)
  }

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
          }}>PALMARÈS</h1>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)} style={{
            padding: '8px 16px', background: '#f5c800', border: 'none',
            color: '#0a0800', cursor: 'pointer', fontSize: 12, fontWeight: 900,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            fontFamily: "'Barlow Condensed', sans-serif",
          }}>+ ADD RESULT</button>
        )}
      </div>

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
            {editingId ? 'EDIT RESULT' : 'NEW RESULT'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <span style={label}>Year *</span>
              <input style={inp} type="number" min="1950" max="2100"
                value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} />
            </div>
            <div>
              <span style={label}>Result *</span>
              <select style={{ ...inp, cursor: 'pointer' }}
                value={form.result} onChange={e => setForm(f => ({ ...f, result: e.target.value }))}>
                {MEDALS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <span style={label}>Competition *</span>
            <input style={inp} placeholder="e.g. French Powerlifting Championships"
              value={form.competition} onChange={e => setForm(f => ({ ...f, competition: e.target.value }))} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div>
              <span style={label}>Category</span>
              <input style={inp} placeholder="e.g. -83kg / Open"
                value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
            </div>
            <div>
              <span style={label}>Federation</span>
              <input style={inp} placeholder="e.g. FFForce / IPF"
                value={form.federation} onChange={e => setForm(f => ({ ...f, federation: e.target.value }))} />
            </div>
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
              {loading ? 'SAVING...' : editingId ? 'UPDATE' : 'ADD'}
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

      {/* List */}
      {palmares.length === 0 ? (
        <div style={{
          background: '#161410', border: '1px solid #2a2518',
          borderLeft: '3px solid #2a2518', padding: '48px 20px', textAlign: 'center',
        }}>
          <p style={{ color: '#5a5648', fontSize: 14 }}>No results yet. Add your first competition result!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {palmares.sort((a, b) => parseInt(b.year) - parseInt(a.year)).map(p => (
            <div key={p.id} style={{
              background: '#161410', border: '1px solid #2a2518',
              borderLeft: '3px solid #2a2518', padding: '14px 16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                <span style={{
                  fontSize: 22, width: 36, textAlign: 'center', flexShrink: 0,
                }}>{p.result}</span>
                <div>
                  <div style={{
                    fontSize: 15, fontWeight: 800, color: '#f0ede0',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}>{p.competition}</div>
                  <div style={{ fontSize: 11, color: '#5a5648', marginTop: 2 }}>
                    {p.year}{p.category ? ` · ${p.category}` : ''}{p.federation ? ` · ${p.federation}` : ''}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
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
          ))}
        </div>
      )}
    </div>
  )
}