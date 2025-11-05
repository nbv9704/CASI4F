'use client'

import { useMemo, useState } from 'react'
import { MessageCircleQuestion, Send, X } from 'lucide-react'

const QUICK_REPLIES = [
  "Why can't I withdraw my credits?",
  'My reward is frozen',
  'Other question',
]

function createInitialMessages() {
  return [
    {
      id: 'bot-welcome',
      author: 'bot',
      text: 'Hi! I\'m the CASI4F support bot. How may we assist you today?',
      timestamp: new Date().toISOString(),
    },
  ]
}

export default function HelpWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(createInitialMessages)
  const [input, setInput] = useState('')

  const lastBotReply = useMemo(() => {
    const reversed = [...messages].reverse()
    return reversed.find((msg) => msg.author === 'bot')
  }, [messages])

  const appendMessage = (author, text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setMessages((prev) => [
      ...prev,
      {
        id: `${author}-${prev.length}-${Date.now()}`,
        author,
        text: trimmed,
        timestamp: new Date().toISOString(),
      },
    ])
  }

  const handleSend = (text) => {
    const outgoing = text ?? input
    appendMessage('user', outgoing)
    setInput('')

    setTimeout(() => {
      appendMessage(
        'bot',
        "Thanks for reaching out! A live agent will review your message shortly. If it's urgent, please include your CASI4F username so we can look into your account right away."
      )
    }, 450)
  }

  const handleQuickReply = (text) => {
    handleSend(text)
  }

  return (
    <aside className='fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 sm:bottom-8 sm:right-8'>
      {open && (
        <div className='w-80 overflow-hidden rounded-3xl border border-white/10 bg-[#111632] text-slate-200 shadow-[0_24px_70px_rgba(6,9,25,0.55)] backdrop-blur-md'>
          <header className='flex items-center justify-between bg-white/10 px-4 py-3'>
            <div>
              <p className='text-xs uppercase tracking-[0.3em] text-indigo-200/80'>Contact us</p>
              <p className='text-sm font-semibold text-white'>CASI4F Support Bot</p>
            </div>
            <button
              type='button'
              onClick={() => setOpen(false)}
              className='rounded-full p-2 text-slate-300 transition hover:bg-white/10 hover:text-white'
              aria-label='Close help center'
            >
              <X className='h-4 w-4' aria-hidden='true' />
            </button>
          </header>

          <div className='flex max-h-72 flex-col gap-3 overflow-y-auto px-4 py-4 text-sm'>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.author === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 leading-relaxed ${
                    message.author === 'user'
                      ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-[0_10px_30px_rgba(79,70,229,0.35)]'
                      : 'bg-white/10 text-slate-100'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <div className='flex flex-wrap gap-2 px-4 pb-3'>
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply}
                type='button'
                onClick={() => handleQuickReply(reply)}
                className='rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition hover:border-indigo-400/60 hover:text-white'
              >
                {reply}
              </button>
            ))}
          </div>

          <form
            className='flex items-center gap-2 border-t border-white/10 bg-white/5 px-4 py-3'
            onSubmit={(event) => {
              event.preventDefault()
              handleSend()
            }}
          >
            <input
              type='text'
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder='Type a message'
              className='flex-1 rounded-2xl border border-transparent bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/30'
            />
            <button
              type='submit'
              className='flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-[0_10px_28px_rgba(79,70,229,0.45)] transition hover:shadow-[0_12px_34px_rgba(79,70,229,0.5)]'
              aria-label='Send message'
            >
              <Send className='h-4 w-4' aria-hidden='true' />
            </button>
          </form>
        </div>
      )}

      <button
        type='button'
        onClick={() => {
          setOpen((value) => !value)
          if (!open) {
            setMessages(createInitialMessages())
          }
        }}
        className='flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(79,70,229,0.45)] transition hover:shadow-[0_22px_55px_rgba(79,70,229,0.55)]'
      >
        <MessageCircleQuestion className='h-5 w-5' aria-hidden='true' />
        Help
      </button>
      {open && lastBotReply && (
        <p className='max-w-[17rem] text-right text-[11px] uppercase tracking-[0.28em] text-white/50'>
          Replies typically arrive within a few minutes
        </p>
      )}
    </aside>
  )
}
