"use client"

import { cn } from "@/lib/utils"
import type { Message } from "./chat-shell"
import { MarkdownRenderer } from "./markdown-renderer"
import Image from "next/image"
import { AnimatedOrb } from "./animated-orb"
import { useCallback } from "react"

type ExecMode = "always-allow" | "ask-first" | "read-only"

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
  cadSoftware?: string
  executionMode?: ExecMode
  userId?: string
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function MessageBubble({
  message,
  isStreaming = false,
  cadSoftware = "solidworks",
  executionMode = "always-allow",
  userId = "guest",
}: MessageBubbleProps) {
  const isUser = message.role === "user"

  const handleAutoRun = useCallback(async (code: string, language: string) => {
    try {
      await fetch("http://localhost:7800/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ software: cadSoftware, script: code }),
        signal: AbortSignal.timeout(15000),
        mode: "cors",
      })
    } catch {}
  }, [cadSoftware])

  return (
    <div
      className={cn(
        "flex max-w-[92%] md:max-w-[84%] gap-2.5",
        isUser
          ? "ml-auto flex-row-reverse user-message-enter"
          : "mr-auto animate-in fade-in slide-in-from-bottom-2 duration-300 items-end",
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          !isUser && isStreaming && "sticky bottom-4 self-end",
        )}
        aria-hidden="true"
      >
        {isUser ? (
          <div className="sg-avatar text-xs">D</div>
        ) : (
          <AnimatedOrb className="w-8 h-8 shrink-0" />
        )}
      </div>

      <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
        <span className="text-xs mb-1 hidden sm:block" style={{ color: "var(--text-muted)" }}>
          {isUser ? "You" : "SpaceGeo AI"}
        </span>

        <div
          className={cn("rounded-2xl overflow-hidden", isUser ? "msg-user" : "msg-ai")}
          style={{ willChange: isStreaming ? "height" : "auto" }}
        >
          <div className={cn(isUser ? "px-4 py-2.5" : "px-4 py-3")}>
            {isUser ? (
              <div className="flex flex-col gap-2">
                {message.imageData && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.1)" }}>
                    <Image src={message.imageData} alt="Uploaded" width={80} height={80} className="w-full h-full object-cover" />
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap break-words font-medium">{message.content}</p>
              </div>
            ) : (
              <div className="sg-prose">
                <MarkdownRenderer
                  content={message.content || " "}
                  isStreaming={isStreaming}
                  cadSoftware={cadSoftware}
                  executionMode={executionMode}
                  userId={userId}
                  onAutoRun={executionMode === "always-allow" ? handleAutoRun : undefined}
                />
              </div>
            )}
          </div>
        </div>

        <span className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  )
}
