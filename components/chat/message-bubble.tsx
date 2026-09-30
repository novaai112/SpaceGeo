"use client"

import { cn } from "@/lib/utils"
import type { Message } from "./chat-shell"
import { MarkdownRenderer } from "./markdown-renderer"
import Image from "next/image"
import { AnimatedOrb } from "./animated-orb"

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div
      className={cn(
        "flex max-w-[90%] md:max-w-[82%] gap-2.5",
        isUser
          ? "ml-auto flex-row-reverse user-message-enter"
          : "mr-auto animate-in fade-in slide-in-from-bottom-2 duration-300 items-end",
      )}
    >
      {/* Avatar */}
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

      {/* Content */}
      <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
        <span
          className="text-xs mb-1 hidden sm:block"
          style={{ color: "var(--text-muted)" }}
        >
          {isUser ? "You" : "SpaceGeo AI"}
        </span>

        {/* Bubble */}
        <div
          className={cn(
            "rounded-2xl overflow-hidden",
            isUser ? "msg-user" : "msg-ai",
          )}
          style={{
            willChange: isStreaming ? "height" : "auto",
          }}
        >
          <div className={cn(isUser ? "px-4 py-2.5" : "px-4 py-3")}>
            {isUser ? (
              <div className="flex flex-col gap-2">
                {message.imageData && (
                  <div
                    className="w-20 h-20 rounded-lg overflow-hidden"
                    style={{ border: "1px solid rgba(0,0,0,0.1)" }}
                  >
                    <Image
                      src={message.imageData}
                      alt="Uploaded"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap break-words font-medium">
                  {message.content}
                </p>
              </div>
            ) : (
              <div className="sg-prose">
                <MarkdownRenderer content={message.content || " "} isStreaming={isStreaming} />
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
