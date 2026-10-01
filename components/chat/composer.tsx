"use client"

import type React from "react"
import { useState, useRef, useCallback, type KeyboardEvent, useEffect } from "react"
import { Square, Mic, MicOff, Paperclip, X, ChevronDown, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { AnimatedOrb } from "./animated-orb"
import { AudioWaveform } from "./audio-waveform"
import type { AIModel } from "./chat-shell"
import type { CADSoftware } from "@/lib/cad-software"
import { useLang } from "@/lib/lang-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"

export const AI_MODELS: { id: AIModel; name: string; icon: string; shortName: string }[] = [
  { id: "google/gemini-3.8-flash", name: "Gemini 3.8 Flash", shortName: "Gemini", icon: "/images/google.webp" },
  { id: "openai/gpt-4o", name: "GPT-4o", shortName: "GPT-4o", icon: "/images/gpt.png" },
  { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4", shortName: "Claude", icon: "/images/claude.svg" },
]

interface ComposerProps {
  onSend: (content: string, imageData?: string) => void
  onStop: () => void
  isStreaming: boolean
  disabled?: boolean
  selectedModel: AIModel
  onModelChange: (model: AIModel) => void
  selectedCAD: CADSoftware
}

export function Composer({ onSend, onStop, isStreaming, disabled, selectedModel, onModelChange, selectedCAD }: ComposerProps) {
  const [value, setValue] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [showImageBounce, setShowImageBounce] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const baseTextRef = useRef("")
  const finalTranscriptsRef = useRef("")
  const { t } = useLang()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SR) {
        recognitionRef.current = new SR()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "en-US"
        recognitionRef.current.onresult = (event: any) => {
          let newFinal = ""
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) newFinal += event.results[i][0].transcript + " "
          }
          if (newFinal) {
            finalTranscriptsRef.current += newFinal
            setValue(baseTextRef.current + finalTranscriptsRef.current)
            setTimeout(() => handleInput(), 0)
          }
        }
        recognitionRef.current.onerror = () => setIsRecording(false)
        recognitionRef.current.onend = () => setIsRecording(false)
      }
    }
    return () => recognitionRef.current?.stop()
  }, [])

  useEffect(() => { setHasAnimated(true) }, [])

  const playClickSound = useCallback(() => {
    const audio = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/click-FM4Xaa1FJj237591TiZw4yL1fIxdOw.mp3")
    audio.volume = 0.4
    audio.play().catch(() => {})
  }, [])

  const toggleRecording = useCallback(() => {
    if (!recognitionRef.current) { alert("Speech recognition not supported"); return }
    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
      mediaStream?.getTracks().forEach((t) => t.stop())
      setMediaStream(null)
    } else {
      baseTextRef.current = value
      finalTranscriptsRef.current = ""
      recognitionRef.current.start()
      setIsRecording(true)
      navigator.mediaDevices.getUserMedia({ audio: true }).then(setMediaStream).catch(console.error)
    }
  }, [isRecording, value, mediaStream])

  const handleInput = useCallback(() => {
    const ta = textareaRef.current
    if (ta) { ta.style.height = "auto"; ta.style.height = `${Math.min(ta.scrollHeight, 200)}px` }
  }, [])

  const handleSend = useCallback(() => {
    if ((!value.trim() && !uploadedImage) || isStreaming || disabled) return
    playClickSound()
    if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false) }
    onSend(value || "Describe this image", uploadedImage || undefined)
    setValue("")
    setUploadedImage(null)
    baseTextRef.current = ""
    finalTranscriptsRef.current = ""
    if (textareaRef.current) textareaRef.current.style.height = "auto"
  }, [value, uploadedImage, isStreaming, disabled, onSend, isRecording, playClickSound])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }, [handleSend])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setUploadedImage(ev.target?.result as string)
        setShowImageBounce(true)
        setTimeout(() => setShowImageBounce(false), 400)
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ""
  }, [])

  const currentModel = AI_MODELS.find((m) => m.id === selectedModel) || AI_MODELS[0]
  const placeholder = isRecording ? t.listening : `${t.askAnything} ${selectedCAD.displayName} ${t.orDescribe}`

  const canSend = (value.trim().length > 0 || !!uploadedImage) && !isStreaming && !disabled

  return (
    <div className={cn("fixed bottom-4 left-0 right-0 px-4 pointer-events-none z-10", hasAnimated && "composer-intro")}>
      <div className="relative max-w-2xl mx-auto pointer-events-auto">
        <div className="sg-composer flex flex-col gap-2 p-3 rounded-3xl overflow-hidden">

          {/* Uploaded image preview */}
          {uploadedImage && (
            <div className={cn("relative self-start", showImageBounce && "image-bounce")}>
              <div className="w-14 h-14 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-color)" }}>
                <Image src={uploadedImage} alt="Uploaded" width={56} height={56} className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => setUploadedImage(null)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "var(--text-primary)", color: "var(--background)" }}
                aria-label="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Input row — textarea + model icon + orb */}
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => { setValue(e.target.value); handleInput() }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isStreaming || disabled}
              rows={1}
              className={cn(
                "flex-1 resize-none bg-transparent px-2 py-1.5 text-sm focus:outline-none",
                "disabled:opacity-50 disabled:cursor-not-allowed max-h-[160px] overflow-y-auto"
              )}
              style={{ color: "var(--text-primary)", caretColor: "var(--brand-primary)" }}
              aria-label="Message input"
              id="message-input"
            />

            {isRecording && (
              <div className="shrink-0 w-20">
                <AudioWaveform isRecording={isRecording} stream={mediaStream} />
              </div>
            )}

            {/* AI Model Icon — right side of text area, before orb */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  disabled={isStreaming || disabled}
                  title={currentModel.name}
                  aria-label={t.selectModel}
                  id="model-icon-btn"
                  className="shrink-0 w-7 h-7 rounded-full overflow-hidden flex items-center justify-center transition-all hover:scale-110 hover:ring-2 hover:ring-[var(--brand-primary)] focus:outline-none mb-0.5"
                  style={{ border: "1.5px solid var(--border-color)", background: "var(--surface-2)" }}
                >
                  <Image
                    src={currentModel.icon}
                    alt={currentModel.name}
                    width={22}
                    height={22}
                    className="object-contain w-5 h-5"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent
                  align="end"
                  side="top"
                  sideOffset={10}
                  className="w-52 px-1.5 py-1.5 rounded-2xl z-[9999]"
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border-color)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                  }}
                >
                  {AI_MODELS.map((model) => (
                    <DropdownMenuItem
                      key={model.id}
                      onClick={() => { playClickSound(); onModelChange(model.id) }}
                      className={cn(
                        "flex items-center cursor-pointer gap-3 rounded-xl py-2.5 px-2",
                        selectedModel === model.id && "bg-[var(--brand-subtle)]"
                      )}
                      id={`model-${model.id.replace(/\//g, "-")}`}
                    >
                      <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ border: "1px solid var(--border-color)", background: "var(--surface-2)" }}>
                        <Image src={model.icon} alt={model.name} width={20} height={20} className="object-contain w-5 h-5" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{model.shortName}</span>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{model.name}</span>
                      </div>
                      {selectedModel === model.id && (
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "var(--brand-primary)" }} />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenu>

            {/* Send / Stop orb */}
            {isStreaming ? (
              <button
                onClick={() => { playClickSound(); onStop() }}
                className="relative h-9 w-9 shrink-0 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                aria-label={t.stop}
                id="stop-btn"
              >
                <AnimatedOrb size={36} variant="red" />
                <Square className="w-4 h-4 absolute text-red-700 drop-shadow-md" fill="currentColor" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!canSend}
                className={cn(
                  "relative h-9 w-9 shrink-0 rounded-full flex items-center justify-center transition-transform",
                  !canSend ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:scale-105"
                )}
                aria-label={t.send}
                id="send-btn"
              >
                <AnimatedOrb size={36} />
              </button>
            )}
          </div>

          {/* Bottom toolbar */}
          <div className="flex items-center gap-1.5">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

            <button
              onClick={toggleRecording}
              disabled={isStreaming || disabled}
              title={isRecording ? t.stopRecording : t.voiceInput}
              aria-label={isRecording ? t.stopRecording : t.voiceInput}
              className={cn("sg-btn-icon w-7 h-7", isRecording && "animate-bounce-subtle")}
              style={isRecording ? { background: "#EF4444", borderColor: "#EF4444", color: "white" } : {}}
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isStreaming || disabled}
              title={t.attachImage}
              aria-label={t.attachImage}
              id="attach-image-btn"
              className="sg-btn-icon w-7 h-7"
            >
              <Paperclip className="w-3.5 h-3.5" />
            </button>

            {/* Model name label (small, bottom left) */}
            <div className="flex items-center gap-1 ml-0.5">
              <Image
                src={currentModel.icon}
                alt={currentModel.name}
                width={14}
                height={14}
                className="object-contain opacity-60"
              />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{currentModel.shortName}</span>
            </div>

            <div className="flex-1" />

            {selectedCAD.id === "spaceclaim" && (
              <div className="flex items-center gap-1">
                {(["Shell", "Nozzle", "Head"] as const).map(label => (
                  <button
                    key={label}
                    onClick={() => onSend(`Create ${label}`)}
                    disabled={isStreaming || disabled}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                    style={{ background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.3)", color: "#eab308" }}
                    title={`Build ${label} in SpaceClaim`}
                  >
                    <Layers className="w-3 h-3" />
                    {label}
                  </button>
                ))}
              </div>
            )}

            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{selectedCAD.displayName}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
