'use client'

import React from 'react'

const G = {
  black: '#0a0800',
  dark: '#111007',
  card: '#161410',
  border: '#2a2518',
  gold: '#f5c800',
  shimmer1: '#161410',
  shimmer2: '#1e1a0e',
}

const STYLE = `
@keyframes sk { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.sk { background: linear-gradient(90deg, ${G.shimmer1} 25%, ${G.shimmer2} 50%, ${G.shimmer1} 75%); background-size:200% 100%; animation: sk 1.4s ease-in-out infinite; }
`

const B = ({ w, h, mb = 0, style = {} }: { w: string | number; h: number; mb?: number; style?: React.CSSProperties }) => (
  <div className="sk" style={{ width: w, height: h, marginBottom: mb, ...style }} />
)

// ─── TornBottom SVG (matches real component) ─────────────────
const TornBottom = () => (
  <svg viewBox="0 0 480 28" preserveAspectRatio="none"
    style={{ display: 'block', width: '100%', height: 28, position: 'absolute', bottom: -1, left: 0, zIndex: 2 }}>
    <path d="M0,0 L0,10 Q12,22 24,13 Q36,4 48,18 Q60,28 72,16 Q84,6 96,20 Q108,28 120,14 Q132,4 144,18 Q156,28 168,12 Q180,2 192,18 Q204,28 216,14 Q228,4 240,20 Q252,28 264,12 Q276,2 288,16 Q300,26 312,10 Q324,2 336,18 Q348,26 360,10 Q372,2 384,16 Q396,28 408,12 Q420,4 432,20 Q444,28 456,14 Q468,6 480,14 L480,0 Z"
      fill={G.dark} />
  </svg>
)

const TornTop = () => (
  <svg viewBox="0 0 480 28" preserveAspectRatio="none"
    style={{ display: 'block', width: '100%', height: 28, position: 'absolute', top: -1, left: 0, zIndex: 2 }}>
    <path d="M0,28 L0,18 Q12,6 24,15 Q36,24 48,10 Q60,0 72,12 Q84,22 96,8 Q108,0 120,14 Q132,26 144,12 Q156,2 168,16 Q180,28 192,10 Q204,0 216,14 Q228,26 240,8 Q252,0 264,16 Q276,28 288,12 Q300,2 312,18 Q324,28 336,14 Q348,4 360,18 Q372,28 384,12 Q396,2 408,16 Q420,28 432,10 Q444,0 456,14 Q468,24 480,18 L480,28 Z"
      fill={G.dark} />
  </svg>
)

// ─── Profile Skeleton — matches ProfileClient exactly ────────
export function ProfileSkeleton() {
  return (
    <div style={{ background: G.black, minHeight: '100vh', fontFamily: "'Barlow Condensed', sans-serif" }}>
      <style>{STYLE}</style>

      {/* Banner */}
      <div style={{ position: 'relative', height: 240, overflow: 'hidden' }}>
        <div className="sk" style={{ width: '100%', height: '100%' }} />
        {/* Gold slash line */}
        <div style={{ position: 'absolute', top: 24, left: -10, right: -10, height: 4, background: `${G.gold}33`, transform: 'rotate(-1.5deg)' }} />
        <TornBottom />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, background: `linear-gradient(transparent, ${G.black})` }} />
      </div>

      <div style={{ padding: '0 16px', marginTop: -60, position: 'relative', zIndex: 3 }}>

        {/* Avatar + buttons row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
          {/* Avatar with gold border */}
          <div style={{ width: 88, height: 88, padding: 3, background: `${G.gold}33` }}>
            <div className="sk" style={{ width: '100%', height: '100%' }} />
          </div>
          {/* Button placeholder */}
          <B w={130} h={36} />
        </div>

        {/* Name block */}
        <div style={{ marginBottom: 20 }}>
          <B w="60%" h={34} mb={6} />
          {/* Gold line + username */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 40, height: 3, background: `${G.gold}44` }} />
            <B w={90} h={10} />
          </div>
          {/* Followers/following */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
            <B w={80} h={12} />
            <B w={80} h={12} />
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ background: G.card, border: `1px solid ${G.border}`, borderLeft: `3px solid ${G.gold}44`, padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ textAlign: 'center', borderRight: i < 2 ? `1px solid ${G.border}` : 'none', padding: '8px 0' }}>
                  <B w={36} h={32} mb={6} style={{ margin: '0 auto 6px' }} />
                  <B w={50} h={8} style={{ margin: '0 auto' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PR section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 4, height: 20, background: `${G.gold}44` }} />
          <B w={150} h={18} />
          <div style={{ flex: 1, height: 1, background: G.border }} />
        </div>

        {/* PR grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 28 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ background: G.card, border: `1px solid ${G.border}`, borderTop: `3px solid ${G.border}`, padding: '14px 10px', textAlign: 'center' }}>
              <B w={40} h={9} mb={8} style={{ margin: '0 auto 8px' }} />
              <B w={52} h={24} style={{ margin: '0 auto' }} />
            </div>
          ))}
        </div>

        {/* Recent sessions section */}
        <div style={{ position: 'relative', background: G.card, borderTop: `1px solid ${G.border}`, paddingTop: 16 }}>
          <TornTop />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 4, height: 20, background: `${G.gold}44` }} />
              <B w={160} h={18} />
            </div>
            <B w={40} h={12} />
          </div>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              border: `1px solid ${i === 0 ? G.gold + '33' : G.border}`,
              borderLeft: `3px solid ${i === 0 ? G.gold + '44' : G.border}`,
              padding: '12px 14px', marginBottom: 4,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <B w={i === 0 ? 160 : 120} h={14} mb={6} />
                <B w={100} h={9} />
              </div>
              <B w={16} h={16} />
            </div>
          ))}
          <TornBottom />
        </div>

        <div style={{ height: 80 }} />
      </div>
    </div>
  )
}

// ─── Feed Card Skeleton ──────────────────────────────────────
export function FeedCardSkeleton() {
  return (
    <div style={{ background: G.card, border: `1px solid ${G.border}`, borderLeft: `3px solid ${G.border}`, marginBottom: 6 }}>
      <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${G.border}` }}>
        <div className="sk" style={{ width: 36, height: 36, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <B w="38%" h={11} mb={5} />
          <B w="22%" h={9} />
        </div>
        <B w={72} h={26} />
      </div>
      <div style={{ padding: '12px 14px' }}>
        <B w="65%" h={15} mb={10} />
        <B w="88%" h={10} mb={4} />
        <B w="55%" h={10} mb={12} />
        <div style={{ display: 'flex', gap: 5 }}>
          {[72, 96, 64].map((w, i) => <B key={i} w={w} h={20} />)}
        </div>
      </div>
      <div style={{ padding: '8px 14px', borderTop: `1px solid ${G.border}`, display: 'flex', gap: 6 }}>
        <B w={68} h={28} />
        <B w={88} h={28} />
      </div>
    </div>
  )
}

export function FeedSkeleton() {
  return (
    <div style={{ padding: 20, background: G.black, minHeight: '100vh' }}>
      <style>{STYLE}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, borderBottom: `1px solid ${G.border}`, paddingBottom: 16 }}>
        <div style={{ width: 4, height: 28, background: `${G.gold}44` }} />
        <B w={80} h={28} />
      </div>
      {[0, 1, 2].map(i => <FeedCardSkeleton key={i} />)}
    </div>
  )
}

// ─── Session Detail Skeleton ─────────────────────────────────
export function SessionSkeleton() {
  return (
    <div style={{ padding: 20, background: G.black, minHeight: '100vh' }}>
      <style>{STYLE}</style>
      <B w={60} h={10} mb={22} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 4, height: 28, background: `${G.gold}44`, flexShrink: 0 }} />
        <B w="68%" h={26} />
      </div>
      <B w="35%" h={10} mb={16} />
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        <B w={80} h={22} />
        <B w={60} h={22} />
      </div>
      {/* Notes */}
      <div style={{ background: G.card, border: `1px solid ${G.border}`, borderLeft: `3px solid ${G.gold}44`, padding: 18, marginBottom: 6 }}>
        <B w={50} h={9} mb={10} />
        <B w="90%" h={10} mb={4} />
        <B w="70%" h={10} />
      </div>
      {/* Exercises */}
      <div style={{ background: G.card, border: `1px solid ${G.border}`, borderLeft: `3px solid ${G.gold}44`, padding: 18, marginBottom: 6 }}>
        <B w={70} h={9} mb={14} />
        {[0, 1, 2].map(i => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8, padding: '10px 12px', background: G.black, border: `1px solid ${G.border}`, marginBottom: 4 }}>
            <B w="80%" h={13} />
            <B w={24} h={13} />
            <B w={40} h={13} />
            <B w={36} h={13} />
          </div>
        ))}
      </div>
      {/* Action bar */}
      <div style={{ display: 'flex', gap: 4, padding: '10px 14px', background: G.card, border: `1px solid ${G.border}`, marginBottom: 20 }}>
        <B w={68} h={28} />
        <B w={90} h={28} />
        <B w={60} h={28} style={{ marginLeft: 'auto' }} />
      </div>
      {/* Comments */}
      <B w={100} h={14} mb={14} />
      {[0, 1].map(i => (
        <div key={i} style={{ display: 'flex', gap: 10, background: G.card, border: `1px solid ${G.border}`, padding: 12, marginBottom: 4 }}>
          <B w={30} h={30} />
          <div style={{ flex: 1 }}>
            <B w="40%" h={11} mb={6} />
            <B w="80%" h={10} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Journal List Skeleton ───────────────────────────────────
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ padding: 20, background: G.black, minHeight: '100vh' }}>
      <style>{STYLE}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 4, height: 28, background: `${G.gold}44` }} />
          <B w={100} h={28} />
        </div>
        <B w={110} h={32} />
      </div>
      <B w={160} h={30} mb={18} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          background: G.card, border: `1px solid ${G.border}`,
          borderLeft: `3px solid ${i === 0 ? G.gold + '44' : G.border}`,
          padding: '12px 14px', marginBottom: 4,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <B w={i % 2 === 0 ? 140 : 110} h={14} mb={6} />
            <B w={90} h={9} />
          </div>
          <B w={14} h={14} />
        </div>
      ))}
    </div>
  )
}