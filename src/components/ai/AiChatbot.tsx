"use client"

import { useState, useRef, useEffect } from "react"
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Trash2,
  ChevronDown,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

const QUICK_PROMPTS = [
  { label: "📊 Pipeline Summary", prompt: "Can you give me a full summary of my current deals pipeline and total revenue?" },
  { label: "⏰ Urgent Tasks", prompt: "What pending tasks or follow-ups do I have due soon?" },
  { label: "🔥 Hot Deals", prompt: "Which are my highest value deals right now and what stage are they in?" },
  { label: "💡 Closing Strategy", prompt: "Give me actionable advice on moving my negotiation deals to WON." },
]

export function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I'm **Nova AI**, your CRM intelligence Copilot. Ask me anything about your active deals, pending tasks, accounts, or sales strategy!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      inputRef.current?.focus()
    }
  }, [isOpen, messages])

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input.trim()
    if (!text || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json()

      if (data?.reply) {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ])
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "⚠️ " + (data?.error || "Sorry, I couldn't process your request. Please try again."),
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ])
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "⚠️ Connection error: Failed to reach Nova AI service. Please check your internet or API key.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClear = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Conversation cleared. How else can I assist your CRM workflow today?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ])
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      {/* Trigger Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-ink hover:bg-accent text-paper px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 border border-white/10"
        >
          <div className="relative">
            <Sparkles className="h-5 w-5 text-accent group-hover:text-paper transition-colors animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-tight font-sans pr-1">Ask Nova AI</span>
          <span className="flex h-2 w-2 rounded-full bg-signal animate-ping absolute top-1 right-1"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[380px] sm:w-[440px] h-[580px] max-h-[85vh] rounded-2xl border border-border bg-paper shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-ink text-paper p-4 flex items-center justify-between shrink-0 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-accent/20 border border-accent/40 text-accent flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs tracking-tight">Nova AI Copilot</h3>
                  <span className="text-[9px] bg-accent/20 text-accent px-1.5 py-0.2 rounded font-mono font-bold">
                    GPT-4o
                  </span>
                </div>
                <p className="text-[10px] text-paper/60 font-mono">Live CRM Telemetry & Strategy</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                className="text-paper/60 hover:text-paper p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title="Clear chat history"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-paper/60 hover:text-paper p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title="Minimize assistant"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-[#FCFAF6]/60">
            {messages.map(msg => {
              const isUser = msg.role === "user"

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="h-6 w-6 rounded-lg bg-ink text-paper flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Bot className="h-3.5 w-3.5 text-accent" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-xs text-xs leading-relaxed ${
                      isUser
                        ? "bg-ink text-paper rounded-tr-xs"
                        : "bg-paper border border-border text-ink rounded-tl-xs"
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">
                      {msg.content.split("\n").map((line, i) => (
                        <span key={i}>
                          {line}
                          {i !== msg.content.split("\n").length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                    <div
                      className={`text-[9px] mt-1 font-mono ${
                        isUser ? "text-paper/50 text-right" : "text-muted text-left"
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {isUser && (
                    <div className="h-6 w-6 rounded-lg bg-accent/20 text-accent flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              )
            })}

            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="h-6 w-6 rounded-lg bg-ink text-paper flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-accent" />
                </div>
                <div className="bg-paper border border-border text-ink rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.2s]"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-2 border-t border-border/60 bg-paper overflow-x-auto flex gap-1.5 no-scrollbar shrink-0">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => handleSend(qp.prompt)}
                className="text-[11px] font-medium bg-ink/[0.03] hover:bg-ink/[0.07] text-ink border border-border/80 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 disabled:opacity-50"
              >
                <span>{qp.label}</span>
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t border-border bg-paper flex items-end gap-2 shrink-0">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about deals, pipeline, contacts, tasks..."
              className="flex-1 max-h-24 resize-none rounded-xl border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent font-sans placeholder:text-muted/60"
            />

            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="h-8 w-8 rounded-xl bg-ink hover:bg-accent text-paper flex items-center justify-center transition-all shadow-xs shrink-0 disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
