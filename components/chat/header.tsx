"use client"

import { useState, useRef, useEffect } from "react"
import { Menu, RefreshCw, Sun, Moon, Settings, ChevronDown, Check } from "lucide-react"
import { CAD_SOFTWARE_LIST, type CADSoftware } from "@/lib/cad-software"
import { useTheme } from "@/lib/theme-context"

interface HeaderProps {
  onMenuClick: () => void
  onSettingsClick: (tab?: "general" | "account") => void
  selectedCAD: CADSoftware
  onCADChange: (cad: CADSoftware) => void
  cadStatus: "checking" | "online" | "offline"
  onRefreshConnection: () => void
  usagePct: number
  dailyUsage: { used: number; limit: number }
  usagePopupOpen: boolean
  onToggleUsagePopup: () => void
}

function CADIcon({ cad, size = 20 }: { cad: CADSoftware; size?: number }) {
  return (
    <div
      className="cad-icon flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: cad.color,
        fontSize: size * 0.38,
      }}
      title={cad.displayName}
    >
      {cad.icon}
    </div>
  )
}

export function Header({
  onMenuClick,
  onSettingsClick,
  selectedCAD,
  onCADChange,
  cadStatus,
  onRefreshConnection,
  usagePct,
  dailyUsage,
  usagePopupOpen,
  onToggleUsagePopup,
}: HeaderProps) {
  const { isDark, toggleTheme } = useTheme()
  const [cadDropdownOpen, setCadDropdownOpen] = useState(false)
  const cadRef = useRef<HTMLDivElement>(null)
  const usageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cadRef.current && !cadRef.current.contains(e.target as Node)) {
        setCadDropdownOpen(false)
      }
      if (usageRef.current && !usageRef.current.contains(e.target as Node)) {
        // close handled by parent toggle
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const tooltipClass =
    "absolute -bottom-8 left-1/2 -translate-x-1/2 bg-[var(--surface-3)] text-[var(--text-primary)] border border-[var(--border-color)] rounded px-2 py-0.5 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none"

  // Reset date for usage
  const nextMonday = () => {
    const d = new Date()
    const day = d.getDay()
    const diff = (7 - day + 1) % 7 || 7
    d.setDate(d.getDate() + diff)
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  }

  return (
    <header
      className="sg-header flex items-center px-3 h-12 gap-2 z-30 relative flex-shrink-0"
      style={{ minHeight: 48 }}
    >
      {/* ── Left: Menu + CAD icons ── */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Menu */}
        <button
          className="sg-btn-icon group relative"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* CAD Connect Icon */}
        <div className="relative" ref={cadRef}>
          <button
            className="sg-btn-icon group relative"
            onClick={() => setCadDropdownOpen((v) => !v)}
            aria-label="Select CAD software"
            title="Select CAD Software"
            style={{ borderColor: cadDropdownOpen ? "var(--brand-primary)" : undefined }}
          >
            <CADIcon cad={selectedCAD} size={18} />
          </button>

          {/* CAD Dropdown */}
          {cadDropdownOpen && (
            <div
              className="absolute top-full left-0 mt-1 fade-in z-50 rounded-xl py-2 min-w-[200px]"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border-color)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              }}
            >
              <div
                className="px-3 pb-2 text-xs font-semibold"
                style={{ color: "var(--text-muted)" }}
              >
                CAD Software
              </div>
              {CAD_SOFTWARE_LIST.map((cad) => (
                <button
                  key={cad.id}
                  className="cad-dropdown-item w-full text-left"
                  style={
                    selectedCAD.id === cad.id
                      ? { background: "var(--brand-subtle)", borderColor: "var(--brand-glow)" }
                      : {}
                  }
                  onClick={() => {
                    onCADChange(cad)
                    setCadDropdownOpen(false)
                  }}
                >
                  <CADIcon cad={cad} size={24} />
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

        {/* Connection refresh */}
        <button
          className="sg-btn-icon group relative"
          onClick={onRefreshConnection}
          aria-label="Refresh CAD connection"
          title="Refresh Connection"
        >
          <RefreshCw
            className={`w-4 h-4 ${cadStatus === "checking" ? "animate-spin" : ""}`}
            style={{ color: cadStatus === "online" ? "var(--online)" : undefined }}
          />
        </button>
      </div>

      {/* ── Center: Logo / Brand ── */}
      <div className="flex-1 flex justify-center items-center">
        <div className="flex items-center gap-2">
          {/* SpaceGeo Logo */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="var(--brand-primary)" />
            <path d="M2 17l10 5 10-5" stroke="var(--brand-primary)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M2 12l10 5 10-5" stroke="var(--brand-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          </svg>
          <span
            className="text-sm font-semibold hidden sm:inline"
            style={{ color: "var(--text-primary)" }}
          >
            SpaceGeo AI
          </span>
        </div>
      </div>

      {/* ── Right: Controls ── */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Dark Mode Toggle */}
        <button
          className="sg-btn-icon group relative"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <Sun className="w-4 h-4" style={{ color: "var(--brand-primary)" }} />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {/* Settings */}
        <button
          className="sg-btn-icon group relative"
          onClick={() => onSettingsClick("general")}
          aria-label="Settings"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Usage / Status indicator */}
        <div className="relative" ref={usageRef}>
          <button
            className="flex items-center justify-center w-8 h-8 rounded-full border text-xs font-semibold transition-colors"
            style={{
              background: cadStatus === "online" ? "rgba(34,197,94,0.1)" : "var(--surface-2)",
              borderColor: cadStatus === "online" ? "var(--online)" : "var(--border-color)",
              color: "var(--text-primary)",
            }}
            onClick={onToggleUsagePopup}
            aria-label="View usage"
            title="View plan usage"
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: cadStatus === "online" ? "var(--online)" : "var(--offline)",
              }}
            />
          </button>

          {/* Usage Popup */}
          {usagePopupOpen && (
            <div className="usage-popup absolute top-full right-0 mt-1 fade-in z-50 min-w-[240px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                  Plan usage limit
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {usagePct}%
                </span>
              </div>
              <div className="progress-bar-track mb-2">
                <div className="progress-bar-fill" style={{ width: `${usagePct}%` }} />
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Resets on {nextMonday()}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {dailyUsage.used} / {dailyUsage.limit} requests used today
              </p>
            </div>
          )}
        </div>

        {/* Account Avatar */}
        <button
          className="sg-avatar text-xs"
          onClick={() => onSettingsClick("account")}
          aria-label="Account settings"
          title="Account"
        >
          D
        </button>
      </div>
    </header>
  )
}
