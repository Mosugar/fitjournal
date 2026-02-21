'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const G = {
  black: '#0a0800', dark: '#111007', card: '#161410',
  gold: '#f5c800', goldDim: '#c9a200', white: '#f0ede0',
  grey: '#5a5648', border: '#2a2518',
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  if (hours < 24) return `${hours}h`
  return `${days}d`
}

type Conversation = {
  id: string
  other: { id: string; username: string; display_name: string; avatar_url: string | null }
  lastMessage: { content: string; created_at: string; sender_id: string } | null
  unread: boolean
}

export default function MessagesClient({
  conversations: initialConversations,
  currentUserId,
  currentProfile,
}: {
  conversations: Conversation[]
  currentUserId: string
  currentProfile: any
}) {
  const [conversations, setConversations] = useState(initialConversations)
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [newChat, setNewChat] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSearch = async (q: string) => {
    setSearch(q)
    if (!q.trim()) { setSearchResults([]); return }
    setSearching(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
      .neq('id', currentUserId)
      .limit(8)
    setSearchResults(data || [])
    setSearching(false)
  }

  const startConversation = async (otherUserId: string) => {
    const existing = conversations.find(c => c.other?.id === otherUserId)
    if (existing) {
      router.push(`/messages/${existing.id}`)
      return
    }

    const { data: conv, error } = await supabase
      .from('conversations')
      .insert({})
      .select()
      .single()

    console.log('Conv error:', error)
    console.log('Conv data:', conv)

    if (error || !conv) {
      toast.error(`Conv error: ${error?.message || 'unknown'}`)
      return
    }

    const { error: partError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: conv.id, user_id: currentUserId },
        { conversation_id: conv.id, user_id: otherUserId },
      ])

    console.log('Participant error:', partError)

    if (partError) {
      toast.error(`Participant error: ${partError.message}`)
      return
    }

    toast.success('Conversation started!')
    router.push(`/messages/${conv.id}`)
    router.refresh()
  }

  return (
    <div style={{ background: G.black, minHeight: '100vh', fontFamily: "'Barlow Condensed', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');`}</style>

      {/* Header */}
      <div style={{ padding: '20px 16px 0', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 4, height: 28, background: G.gold }} />
            <h1 style={{ fontSize: 32, fontWeight: 900, color: G.white, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Messages
            </h1>
          </div>
          <button onClick={() => setNewChat(!newChat)} style={{
            padding: '8px 16px', background: newChat ? 'transparent' : G.gold,
            border: `1px solid ${G.gold}`, color: newChat ? G.gold : G.black,
            cursor: 'pointer', fontSize: 12, fontWeight: 900,
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            {newChat ? 'CANCEL' : '+ NEW'}
          </button>
        </div>

        {/* New chat search */}
        {newChat && (
          <div style={{ marginBottom: 12 }}>
            <input
              autoFocus
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search athlete to message..."
              style={{
                width: '100%', padding: '11px 14px',
                background: G.card, border: `1px solid ${G.gold}`,
                color: G.white, fontSize: 14, outline: 'none',
                boxSizing: 'border-box', fontFamily: 'Barlow, sans-serif',
              }}
            />
            {searchResults.length > 0 && (
              <div style={{ border: `1px solid ${G.border}`, borderTop: 'none' }}>
                {searchResults.map(p => (
                  <button key={p.id} onClick={() => startConversation(p.id)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', background: G.card,
                    border: 'none', borderBottom: `1px solid ${G.border}`,
                    cursor: 'pointer', textAlign: 'left',
                  }}>
                    <div style={{ width: 36, height: 36, padding: 2, background: G.gold, flexShrink: 0 }}>
                      <img src={p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="avatar" />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: G.white, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {p.display_name}
                      </div>
                      <div style={{ fontSize: 11, color: G.grey }}>@{p.username}</div>
                    </div>
                    <span style={{ marginLeft: 'auto', color: G.gold, fontSize: 14 }}>→</span>
                  </button>
                ))}
              </div>
            )}
            {search && !searching && searchResults.length === 0 && (
              <div style={{ padding: '14px', background: G.card, border: `1px solid ${G.border}`, borderTop: 'none', textAlign: 'center' }}>
                <span style={{ color: G.grey, fontSize: 13 }}>No athletes found</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Conversation list */}
      <div style={{ padding: '0 16px' }}>
        {conversations.length === 0 ? (
          <div style={{
            background: G.card, border: `1px solid ${G.border}`,
            borderLeft: `3px solid ${G.border}`,
            padding: '48px 20px', textAlign: 'center',
          }}>
            <p style={{ color: G.grey, fontSize: 14, marginBottom: 8 }}>No conversations yet</p>
            <p style={{ color: G.grey, fontSize: 12 }}>Hit + NEW to message an athlete</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {conversations.map(conv => (
              <Link key={conv.id} href={`/messages/${conv.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: conv.unread ? `${G.gold}08` : G.card,
                  border: `1px solid ${conv.unread ? G.gold + '44' : G.border}`,
                  borderLeft: `3px solid ${conv.unread ? G.gold : G.border}`,
                  padding: '12px 14px',
                }}>
                  <div style={{ width: 44, height: 44, padding: 2, background: conv.unread ? G.gold : G.border, flexShrink: 0 }}>
                    <img
                      src={conv.other?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.other?.username}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      alt="avatar"
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                      <span style={{ fontSize: 16, fontWeight: conv.unread ? 900 : 700, color: G.white, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {conv.other?.display_name}
                      </span>
                      {conv.lastMessage && (
                        <span style={{ fontSize: 10, color: G.grey, flexShrink: 0 }}>
                          {timeAgo(conv.lastMessage.created_at)}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: conv.unread ? G.white : G.grey, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'Barlow, sans-serif', fontWeight: conv.unread ? 600 : 400 }}>
                      {conv.lastMessage
                        ? `${conv.lastMessage.sender_id === currentUserId ? 'You: ' : ''}${conv.lastMessage.content}`
                        : 'Start the conversation'}
                    </div>
                  </div>
                  {conv.unread && (
                    <div style={{ width: 8, height: 8, background: G.gold, borderRadius: '50%', flexShrink: 0 }} />
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}