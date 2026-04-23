"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  width?: number;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, subtitle, width = 520, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: width, maxHeight: "calc(100vh - 40px)",
          background: "var(--bg-card)", border: "1px solid var(--border-color)",
          borderRadius: 18, overflow: "hidden",
          display: "flex", flexDirection: "column",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{
          padding: "22px 26px", borderBottom: "1px solid var(--border-color)",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16,
        }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{title}</h3>
            {subtitle && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close"
            style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
              color: "var(--text-muted)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={15} />
          </button>
        </div>
        <div style={{ padding: 26, overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}

export const fieldLabel: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: "var(--text-secondary)",
  display: "block", marginBottom: 8,
};

export const fieldInput: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 10,
  background: "var(--bg-primary)", border: "1px solid var(--border-color)",
  color: "var(--text-primary)", fontSize: 13, outline: "none",
  boxSizing: "border-box",
};

export const primaryButton: React.CSSProperties = {
  padding: "11px 22px", borderRadius: 10, border: "none",
  background: "var(--accent-violet)", color: "#fff",
  fontSize: 13, fontWeight: 600, cursor: "pointer",
  boxShadow: "0 0 20px rgba(139,92,246,0.18)",
};

export const secondaryButton: React.CSSProperties = {
  padding: "11px 22px", borderRadius: 10,
  background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
  color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer",
};

export const dangerButton: React.CSSProperties = {
  padding: "11px 22px", borderRadius: 10, border: "none",
  background: "rgba(251,113,133,0.18)", color: "#fb7185",
  fontSize: 13, fontWeight: 600, cursor: "pointer",
};
