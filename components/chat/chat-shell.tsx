"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { MessageList } from "./message-list"
import { Composer } from "./composer"
import { SettingsPanel } from "./settings-panel"
import { useTheme } from "@/lib/theme-context"
import { supabase } from "@/lib/supabase"
import { CAD_SOFTWARE_LIST, type CADSoftware } from "@/lib/cad-software"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: Date
  imageData?: string
}

export interface ChatSession {
  id: string
  title: string
  cadSoftware: string
  createdAt: Date
  messages: Message[]
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export type AIModel = "google/gemini-2.0-flash-001" | "openai/gpt-4o" | "anthropic/claude-sonnet-4"

export function SpaceGeoShell() {
  const { isDark } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState<"general" | "account">("general")
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedModel, setSelectedModel] = useState<AIModel>("google/gemini-2.0-flash-001")
  const [selectedCAD, setSelectedCAD] = useState<CADSoftware>(CAD_SOFTWARE_LIST[0]) // Default: SolidWorks
  const [cadConnected, setCadConnected] = useState(false)
  const [cadStatus, setCadStatus] = useState<"checking" | "online" | "offline">("offline")
  const [dailyUsage, setDailyUsage] = useState({ used: 0, limit: 50 })
  const [usagePopupOpen, setUsagePopupOpen] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // ── Load persisted state ──────────────────────────────────────────────────
  useEffect(() => {
    const storedCAD = localStorage.getItem("sg-cad-software")
    if (storedCAD) {
      const found = CAD_SOFTWARE_LIST.find((s) => s.id === storedCAD)
      if (found) setSelectedCAD(found)
    }
    const storedModel = localStorage.getItem("sg-model") as AIModel | null
    if (storedModel) setSelectedModel(storedModel)

    // Load sessions from localStorage
    const storedSessions = localStorage.getItem("sg-sessions")
    if (storedSessions) {
      try {
        const parsed: ChatSession[] = JSON.parse(storedSessions).map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          messages: s.messages.map((m: any) => ({ ...m, createdAt: new Date(m.createdAt) })),
        }))
        setSessions(parsed)
        if (parsed.length > 0) {
          const lastSession = parsed[parsed.length - 1]
          setActiveSessionId(lastSession.id)
          setMessages(lastSession.messages)
        }
      } catch (e) {
        console.error("Failed to load sessions:", e)
      }
    }

    loadDailyUsage()
    setIsLoaded(true)
  }, [])

  // ── Persist sessions ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem("sg-sessions", JSON.stringify(sessions))
  }, [sessions, isLoaded])

  // ── Daily Usage ──────────────────────────────────────────────────────────
  async function loadDailyUsage() {
    const today = new Date().toISOString().split("T")[0]
    const guestId = getGuestId()
    try {
      const { data } = await supabase
        .from("daily_usage")
        .select("*")
        .eq("user_id", guestId)
        .eq("date", today)
        .single()
      if (data) {
        setDailyUsage({ used: data.requests_count, limit: data.daily_limit })
      }
    } catch {
      // Table might not exist yet — handled gracefully
    }
  }

  async function incrementUsage() {
    const today = new Date().toISOString().split("T")[0]
    const guestId = getGuestId()
    try {
      const { data } = await supabase
        .from("daily_usage")
        .select("*")
        .eq("user_id", guestId)
        .eq("date", today)
        .single()

      if (data) {
        const newCount = data.requests_count + 1
        await supabase
          .from("daily_usage")
          .update({ requests_count: newCount })
          .eq("id", data.id)
        setDailyUsage((prev) => ({ ...prev, used: newCount }))
      } else {
        await supabase.from("daily_usage").insert({
          user_id: guestId,
          date: today,
          requests_count: 1,
          daily_limit: 50,
        })
        setDailyUsage((prev) => ({ ...prev, used: 1 }))
      }
    } catch {
      // Silently handle
    }
  }

  function getGuestId(): string {
    let id = localStorage.getItem("sg-guest-id")
    if (!id) {
      id = `guest-${generateId()}`
      localStorage.setItem("sg-guest-id", id)
    }
    return id
  }

  // ── CAD Connection Check ─────────────────────────────────────────────────
  const checkCADConnection = useCallback(async () => {
    setCadStatus("checking")
    // For desktop CADs (COM-based), we can't check from browser
    // We simulate by trying to ping a local server the user might set up
    // For real detection: the user runs a local bridge server
    try {
      if (selectedCAD.apiType === "rest") {
        let url = ""
        if (selectedCAD.id === "creo") url = "http://localhost:9056/creoson"
        else if (selectedCAD.id === "onshape") url = "https://cad.onshape.com/api/ping"

        if (url) {
          const res = await fetch(url, { signal: AbortSignal.timeout(3000) })
          if (res.ok) {
            setCadStatus("online")
            setCadConnected(true)
            return
          }
        }
      }
      // For COM-based software, try local bridge on port 7800
      const res = await fetch(`http://localhost:7800/status?software=${selectedCAD.id}`, {
        signal: AbortSignal.timeout(2000),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.running) {
          setCadStatus("online")
          setCadConnected(true)
          return
        }
      }
    } catch {
      // Not connected
    }
    setCadStatus("offline")
    setCadConnected(false)
  }, [selectedCAD])

  useEffect(() => {
    checkCADConnection()
    const interval = setInterval(checkCADConnection, 15000)
    return () => clearInterval(interval)
  }, [checkCADConnection])

  // ── Session Management ──────────────────────────────────────────────────
  const createNewSession = useCallback(() => {
    const session: ChatSession = {
      id: generateId(),
      title: "New Chat",
      cadSoftware: selectedCAD.id,
      createdAt: new Date(),
      messages: [],
    }
    setSessions((prev) => [...prev, session])
    setActiveSessionId(session.id)
    setMessages([])
    setError(null)
    setSidebarOpen(false)
  }, [selectedCAD.id])

  const switchSession = useCallback(
    (sessionId: string) => {
      const session = sessions.find((s) => s.id === sessionId)
      if (session) {
        setActiveSessionId(sessionId)
        setMessages(session.messages)
        setError(null)
        setSidebarOpen(false)
      }
    },
    [sessions],
  )

  const deleteSession = useCallback(
    (sessionId: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      if (activeSessionId === sessionId) {
        setActiveSessionId(null)
        setMessages([])
      }
    },
    [activeSessionId],
  )

  // ── Update active session messages ───────────────────────────────────────
  useEffect(() => {
    if (!activeSessionId) return
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, messages } : s)),
    )
  }, [messages, activeSessionId])

  // ── Send Message ────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (content: string, imageData?: string) => {
      if ((!content.trim() && !imageData) || isStreaming) return
      setError(null)

      // Auto-create session if none active
      let sessionId = activeSessionId
      if (!sessionId) {
        const session: ChatSession = {
          id: generateId(),
          title: content.slice(0, 40) || "New Chat",
          cadSoftware: selectedCAD.id,
          createdAt: new Date(),
          messages: [],
        }
        setSessions((prev) => [...prev, session])
        setActiveSessionId(session.id)
        sessionId = session.id
      } else {
        // Update session title from first message
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId && s.messages.length === 0
              ? { ...s, title: content.slice(0, 40) || "New Chat" }
              : s,
          ),
        )
      }

      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: content.trim() || "Describe this image",
        createdAt: new Date(),
        imageData,
      }
      const aiMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "",
        createdAt: new Date(),
      }

      const newMessages = [...messages, userMessage, aiMessage]
      setMessages(newMessages)
      setIsStreaming(true)
      incrementUsage()

      // Save to Supabase
      try {
        const { data: sessionData } = await supabase
          .from("chat_sessions")
          .upsert({
            id: sessionId,
            title: content.slice(0, 40) || "New Chat",
            cad_software: selectedCAD.id,
          })
          .select()
          .single()

        if (sessionData) {
          await supabase.from("chat_messages").insert({
            session_id: sessionId,
            role: "user",
            content: userMessage.content,
            image_data: imageData || null,
          })
        }
      } catch {
        // Continue even if Supabase fails
      }

      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
              imageData: m.imageData,
            })),
            model: selectedModel,
            cadSoftware: selectedCAD.id,
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          const errData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
          throw new Error(errData.error || `HTTP ${response.status}`)
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        if (!reader) throw new Error("No response body")

        let accumulated = ""
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          accumulated += decoder.decode(value, { stream: true })
          setMessages((prev) =>
            prev.map((m) => (m.id === aiMessage.id ? { ...m, content: accumulated } : m)),
          )
        }

        // Save AI response to Supabase
        try {
          await supabase.from("chat_messages").insert({
            session_id: sessionId,
            role: "assistant",
            content: accumulated,
          })
        } catch {}
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMessage.id ? { ...m, content: m.content || "[Cancelled]" } : m,
            ),
          )
        } else {
          setError(e instanceof Error ? e.message : "An error occurred")
          setMessages((prev) => prev.filter((m) => m.id !== aiMessage.id))
        }
      } finally {
        setIsStreaming(false)
        abortControllerRef.current = null
      }
    },
    [messages, isStreaming, selectedModel, selectedCAD, activeSessionId],
  )

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort()
  }, [])

  const retry = useCallback(() => {
    if (messages.length === 0) return
    const lastUser = [...messages].reverse().find((m) => m.role === "user")
    if (lastUser) {
      const idx = messages.findIndex((m) => m.id === lastUser.id)
      setMessages(messages.slice(0, idx))
      setError(null)
      setTimeout(() => sendMessage(lastUser.content, lastUser.imageData), 100)
    }
  }, [messages, sendMessage])

  const handleCADChange = (cad: CADSoftware) => {
    setSelectedCAD(cad)
    localStorage.setItem("sg-cad-software", cad.id)
    setCadStatus("checking")
    setCadConnected(false)
  }

  const openSettings = (tab: "general" | "account" = "general") => {
    setSettingsTab(tab)
    setSettingsOpen(true)
  }

  const usagePct = Math.round((dailyUsage.used / dailyUsage.limit) * 100)

  return (
    <div
      className="flex h-dvh overflow-hidden"
      style={{ background: "var(--background)", color: "var(--text-primary)" }}
    >
      {/* ── Sidebar ── */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewChat={createNewSession}
        onSwitchSession={switchSession}
        onDeleteSession={deleteSession}
      />

      {/* ── Main Area ── */}
      <div className="flex flex-col flex-1 min-w-0 relative">
        {/* Header */}
        <Header
          onMenuClick={() => setSidebarOpen((v) => !v)}
          onSettingsClick={openSettings}
          selectedCAD={selectedCAD}
          onCADChange={handleCADChange}
          cadStatus={cadStatus}
          onRefreshConnection={checkCADConnection}
          usagePct={usagePct}
          dailyUsage={dailyUsage}
          usagePopupOpen={usagePopupOpen}
          onToggleUsagePopup={() => setUsagePopupOpen((v) => !v)}
        />

        {/* Connection Status Banner */}
        <div
          className={`connection-banner flex items-center gap-2 ${cadStatus === "online" ? "connected" : "disconnected"}`}
        >
          <div className={cadStatus === "online" ? "status-online" : "status-offline"} />
          <span>
            {cadStatus === "checking"
              ? `Checking ${selectedCAD.displayName}…`
              : cadStatus === "online"
                ? `${selectedCAD.displayName} — Connected`
                : `${selectedCAD.displayName} is not running. Start ${selectedCAD.displayName}, open your document, then connect again.`}
          </span>
        </div>

        {/* Message List */}
        <MessageList
          messages={messages}
          isStreaming={isStreaming}
          error={error}
          onRetry={retry}
          isLoaded={isLoaded}
          selectedCAD={selectedCAD}
        />

        {/* Composer */}
        <Composer
          onSend={sendMessage}
          onStop={stopStreaming}
          isStreaming={isStreaming}
          disabled={!!error}
          selectedModel={selectedModel}
          onModelChange={(m) => {
            setSelectedModel(m)
            localStorage.setItem("sg-model", m)
          }}
          selectedCAD={selectedCAD}
        />
      </div>

      {/* ── Settings Panel ── */}
      {settingsOpen && (
        <SettingsPanel
          activeTab={settingsTab}
          onTabChange={setSettingsTab}
          onClose={() => setSettingsOpen(false)}
          selectedCAD={selectedCAD}
          onCADChange={handleCADChange}
          dailyUsage={dailyUsage}
        />
      )}
    </div>
  )
}
