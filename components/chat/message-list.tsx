"use client"

import { useEffect, useRef, useState } from "react"
import { MessageBubble } from "./message-bubble"
import type { Message } from "./chat-shell"
import { TypingIndicator } from "./typing-indicator"
import { AlertCircle, RefreshCw } from "lucide-react"
import { AnimatedOrb } from "./animated-orb"
import type { CADSoftware } from "@/lib/cad-software"

interface MessageListProps {
  messages: Message[]
  isStreaming: boolean
  error: string | null
  onRetry: () => void
  isLoaded: boolean
  selectedCAD: CADSoftware
}

const LAUNCH_SOUND_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/launch-SUi0itAGHr1wtvdDYYG5bzFLsIYHtP.mp3"

export function MessageList({
  messages,
  isStreaming,
  error,
  onRetry,
  isLoaded,
  selectedCAD,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const rafRef = useRef<number | null>(null)
  const [hasAnimated, setHasAnimated] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastScrollRef = useRef<number>(0)
  const hasPlayedIntroRef = useRef(false)

  useEffect(() => {
    if (!isLoaded) return
    if (messages.length === 0 && !hasPlayedIntroRef.current) {
      setHasAnimated(true)
      hasPlayedIntroRef.current = true
      audioRef.current = new Audio(LAUNCH_SOUND_URL)
      audioRef.current.volume = 0.4
      audioRef.current.play().catch(() => {})
    } else if (messages.length > 0) {
      setHasAnimated(false)
      hasPlayedIntroRef.current = true
    }
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [isLoaded, messages.length])

  useEffect(() => {
    if (!containerRef.current) return
    containerRef.current.scrollTop = containerRef.current.scrollHeight
    setAutoScroll(true)
  }, [messages.length])

  useEffect(() => {
    if (!isStreaming || !autoScroll || !containerRef.current) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      return
    }
    const container = containerRef.current
    lastScrollRef.current = container.scrollTop

    const smoothScroll = () => {
      if (!container) return
      const { scrollHeight, clientHeight } = container
      const target = scrollHeight - clientHeight
      const current = lastScrollRef.current
      const diff = target - current
      if (diff > 0.5) {
        const next = current + diff * 0.04
        lastScrollRef.current = next
        container.scrollTop = next
      }
      rafRef.current = requestAnimationFrame(smoothScroll)
    }
    rafRef.current = requestAnimationFrame(smoothScroll)
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [isStreaming, autoScroll])

  const handleScroll = () => {
    if (!containerRef.current || isStreaming) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 150)
  }

  const lastMessage = messages[messages.length - 1]
  const showTypingIndicator =
    isStreaming &&
    (messages.length === 0 ||
      lastMessage?.role === "user" ||
      (lastMessage?.role === "assistant" && lastMessage?.content === ""))

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <AnimatedOrb size={64} />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto pt-4 pb-36 px-4 space-y-4"
      role="log"
      aria-label="Chat messages"
      aria-live="polite"
    >
      {/* Empty state */}
      {messages.length === 0 && !error && !isStreaming && (
        <div className="flex flex-col items-center justify-center h-full text-center min-h-[60vh]">
          <div className={`mb-6 ${hasAnimated ? "orb-intro" : ""}`}>
            <AnimatedOrb size={120} />
          </div>
          <p
            className={`text-xl font-semibold mb-2 ${hasAnimated ? "text-blur-intro" : ""}`}
            style={{ color: "var(--text-primary)" }}
          >
            What would you like to build?
          </p>
          <p
            className={`text-sm max-w-xs ${hasAnimated ? "text-blur-intro-delay" : ""}`}
            style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}
          >
            Describe your part, its dimensions, and the details that matter. We&apos;ll build it
            together in {selectedCAD.displayName}.
          </p>
        </div>
      )}

      {/* Messages */}
      {messages
        .filter((m) => {
          if (isStreaming && m.role === "assistant" && m === lastMessage && m.content === "")
            return false
          return true
        })
        .map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isStreaming={isStreaming && message.role === "assistant" && message === lastMessage}
          />
        ))}

      {showTypingIndicator && <TypingIndicator />}

      {/* Error state */}
      {error && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl"
          role="alert"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <AlertCircle className="w-5 h-5 shrink-0" style={{ color: "var(--offline)" }} />
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: "#DC2626" }}>
              Something went wrong
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#EF4444" }}>
              {error}
            </p>
          </div>
          <button
            onClick={onRetry}
            className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg transition-colors"
            style={{
              color: "#DC2626",
              background: "rgba(239,68,68,0.08)",
            }}
            aria-label="Retry"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      <div aria-hidden="true" className="h-4" />
    </div>
  )
}
