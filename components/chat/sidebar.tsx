"use client"

import { type ChatSession } from "./chat-shell"
import { Plus, MessageSquare, Trash2, Brain, Cpu, Users, X, Zap } from "lucide-react"

interface SidebarProps {
  open: boolean
  onClose: () => void
  sessions: ChatSession[]
  activeSessionId: string | null
  onNewChat: () => void
  onSwitchSession: (id: string) => void
  onDeleteSession: (id: string) => void
}

export function Sidebar({
  open,
  onClose,
  sessions,
  activeSessionId,
  onNewChat,
  onSwitchSession,
  onDeleteSession,
}: SidebarProps) {
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed left-0 top-0 h-full z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          width: 240,
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--border-color)",
        }}
        aria-label="Sidebar navigation"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 h-12 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border-color)" }}
        >
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="var(--brand-primary)" />
              <path d="M2 17l10 5 10-5" stroke="var(--brand-primary)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M2 12l10 5 10-5" stroke="var(--brand-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            </svg>
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              SpaceGeo AI
            </span>
          </div>
          <button className="sg-btn-ghost p-1 rounded" onClick={onClose} aria-label="Close sidebar">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat */}
        <div className="p-3">
          <button
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: "var(--brand-subtle)",
              color: "var(--text-primary)",
              border: "1px solid var(--brand-glow)",
            }}
            onClick={onNewChat}
            aria-label="New chat"
          >
            <Plus className="w-4 h-4" style={{ color: "var(--brand-primary)" }} />
            New Chat
          </button>
        </div>

        {/* Navigation Items */}
        <div className="px-2">
          {[
            { icon: Brain, label: "Background tasks" },
            { icon: Zap, label: "General knowledges" },
            { icon: Cpu, label: "My automations" },
            { icon: Users, label: "Public automations" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="chat-history-item w-full"
              onClick={() => {}}
              aria-label={label}
            >
              <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="sg-separator mx-3" />

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-2">
          <div
            className="px-2 pb-1 text-xs font-semibold flex items-center justify-between"
            style={{ color: "var(--text-muted)" }}
          >
            <span>CAD Agent Chats</span>
            <button
              className="sg-btn-ghost p-0.5 rounded"
              onClick={onNewChat}
              aria-label="New chat"
              title="New Chat"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {sessions.length === 0 ? (
            <p className="px-2 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
              No chats yet
            </p>
          ) : (
            <div className="space-y-0.5">
              {[...sessions].reverse().map((session) => (
                <div
                  key={session.id}
                  className={`chat-history-item group ${activeSessionId === session.id ? "active" : ""}`}
                  onClick={() => onSwitchSession(session.id)}
                >
                  <MessageSquare
                    className="w-3.5 h-3.5 flex-shrink-0"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <span className="flex-1 truncate text-xs">{session.title}</span>
                  <button
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteSession(session.id)
                    }}
                    aria-label="Delete chat"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" style={{ color: "var(--offline)" }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sg-separator mx-3" />

        {/* Background Tasks Section */}
        <div className="px-2 pb-3">
          <div className="flex items-center justify-between px-2 pb-1">
            <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
              Background Tasks
            </span>
            <button className="sg-btn-ghost p-0.5 rounded" aria-label="Refresh tasks">
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <p className="px-2 text-xs" style={{ color: "var(--text-muted)" }}>
            No tasks yet
          </p>
        </div>
      </aside>
    </>
  )
}
