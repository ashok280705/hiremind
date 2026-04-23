"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Camera, Briefcase, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { User } from "@/types";

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
  }, [user]);

  const initials = name
    ? name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const dirty = (user && (name !== user.name || email !== user.email));

  const save = async () => {
    if (!dirty) return;
    setSaving(true); setError(""); setSaved(false);
    try {
      const updated = await api.patch<User>("/auth/me", { name, email });
      localStorage.setItem("hm_user", JSON.stringify(updated));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      // trigger refresh of auth state on next mount — for now just reload
      setTimeout(() => window.location.reload(), 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", borderRadius: 10,
    background: "var(--bg-primary)", border: "1px solid var(--border-color)",
    color: "var(--text-primary)", fontSize: 13, outline: "none",
    transition: "border-color 0.2s", boxSizing: "border-box",
  };

  return (
    <>
      <Header title="Profile" subtitle="Manage your personal information" />
      <main style={{ padding: 32, display: "flex", flexDirection: "column", gap: 24, maxWidth: 800 }}>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--accent-violet)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, color: "#fff" }}>
                {initials}
              </div>
              <button style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: "50%", background: "var(--bg-elevated)", border: "2px solid var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}>
                <Camera size={12} />
              </button>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                {user?.name || "—"}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Briefcase size={12} /> Hiring Manager</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Building2 size={12} /> HireMind</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399" }} />
                <span style={{ fontSize: 11, color: "#34d399", fontWeight: 600 }}>Active</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>Account Information</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "var(--accent-violet)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border-color)"; }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "var(--accent-violet)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border-color)"; }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>Role</label>
              <input type="text" value="Hiring Manager" readOnly style={{ ...inputStyle, opacity: 0.6 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>Member Since</label>
              <input type="text" value={user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"} readOnly style={{ ...inputStyle, opacity: 0.6 }} />
            </div>
          </div>

          {saved && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399", fontSize: 13, marginBottom: 16 }}>
              Profile updated successfully.
            </div>
          )}
          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(251,113,133,0.1)", border: "1px solid rgba(251,113,133,0.2)", color: "#fb7185", fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            onClick={save}
            disabled={!dirty || saving}
            style={{
              padding: "10px 24px", borderRadius: 10,
              background: (!dirty || saving) ? "var(--bg-elevated)" : "var(--accent-violet)",
              border: "none", color: "#fff", fontSize: 13, fontWeight: 600,
              cursor: (!dirty || saving) ? "not-allowed" : "pointer",
              opacity: (!dirty || saving) ? 0.6 : 1,
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </main>
    </>
  );
}
