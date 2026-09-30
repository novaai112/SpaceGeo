"use client"

import { X, ChevronDown, Check, ExternalLink, LogOut } from "lucide-react"
import { CAD_SOFTWARE_LIST, type CADSoftware } from "@/lib/cad-software"
import { useState, useRef, useEffect } from "react"
import { useTheme } from "@/lib/theme-context"
import { useLang, LANGUAGES } from "@/lib/lang-context"

interface SettingsPanelProps {
  activeTab: "general" | "account"
  onTabChange: (tab: "general" | "account") => void
  onClose: () => void
  selectedCAD: CADSoftware
  onCADChange: (cad: CADSoftware) => void
  dailyUsage: { used: number; limit: number }
  executionMode: string
  onExecutionModeChange: (mode: string) => void
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
  executionMode,
  onExecutionModeChange,
}: SettingsPanelProps) {
  const [cadDropOpen, setCadDropOpen] = useState(false)
  const [langDropOpen, setLangDropOpen] = useState(false)
  const [execDropOpen, setExecDropOpen] = useState(false)
  const { isDark, toggleTheme } = useTheme()
  const { lang, setLang, t, currentLang } = useLang()
  const langRef = useRef<HTMLDivElement>(null)
  const execRef = useRef<HTMLDivElement>(null)
  const cadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangDropOpen(false)
      if (execRef.current && !execRef.current.contains(e.target as Node)) setExecDropOpen(false)
      if (cadRef.current && !cadRef.current.contains(e.target as Node)) setCadDropOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const usagePct = Math.round((dailyUsage.used / dailyUsage.limit) * 100)

  const nextMonday = () => {
    const d = new Date()
    const diff = (7 - d.getDay() + 1) % 7 || 7
    d.setDate(d.getDate() + diff)
    return d.toLocaleDateString(lang, { month: "long", day: "numeric", year: "numeric" })
  }

  const EXEC_MODES = [
    { id: "read-only", label: t.execReadOnly },
    { id: "ask-first", label: t.execAskFirst },
    { id: "always-allow", label: t.execAlwaysAllow },
  ]

  const currentExec = EXEC_MODES.find((m) => m.id === executionMode) || EXEC_MODES[2]

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
      <div
        className="settings-panel fixed right-0 top-0 h-full z-50 flex flex-col slide-in-right overflow-y-auto"
        style={{ width: 300 }}
        role="dialog"
        aria-label={t.settings}
      >
        <div className="flex items-center justify-between px-5 h-12 flex-shrink-0" style={{ borderBottom: "1px solid var(--border-color)" }}>
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.settings}</span>
          <button className="sg-btn-ghost p-1 rounded" onClick={onClose} aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex" style={{ borderBottom: "1px solid var(--border-color)" }}>
          <button className={`settings-tab flex-1 text-center ${activeTab === "general" ? "active" : ""}`} onClick={() => onTabChange("general")}>{t.general}</button>
          <button className={`settings-tab flex-1 text-center ${activeTab === "account" ? "active" : ""}`} onClick={() => onTabChange("account")}>{t.account}</button>
        </div>

        {activeTab === "general" && (
          <div className="p-5 space-y-5 flex-1">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.generalSettings}</h3>

            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>{t.language}</label>
              <div className="relative" ref={langRef}>
                <button
                  className="w-full flex items-center gap-2 p-2.5 rounded-lg text-sm"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                  onClick={() => setLangDropOpen((v) => !v)}
                >
                  <span>{currentLang.flag}</span>
                  <span className="flex-1 text-left">{currentLang.name}</span>
                  <ChevronDown className="w-4 h-4" style={{ color: "var(--text-muted)", transform: langDropOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                </button>
                {langDropOpen && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 fade-in z-[100] rounded-xl py-2"
                    style={{ background: "var(--background)", border: "1px solid var(--border-color)", boxShadow: "0 8px 32px rgba(0,0,0,0.25)", maxHeight: 320, overflowY: "auto" }}
                  >
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[var(--surface-2)] transition-colors"
                        style={{ color: "var(--text-primary)" }}
                        onClick={() => { setLang(l.code as any); setLangDropOpen(false) }}
                      >
                        <span className="text-base">{l.flag}</span>
                        <span className="flex-1 text-left">{l.name}</span>
                        {lang === l.code && <Check className="w-3.5 h-3.5" style={{ color: "var(--brand-primary)" }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>{t.theme}</label>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>{isDark ? t.darkMode : t.lightMode}</span>
                <button className={`theme-toggle ${isDark ? "dark-active" : ""}`} onClick={toggleTheme} aria-label="Toggle theme">
                  <div className="theme-toggle-knob" />
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>{t.cadSoftware}</label>
              <div className="relative" ref={cadRef}>
                <button
                  className="w-full flex items-center gap-2 p-2.5 rounded-lg text-sm"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                  onClick={() => setCadDropOpen((v) => !v)}
                >
                  <CADIcon cad={selectedCAD} size={22} />
                  <span className="flex-1 text-left">{selectedCAD.displayName}</span>
                  <ChevronDown className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                </button>
                {cadDropOpen && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 fade-in z-[100] rounded-xl py-2"
                    style={{ background: "var(--background)", border: "1px solid var(--border-color)", boxShadow: "0 8px 32px rgba(0,0,0,0.25)", maxHeight: 320, overflowY: "auto" }}
                  >
                    {CAD_SOFTWARE_LIST.map((cad) => (
                      <button
                        key={cad.id}
                        className="cad-dropdown-item w-full text-left"
                        onClick={() => { onCADChange(cad); setCadDropOpen(false) }}
                      >
                        <CADIcon cad={cad} size={22} />
                        <span className="text-sm flex-1" style={{ color: "var(--text-primary)" }}>{cad.displayName}</span>
                        {selectedCAD.id === cad.id && <Check className="w-3.5 h-3.5" style={{ color: "var(--brand-primary)" }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>
                {t.agentExecution} {selectedCAD.displayName}
              </label>
              <p className="text-xs mb-2" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>{t.agentDesc}</p>
              <div className="relative" ref={execRef}>
                <button
                  className="w-full flex items-center gap-2 p-2.5 rounded-lg text-sm text-left"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                  onClick={() => setExecDropOpen((v) => !v)}
                >
                  <span className="flex-1 truncate text-xs">{currentExec.label}</span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                </button>
                {execDropOpen && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 fade-in z-[100] rounded-xl py-2"
                    style={{ background: "var(--background)", border: "1px solid var(--border-color)", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}
                  >
                    {EXEC_MODES.map((mode) => (
                      <button
                        key={mode.id}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left hover:bg-[var(--surface-2)] transition-colors"
                        style={{ color: "var(--text-primary)" }}
                        onClick={() => { onExecutionModeChange(mode.id); setExecDropOpen(false) }}
                      >
                        <span className="flex-1">{mode.label}</span>
                        {executionMode === mode.id && <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--brand-primary)" }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div
              className="rounded-lg p-3"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-color)" }}
            >
              <p className="text-xs font-medium mb-1" style={{ color: "var(--text-primary)" }}>{t.connectionMethod}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{selectedCAD.connectionMethod}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Script: {selectedCAD.scriptLanguage} · Files: {selectedCAD.fileExtensions.join(", ")}
              </p>
            </div>

            <div className="text-xs text-center" style={{ color: "var(--text-muted)" }}>{t.version}</div>
          </div>
        )}

        {activeTab === "account" && (
          <div className="p-5 space-y-5 flex-1">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.accountSettings}</h3>

            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>{t.name}</label>
              <input className="sg-input" defaultValue="Dinesh Kumar" readOnly aria-label={t.name} />
            </div>

            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>{t.email}</label>
              <input className="sg-input" defaultValue="dineshkumar2729305@gmail.com" readOnly aria-label={t.email} />
            </div>

            <div>
              <label className="text-xs font-medium block mb-3" style={{ color: "var(--text-secondary)" }}>{t.weeklyUsage}</label>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{t.planUsageLimit}</span>
                <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{usagePct}%</span>
              </div>
              <div className="progress-bar-track mb-1.5">
                <div className="progress-bar-fill" style={{ width: `${usagePct}%` }} />
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.resetsOn} {nextMonday()}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{t.agentRuns}</p>
            </div>

            <div className="flex gap-2">
              <button
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
              >
                <LogOut className="w-4 h-4" />
                {t.logout}
              </button>
              <a
                href="https://nova-analysis.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border-color)", color: "var(--text-primary)", textDecoration: "none" }}
              >
                {t.dashboard}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="text-xs text-center" style={{ color: "var(--text-muted)" }}>{t.version}</div>
          </div>
        )}
      </div>
    </>
  )
}
