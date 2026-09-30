"use client"

import { AnimatedOrb } from "./animated-orb"

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 mr-auto">
      <AnimatedOrb className="w-8 h-8 shrink-0" />
      <div
        className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-md"
        style={{
          background: "var(--message-ai-bg)",
          border: "1px solid var(--border-color)",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="typing-dot w-2 h-2 rounded-full"
            style={{
              background: "var(--brand-primary)",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
