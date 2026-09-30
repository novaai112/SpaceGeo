"use client"

import { cn } from "@/lib/utils"
import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { AnalysisWordSpan } from "./analysis-word-span"
import { CodeBlock } from "./code-block"

type ExecMode = "always-allow" | "ask-first" | "read-only"

interface MarkdownRendererProps {
  content: string
  className?: string
  isStreaming?: boolean
  cadSoftware?: string
  executionMode?: ExecMode
  userId?: string
  onAutoRun?: (code: string, language: string) => void
}

export function MarkdownRenderer({
  content,
  className,
  isStreaming = false,
  cadSoftware = "solidworks",
  executionMode = "always-allow",
  userId = "guest",
  onAutoRun,
}: MarkdownRendererProps) {
  const [staticContent, setStaticContent] = useState("")
  const [animatingContent, setAnimatingContent] = useState("")
  const autoRanCodes = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (isStreaming) {
      const newContent = content.slice(staticContent.length)
      setAnimatingContent(newContent)
    } else {
      setStaticContent(content)
      setAnimatingContent("")
    }
  }, [content, isStreaming, staticContent.length])

  useEffect(() => {
    if (animatingContent.length > 200) {
      const cutPoint = animatingContent.lastIndexOf(" ", 150)
      if (cutPoint > 50) {
        setStaticContent((prev) => prev + animatingContent.slice(0, cutPoint + 1))
        setAnimatingContent(animatingContent.slice(cutPoint + 1))
      }
    }
  }, [animatingContent])

  useEffect(() => {
    if (!isStreaming && executionMode === "always-allow" && onAutoRun) {
      const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g
      let match
      while ((match = codeBlockRegex.exec(content)) !== null) {
        const lang = match[1] || "python"
        const code = match[2].trim()
        const key = code.slice(0, 50)
        if (code.length > 10 && !autoRanCodes.current.has(key)) {
          autoRanCodes.current.add(key)
          onAutoRun(code, lang)
        }
      }
    }
  }, [isStreaming, content, executionMode, onAutoRun])

  const renderPlainInlineMarkdown = (text: string) => {
    const elements: (string | React.ReactNode)[] = []
    let remaining = text
    let keyIndex = 0

    while (remaining.length > 0) {
      const codeMatch = remaining.match(/^`([^`]+)`/)
      if (codeMatch) {
        elements.push(
          <code key={keyIndex++} className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: "var(--surface-2)", color: "var(--brand-primary)" }}>
            {codeMatch[1]}
          </code>
        )
        remaining = remaining.slice(codeMatch[0].length)
        continue
      }

      const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/)
      if (boldMatch) {
        elements.push(<strong key={keyIndex++}>{boldMatch[1]}</strong>)
        remaining = remaining.slice(boldMatch[0].length)
        continue
      }

      const italicMatch = remaining.match(/^\*([^*]+)\*/)
      if (italicMatch) {
        elements.push(<em key={keyIndex++}>{italicMatch[1]}</em>)
        remaining = remaining.slice(italicMatch[0].length)
        continue
      }

      const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/)
      if (linkMatch) {
        elements.push(
          <a key={keyIndex++} href={linkMatch[2]} target="_blank" rel="noopener noreferrer"
            style={{ color: "var(--brand-primary)", textDecoration: "underline" }}>
            {linkMatch[1]}
          </a>
        )
        remaining = remaining.slice(linkMatch[0].length)
        continue
      }

      const nextSpecial = remaining.search(/[`*\[\]()]/)
      if (nextSpecial === -1) { elements.push(remaining); break }
      else if (nextSpecial === 0) { elements.push(remaining[0]); remaining = remaining.slice(1) }
      else { elements.push(remaining.slice(0, nextSpecial)); remaining = remaining.slice(nextSpecial) }
    }
    return elements
  }

  const renderAnimatedInlineMarkdown = (text: string) => {
    const elements: (string | React.ReactNode)[] = []
    let remaining = text
    let keyIndex = 0

    while (remaining.length > 0) {
      const codeMatch = remaining.match(/^`([^`]+)`/)
      if (codeMatch) {
        elements.push(
          <code key={keyIndex++} className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: "var(--surface-2)", color: "var(--brand-primary)" }}>
            {codeMatch[1]}
          </code>
        )
        remaining = remaining.slice(codeMatch[0].length)
        continue
      }

      const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/)
      if (boldMatch) {
        const words = boldMatch[1].split(/(\s+)/)
        elements.push(
          <strong key={keyIndex++}>
            {words.map((word, i) => {
              if (word.match(/\s+/)) return word
              if (!word) return null
              return <AnalysisWordSpan key={`b-${keyIndex}-${i}`} word={word} />
            })}
          </strong>
        )
        remaining = remaining.slice(boldMatch[0].length)
        continue
      }

      const nextSpecial = remaining.search(/[`*\[\]()]/)
      if (nextSpecial === -1) {
        const words = remaining.split(/(\s+)/)
        elements.push(
          ...words.map((word, i) => {
            if (word.match(/\s+/)) return word
            if (!word) return null
            return <AnalysisWordSpan key={`w-${keyIndex++}-${i}`} word={word} />
          })
        )
        break
      } else if (nextSpecial === 0) {
        elements.push(remaining[0])
        remaining = remaining.slice(1)
      } else {
        const textPart = remaining.slice(0, nextSpecial)
        const words = textPart.split(/(\s+)/)
        elements.push(
          ...words.map((word, i) => {
            if (word.match(/\s+/)) return word
            if (!word) return null
            return <AnalysisWordSpan key={`t-${keyIndex++}-${i}`} word={word} />
          })
        )
        remaining = remaining.slice(nextSpecial)
      }
    }
    return elements
  }

  const renderCodeBlock = (part: string, partIndex: number) => {
    const codeContent = part.slice(3, -3)
    const firstNewline = codeContent.indexOf("\n")
    const language = firstNewline > 0 ? codeContent.slice(0, firstNewline).trim() : ""
    const code = (firstNewline > 0 ? codeContent.slice(firstNewline + 1) : codeContent).trim()

    if (!code) return null

    return (
      <CodeBlock
        key={`cb-${partIndex}`}
        code={code}
        language={language}
        cadSoftware={cadSoftware}
        executionMode={executionMode}
        userId={userId}
      />
    )
  }

  const renderContent = (text: string, animated: boolean) => {
    if (!text) return null
    const parts = text.split(/(```[\s\S]*?```)/g)

    return parts.map((part, partIndex) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        return renderCodeBlock(part, partIndex)
      }
      if (animated) {
        return <span key={partIndex}>{renderAnimatedInlineMarkdown(part)}</span>
      }
      return <span key={partIndex}>{renderPlainInlineMarkdown(part)}</span>
    })
  }

  return (
    <div className={cn("text-sm whitespace-pre-wrap break-words", className)}>
      {renderContent(staticContent, false)}
      {renderContent(animatingContent, true)}
    </div>
  )
}
