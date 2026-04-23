"use client";

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import { Bell, Palette, Check } from "lucide-react";

const DEFAULT_PREFS = {
  notif_new_applications: true,
  notif_interview_reminders: true,
  notif_bias_alerts: true,
  notif_weekly_summary: false,
  notif_system_updates: false,
};

type PrefsKey = keyof typeof DEFAULT_PREFS;

const sections = [
  { id: "notifications", icon: Bell, label: "Notifications" },
  { id: "appearance", icon: Palette, label: "Appearance" },
] as const;

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<(typeof sections)[number]["id"]>("notifications");
  const [prefs, setPrefs] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_PREFS;
    try {
      const raw = localStorage.getItem("hm_settings");
      return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key: PrefsKey) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    localStorage.setItem("hm_settings", JSON.stringify(next));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const notifItems: { key: PrefsKey; label: string; desc: string }[] = [
    { key: "notif_new_applications", label: "New candidate applications", desc: "Get notified when a new candidate applies" },
    { key: "notif_interview_reminders", label: "Interview reminders", desc: "Receive reminders before scheduled interviews" },
    { key: "notif_bias_alerts", label: "Bias detection alerts", desc: "AI-detected potential bias in screening" },
    { key: "notif_weekly_summary", label: "Weekly summary reports", desc: "Get a weekly recruitment digest" },
    { key: "notif_system_updates", label: "System updates", desc: "Updates about platform features and changes" },
  ];

  return (
    <>
      <Header title="Settings" subtitle="Manage your account and preferences" />
      <main style={{ padding: 32, display: "flex", gap: 24 }}>
        <div style={{ width: 220, flexShrink: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {sections.map((s) => {
              const Icon = s.icon;
              const active = activeSection === s.id;
              return (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", borderRadius: 12,
                    fontSize: 14, fontWeight: active ? 600 : 500,
                    color: active ? "var(--text-primary)" : "var(--text-secondary)",
                    background: active ? "var(--bg-elevated)" : "transparent",
                    border: "none", cursor: "pointer",
                    textAlign: "left", width: "100%",
                  }}>
                  <Icon size={18} />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {activeSection === "notifications" && (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 28, maxWidth: 700 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Notification Preferences</h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Saved locally in your browser.</p>
                </div>
                {saved && (
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#34d399", fontWeight: 600 }}>
                    <Check size={14} /> Saved
                  </span>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {notifItems.map((n) => (
                  <div key={n.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{n.label}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{n.desc}</div>
                    </div>
                    <button onClick={() => toggle(n.key)}
                      style={{
                        width: 44, height: 24, borderRadius: 12, border: "none",
                        padding: 0,
                        background: prefs[n.key] ? "var(--accent-violet)" : "var(--bg-elevated)",
                        position: "relative", cursor: "pointer", transition: "all 0.2s",
                      }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%", background: "#fff",
                        position: "absolute", top: 3, left: prefs[n.key] ? 23 : 3,
                        transition: "left 0.2s",
                      }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "appearance" && (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 28, maxWidth: 700 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Appearance</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
                HireMind currently uses a single dark theme optimized for long recruiter sessions.
              </p>
              <div style={{ padding: 20, borderRadius: 12, background: "var(--bg-primary)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #8b5cf6, #22d3ee)" }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Violet Dark (active)</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>Default theme · cannot be changed</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
