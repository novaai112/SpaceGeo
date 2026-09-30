"use client"

import { useState, useRef, useEffect } from "react"
import { Menu, RefreshCw, Sun, Moon, Settings, ChevronDown, Check } from "lucide-react"
import { CAD_SOFTWARE_LIST, type CADSoftware } from "@/lib/cad-software"
import { useTheme } from "@/lib/theme-context"
import { useLang } from "@/lib/lang-context"

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
      style={{ width: size, height: size, background: cad.color, fontSize: size * 0.38 }}
      title={cad.displayName}
    >
      {cad.icon}
    </div>
  )
}

export function Header({ onMenuClick, onSettingsClick, selectedCAD, onCADChange, cadStatus, onRefreshConnection, usagePct, dailyUsage, usagePopupOpen, onToggleUsagePopup }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme()
  const { t, lang } = useLang()
  const [cadDropdownOpen, setCadDropdownOpen] = useState(false)
  const cadRef = useRef<HTMLDivElement>(null)
  const usageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cadRef.current && !cadRef.current.contains(e.target as Node)) setCadDropdownOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const nextMonday = () => {
    const d = new Date()
    const diff = (7 - d.getDay() + 1) % 7 || 7
    d.setDate(d.getDate() + diff)
    return d.toLocaleDateString(lang, { month: "long", day: "numeric", year: "numeric" })
  }

  return (
    <header className="sg-header flex items-center px-3 h-12 gap-2 z-30 relative flex-shrink-0" style={{ minHeight: 48 }}>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button className="sg-btn-icon" onClick={onMenuClick} aria-label={t.toggleSidebar} title={t.toggleSidebar}>
          <Menu className="w-4 h-4" />
        </button>

        <div className="relative" ref={cadRef}>
          <button
            className="sg-btn-icon"
            onClick={() => setCadDropdownOpen((v) => !v)}
            aria-label={t.selectCAD}
            title={t.selectCAD}
            style={{ borderColor: cadDropdownOpen ? "var(--brand-primary)" : undefined }}
          >
            <CADIcon cad={selectedCAD} size={18} />
          </button>

          {cadDropdownOpen && (
            <div
              className="absolute top-full left-0 mt-1 fade-in z-50 rounded-xl py-2 min-w-[200px]"
              style={{ background: "var(--background)", border: "1px solid var(--border-color)", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}
            >
              <div className="px-3 pb-2 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{t.cadSoftware}</div>
              {CAD_SOFTWARE_LIST.map((cad) => (
                <button
                  key={cad.id}
                  className="cad-dropdown-item w-full text-left"
                  style={selectedCAD.id === cad.id ? { background: "var(--brand-subtle)", borderColor: "var(--brand-glow)" } : {}}
                  onClick={() => { onCADChange(cad); setCadDropdownOpen(false) }}
                >
                  <CADIcon cad={cad} size={24} />
                  <span className="text-sm flex-1" style={{ color: "var(--text-primary)" }}>{cad.displayName}</span>
                  {selectedCAD.id === cad.id && <Check className="w-3.5 h-3.5" style={{ color: "var(--brand-primary)" }} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className="sg-btn-icon"
          onClick={onRefreshConnection}
          aria-label={t.refreshConnection}
          title={t.refreshConnection}
        >
          <RefreshCw
            className={`w-4 h-4 ${cadStatus === "checking" ? "animate-spin" : ""}`}
            style={{ color: cadStatus === "online" ? "var(--online)" : undefined }}
          />
        </button>
      </div>

      <div className="flex-1 flex justify-center items-center">
        <div className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="var(--brand-primary)" />
            <path d="M2 17l10 5 10-5" stroke="var(--brand-primary)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M2 12l10 5 10-5" stroke="var(--brand-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          </svg>
          <span className="text-sm font-semibold hidden sm:inline" style={{ color: "var(--text-primary)" }}>{t.appName}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          className="sg-btn-icon"
          onClick={toggleTheme}
          aria-label={t.toggleDarkMode}
          title={isDark ? t.lightMode : t.darkMode}
        >
          {isDark ? <Sun className="w-4 h-4" style={{ color: "var(--brand-primary)" }} /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          className="sg-btn-icon"
          onClick={() => onSettingsClick("general")}
          aria-label={t.settings}
          title={t.settings}
        >
          <Settings className="w-4 h-4" />
        </button>

        <div className="relative" ref={usageRef}>
          <button
            className="flex items-center justify-center w-8 h-8 rounded-full border transition-colors"
            style={{
              background: cadStatus === "online" ? "rgba(34,197,94,0.1)" : "var(--surface-2)",
              borderColor: cadStatus === "online" ? "var(--online)" : "var(--border-color)",
            }}
            onClick={onToggleUsagePopup}
            aria-label={t.viewUsage}
            title={t.viewUsage}
          >
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: cadStatus === "online" ? "var(--online)" : "var(--offline)" }} />
          </button>

          {usagePopupOpen && (
            <div className="usage-popup absolute top-full right-0 mt-1 fade-in z-50 min-w-[240px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{t.planUsageLimit}</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{usagePct}%</span>
              </div>
              <div className="progress-bar-track mb-2">
                <div className="progress-bar-fill" style={{ width: `${usagePct}%` }} />
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.resetsOn} {nextMonday()}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {dailyUsage.used} / {dailyUsage.limit} requests used today
              </p>
            </div>
          )}
        </div>

        <button
          className="sg-avatar text-xs"
          onClick={() => onSettingsClick("account")}
          aria-label={t.account}
          title={t.account}
        >
          D
        </button>
      </div>
    </header>
  )
}
