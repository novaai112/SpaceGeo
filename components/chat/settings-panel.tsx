"use client"

import { X, ChevronDown, Check, ExternalLink, User, Mail, BarChart3, LogOut } from "lucide-react"
import { CAD_SOFTWARE_LIST, type CADSoftware } from "@/lib/cad-software"
import { useState } from "react"
import { useTheme } from "@/lib/theme-context"

interface SettingsPanelProps {
  activeTab: "general" | "account"
  onTabChange: (tab: "general" | "account") => void
  onClose: () => void
  selectedCAD: CADSoftware
  onCADChange: (cad: CADSoftware) => void
  dailyUsage: { used: number; limit: number }
}

function CADIcon({ cad, size = 20 }: { cad: CADSoftware; size?: number }) {
  return (
    <div
      className="cad-icon flex-shrink-0"
      style={{ width: size, height: size, background: cad.color, fontSize: size * 0.38 }}
    >
      {cad.icon}
    </div>
  )
}

export function SettingsPanel({
  activeTab,
  onTabChange,
  onClose,
  selectedCAD,
  onCADChange,
  dailyUsage,
}: SettingsPanelProps) {
  const [cadDropOpen, setCadDropOpen] = useState(false)
  const { isDark, toggleTheme } = useTheme()

  const usagePct = Math.round((dailyUsage.used / dailyUsage.limit) * 100)
  const nextMonday = () => {
    const d = new Date()
    const diff = (7 - d.getDay() + 1) % 7 || 7
    d.setDate(d.getDate() + diff)
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
        style={{ background: "transparent" }}
      />

      {/* Panel */}
      <div
        className="settings-panel fixed right-0 top-0 h-full z-50 flex flex-col slide-in-right overflow-y-auto"
        style={{ width: 300 }}
        role="dialog"
        aria-label="Settings"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 h-12 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border-color)" }}
        >
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Settings
          </span>
          <button className="sg-btn-ghost p-1 rounded" onClick={onClose} aria-label="Close settings">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex border-b"
          style={{ borderColor: "var(--border-color)" }}
        >
          <button
            className={`settings-tab flex-1 text-center ${activeTab === "general" ? "active" : ""}`}
            onClick={() => onTabChange("general")}
          >
            General
          </button>
          <button
            className={`settings-tab flex-1 text-center ${activeTab === "account" ? "active" : ""}`}
            onClick={() => onTabChange("account")}
          >
            Account
          </button>
        </div>

        {/* General Tab */}
        {activeTab === "general" && (
          <div className="p-5 space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                General Settings
              </h3>

              {/* Language */}
              <div className="mb-4">
                <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Language
                </label>
                <div
                  className="sg-input flex items-center justify-between cursor-pointer"
                  style={{ padding: "8px 12px" }}
                >
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>English</span>
                  <ChevronDown className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                </div>
              </div>

              {/* Dark Mode Toggle */}
              <div className="mb-4">
                <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Theme
                </label>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                    {isDark ? "Dark Mode" : "Light Mode"}
                  </span>
                  <button
                    className={`theme-toggle ${isDark ? "dark-active" : ""}`}
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  >
                    <div className="theme-toggle-knob" />
                  </button>
                </div>
              </div>

              {/* CAD Software */}
              <div className="mb-4">
                <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  CAD Software
                </label>
                <div className="relative">
                  <button
                    className="w-full flex items-center gap-2 p-2.5 rounded-lg text-sm"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                    onClick={() => setCadDropOpen((v) => !v)}
                  >
                    <CADIcon cad={selectedCAD} size={22} />
                    <span className="flex-1 text-left">{selectedCAD.displayName}</span>
                    <ChevronDown className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                  </button>

                  {cadDropOpen && (
                    <div
                      className="absolute top-full left-0 right-0 mt-1 fade-in z-50 rounded-xl py-2"
                      style={{
                        background: "var(--background)",
                        border: "1px solid var(--border-color)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                      }}
                    >
                      {CAD_SOFTWARE_LIST.map((cad) => (
                        <button
                          key={cad.id}
                          className="cad-dropdown-item w-full text-left"
                          onClick={() => {
                            onCADChange(cad)
                            setCadDropOpen(false)
                          }}
                        >
                          <CADIcon cad={cad} size={22} />
                          <span className="text-sm flex-1" style={{ color: "var(--text-primary)" }}>
                            {cad.displayName}
                          </span>
                          {selectedCAD.id === cad.id && (
                            <Check className="w-3.5 h-3.5" style={{ color: "var(--brand-primary)" }} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Agent Execution */}
              <div className="mb-4">
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>
                  Agent execution in {selectedCAD.displayName}
                </label>
                <p className="text-xs mb-2" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
                  What the agent may do to your open documents during a turn. Read only keeps
                  inspection and blocks edits with safety checks, but it is not a sandbox.
                </p>
                <div
                  className="sg-input flex items-center justify-between cursor-pointer"
                  style={{ padding: "8px 12px" }}
                >
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                    Ask first: approve each execution in a d…
                  </span>
                  <ChevronDown className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                </div>
              </div>

              {/* Connection Info */}
              <div
                className="rounded-lg p-3"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <p className="text-xs font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                  Connection Method
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {selectedCAD.connectionMethod}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  Script: {selectedCAD.scriptLanguage} • Files: {selectedCAD.fileExtensions.join(", ")}
                </p>
              </div>
            </div>

            <div
              className="text-xs text-center"
              style={{ color: "var(--text-muted)" }}
            >
              Version 2.0.1 · SpaceGeo AI
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="p-5 space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                Account Settings
              </h3>

              {/* Name */}
              <div className="mb-4">
                <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Name
                </label>
                <input
                  className="sg-input"
                  defaultValue="Dinesh Kumar"
                  readOnly
                  aria-label="Name"
                />
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Email
                </label>
                <input
                  className="sg-input"
                  defaultValue="dineshkumar2729305@gmail.com"
                  readOnly
                  aria-label="Email"
                />
              </div>

              {/* Weekly Usage */}
              <div className="mb-6">
                <label className="text-xs font-medium block mb-3" style={{ color: "var(--text-secondary)" }}>
                  Weekly usage
                </label>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Plan usage limit
                  </span>
                  <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                    {usagePct}%
                  </span>
                </div>
                <div className="progress-bar-track mb-1.5">
                  <div className="progress-bar-fill" style={{ width: `${usagePct}%` }} />
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Resets on {nextMonday()}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  Agent runs, background tasks and completed drawing tasks share your weekly allowance.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
                aria-label="Dashboard"
              >
                Dashboard
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            <div
              className="text-xs text-center"
              style={{ color: "var(--text-muted)" }}
            >
              Version 2.0.1 · SpaceGeo AI
            </div>
          </div>
        )}
      </div>
    </>
  )
}
