'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'

const G = {
  black: '#0a0800', dark: '#111007', card: '#161410',
  gold: '#f5c800', white: '#f0ede0', grey: '#5a5648', border: '#2a2518',
}

type Message = {
  id: string
  content: string
  sender_id: string
  created_at: string
  profiles: { username: string; display_name: string; avatar_url: string | null }
}

export default function ChatClient({
  conversationId,
  currentUserId,
  currentProfile,
  otherProfile,
  initialMessages,
}: {
  conversationId: string
  currentUserId: string
  currentProfile: any
  otherProfile: { id: string; username: string; display_name: string; avatar_url: string | null; sport?: string | null } | null
  initialMessages: Message[]
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const seenIds = useRef<Set<string>>(new Set(initialMessages.map(m => m.id)))

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Real-time subscription for OTHER person's messages
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, async (payload) => {
        // Skip if we already added this message (our own optimistic update)
        if (seenIds.current.has(payload.new.id)) return
        seenIds.current.add(payload.new.id)

        const { data } = await supabase
          .from('messages')
          .select('*, profiles(username, display_name, avatar_url)')
          .eq('id', payload.new.id)
          .single()
        if (data) setMessages(prev => [...prev, data])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId])

  const handleSend = async () => {
    if (!input.trim() || sending) return
    const content = input.trim()
    setInput('')
    setSending(true)

    // Optimistic update — add message immediately to UI
    const tempId = `temp-${Date.now()}`
    const optimisticMsg: Message = {
      id: tempId,
      content,
      sender_id: currentUserId,
      created_at: new Date().toISOString(),
      profiles: {
        username: currentProfile?.username,
        display_name: currentProfile?.display_name,
        avatar_url: currentProfile?.avatar_url,
      },
    }
    setMessages(prev => [...prev, optimisticMsg])
    seenIds.current.add(tempId)

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content,
      })
      .select('*, profiles(username, display_name, avatar_url)')
      .single()

    if (error) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempId))
      toast.error('Failed to send message')
      setInput(content)
    } else if (data) {
      // Replace temp message with real one
      seenIds.current.add(data.id)
      setMessages(prev => prev.map(m => m.id === tempId ? data : m))
    }

    setSending(false)
  }

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  let lastDate = ''

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: 'calc(100vh - 52px - 64px)',
      background: G.black,
      fontFamily: "'Barlow Condensed', sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');`}</style>

      {/* Chat header */}
      <div style={{
        padding: '12px 16px',
        background: G.dark,
        borderBottom: `1px solid ${G.border}`,
        display: 'flex', alignItems: 'center', gap: 12,
        flexShrink: 0,
      }}>
        <Link href="/messages" style={{ color: G.grey, textDecoration: 'none', fontSize: 20, lineHeight: 1, fontWeight: 700 }}>←</Link>

        {otherProfile && (
          <>
            <Link href={`/${otherProfile.username}`}>
              <div style={{ width: 38, height: 38, padding: 2, background: G.gold, flexShrink: 0 }}>
                <img
                  src={otherProfile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherProfile.username}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  alt="avatar"
                />
              </div>
            </Link>
            <div style={{ flex: 1 }}>
              <Link href={`/${otherProfile.username}`} style={{ textDecoration: 'none' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: G.white, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1 }}>
                  {otherProfile.display_name}
                </div>
                <div style={{ fontSize: 11, color: G.grey }}>@{otherProfile.username}</div>
              </Link>
            </div>
            {otherProfile.sport && (
              <span style={{
                fontSize: 9, padding: '2px 8px',
                background: `${G.gold}11`, color: G.gold,
                border: `1px solid ${G.gold}33`,
                fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>#{otherProfile.sport.toUpperCase()}</span>
            )}
          </>
        )}
      </div>

      {/* Messages area */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '16px',
        display: 'flex', flexDirection: 'column', gap: 2,
      }}>
        {messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
              <p style={{ color: G.grey, fontSize: 14 }}>Start the conversation</p>
              <p style={{ color: G.grey, fontSize: 12, marginTop: 4 }}>
                Say something to {otherProfile?.display_name}
              </p>
            </div>
          </div>
        ) : messages.map((msg, i) => {
          const isMe = msg.sender_id === currentUserId
          const msgDate = formatDate(msg.created_at)
          const showDate = msgDate !== lastDate
          if (showDate) lastDate = msgDate

          const prevMsg = messages[i - 1]
          const nextMsg = messages[i + 1]
          const isFirst = !prevMsg || prevMsg.sender_id !== msg.sender_id
          const isLast = !nextMsg || nextMsg.sender_id !== msg.sender_id
          const isTemp = msg.id.startsWith('temp-')

          return (
            <div key={msg.id}>
              {showDate && (
                <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
                  <span style={{
                    fontSize: 10, color: G.grey, fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    background: G.black, padding: '2px 10px',
                    border: `1px solid ${G.border}`,
                  }}>{msgDate}</span>
                </div>
              )}

              <div style={{
                display: 'flex',
                flexDirection: isMe ? 'row-reverse' : 'row',
                alignItems: 'flex-end', gap: 8,
                marginTop: isFirst ? 8 : 2,
              }}>
                {/* Other person avatar */}
                <div style={{ width: 28, flexShrink: 0 }}>
                  {!isMe && isLast && (
                    <div style={{ width: 28, height: 28, padding: 2, background: G.border }}>
                      <img
                        src={otherProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherProfile?.username}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        alt="avatar"
                      />
                    </div>
                  )}
                </div>

                <div style={{ maxWidth: '72%' }}>
                  <div style={{
                    padding: '9px 13px',
                    background: isMe ? G.gold : G.card,
                    color: isMe ? G.black : G.white,
                    border: isMe ? 'none' : `1px solid ${G.border}`,
                    borderLeft: isMe ? 'none' : `3px solid ${G.border}`,
                    fontSize: 14,
                    fontFamily: 'Barlow, sans-serif',
                    lineHeight: 1.4,
                    fontWeight: isMe ? 600 : 400,
                    opacity: isTemp ? 0.6 : 1,
                    transition: 'opacity 0.2s',
                  }}>
                    {msg.content}
                  </div>
                  {isLast && (
                    <div style={{
                      fontSize: 10, color: G.grey, marginTop: 3,
                      textAlign: isMe ? 'right' : 'left',
                      letterSpacing: '0.04em',
                    }}>
                      {isTemp ? 'sending...' : formatTime(msg.created_at)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        padding: '10px 16px',
        background: G.dark,
        borderTop: `1px solid ${G.border}`,
        display: 'flex', gap: 8, flexShrink: 0,
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder="Write a message..."
          style={{
            flex: 1, padding: '10px 14px',
            background: G.black,
            border: `1px solid ${G.border}`,
            color: G.white, fontSize: 14, outline: 'none',
            fontFamily: 'Barlow, sans-serif',
          }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          style={{
            padding: '10px 20px',
            background: sending || !input.trim() ? G.card : G.gold,
            color: sending || !input.trim() ? G.grey : G.black,
            border: 'none',
            cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: 12, fontWeight: 900,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            transition: 'all 0.15s', flexShrink: 0,
          }}
        >
          {sending ? '...' : 'SEND'}
        </button>
      </div>
    </div>
  )
}