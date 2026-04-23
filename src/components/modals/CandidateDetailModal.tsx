"use client";

import React, { useState } from "react";
import Modal, { fieldLabel, primaryButton, secondaryButton, dangerButton } from "@/components/ui/Modal";
import { api } from "@/lib/api";
import { Candidate } from "@/types";
import { CalendarPlus, Trash2, Mail, Briefcase, AlertTriangle, FileText, ShieldAlert, ShieldCheck } from "lucide-react";

const STATUSES = ["new", "screening", "interview", "offer", "hired", "rejected"] as const;

const statusColors: Record<string, { bg: string; text: string }> = {
  new: { bg: "rgba(96,165,250,0.12)", text: "#60a5fa" },
  screening: { bg: "rgba(251,191,36,0.12)", text: "#fbbf24" },
  interview: { bg: "rgba(139,92,246,0.12)", text: "#a78bfa" },
  offer: { bg: "rgba(34,211,238,0.12)", text: "#22d3ee" },
  hired: { bg: "rgba(52,211,153,0.12)", text: "#34d399" },
  rejected: { bg: "rgba(251,113,133,0.12)", text: "#fb7185" },
};

interface Props {
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
  onSchedule: (c: Candidate) => void;
  candidate: Candidate | null;
}

export default function CandidateDetailModal({ open, onClose, onChanged, onSchedule, candidate }: Props) {
  const [status, setStatus] = useState<string>(candidate?.status ?? "new");
  const [biasFlag, setBiasFlag] = useState<boolean>(candidate?.bias_flag ?? false);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  React.useEffect(() => {
    if (candidate) { setStatus(candidate.status); setBiasFlag(candidate.bias_flag); }
  }, [candidate]);

  if (!candidate) return null;

  const avatar = candidate.name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
  const sc = statusColors[status] ?? statusColors.new;

  const changeStatus = async (next: string) => {
    if (next === status) return;
    setBusy(true);
    try {
      await api.patch(`/candidates/${candidate.id}/status`, { status: next });
      setStatus(next);
      onChanged();
    } finally { setBusy(false); }
  };

  const toggleBias = async () => {
    setBusy(true);
    try {
      const next = !biasFlag;
      await api.patch(`/candidates/${candidate.id}`, { bias_flag: next });
      setBiasFlag(next);
      onChanged();
    } finally { setBusy(false); }
  };

  const del = async () => {
    setBusy(true);
    try {
      await api.delete(`/candidates/${candidate.id}`);
      onChanged();
      onClose();
    } finally { setBusy(false); setConfirmDelete(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Candidate Profile" width={620}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: candidate.fit_score >= 90 ? "#8b5cf6" : candidate.fit_score >= 80 ? "#22d3ee" : "#60a5fa", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, flexShrink: 0 }}>
            {avatar}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{candidate.name}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Briefcase size={12} /> {candidate.role}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Mail size={12} /> {candidate.email}</span>
              {candidate.experience && <span>· {candidate.experience}</span>}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Fit Score</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: candidate.fit_score >= 90 ? "#34d399" : candidate.fit_score >= 80 ? "#22d3ee" : "#fbbf24" }}>{candidate.fit_score}</div>
          </div>
        </div>

        <div style={{ padding: 14, borderRadius: 12, background: biasFlag ? "rgba(251,191,36,0.06)" : "var(--bg-primary)", border: biasFlag ? "1px solid rgba(251,191,36,0.18)" : "1px solid var(--border-subtle)", display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            {biasFlag ? <AlertTriangle size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: 2 }} /> : <ShieldCheck size={16} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />}
            <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {biasFlag ? (
                <><strong style={{ color: "#fbbf24" }}>Bias flagged:</strong> Manual review recommended before advancing.</>
              ) : (
                <><strong style={{ color: "#34d399" }}>No bias flag:</strong> AI found no bias indicators.</>
              )}
            </div>
          </div>
          <button onClick={toggleBias} disabled={busy}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-secondary)", cursor: busy ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
            <ShieldAlert size={12} /> {biasFlag ? "Clear flag" : "Flag bias"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { label: "Resume Score", value: candidate.resume_score, color: "#22d3ee" },
            { label: "Diversity", value: candidate.diversity_score, color: "#8b5cf6" },
            { label: "Success Predict", value: candidate.success_prediction, color: "#34d399" },
          ].map((m) => (
            <div key={m.label} style={{ padding: 14, borderRadius: 12, background: "var(--bg-primary)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{m.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: m.color, marginTop: 4 }}>{m.value}</div>
            </div>
          ))}
        </div>

        <div>
          <label style={fieldLabel}>Skills</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {candidate.skills.length === 0 && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>No skills recorded.</span>}
            {candidate.skills.map((s) => (
              <span key={s} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)", fontWeight: 500 }}>{s}</span>
            ))}
          </div>
        </div>

        {(candidate as unknown as { resume_filename?: string }).resume_filename && (
          <div style={{ padding: "12px 14px", borderRadius: 10, background: "var(--bg-primary)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 10 }}>
            <FileText size={14} color="var(--accent-violet-light)" />
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Resume: <strong style={{ color: "var(--text-primary)" }}>{(candidate as unknown as { resume_filename: string }).resume_filename}</strong></span>
          </div>
        )}

        <div>
          <label style={fieldLabel}>Pipeline Status</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {STATUSES.map((s) => {
              const active = status === s;
              const c = statusColors[s];
              return (
                <button key={s} onClick={() => changeStatus(s)} disabled={busy}
                  style={{
                    padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: active ? c.bg : "var(--bg-primary)",
                    color: active ? c.text : "var(--text-secondary)",
                    border: active ? `1px solid ${c.text}40` : "1px solid var(--border-subtle)",
                    textTransform: "capitalize", cursor: busy ? "not-allowed" : "pointer",
                  }}>
                  {s}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-muted)" }}>Current: <span style={{ color: sc.text, fontWeight: 600, textTransform: "capitalize" }}>{status}</span></div>
        </div>

        {confirmDelete ? (
          <div style={{ padding: 14, borderRadius: 12, background: "rgba(251,113,133,0.08)", border: "1px solid rgba(251,113,133,0.2)", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 13, color: "var(--text-primary)" }}>Delete this candidate permanently? This cannot be undone.</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmDelete(false)} style={secondaryButton}>Cancel</button>
              <button onClick={del} disabled={busy} style={{ ...dangerButton, opacity: busy ? 0.6 : 1 }}>Delete</button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, paddingTop: 6, borderTop: "1px solid var(--border-subtle)" }}>
            <button onClick={() => setConfirmDelete(true)} style={{ ...secondaryButton, color: "#fb7185", display: "flex", alignItems: "center", gap: 6 }}>
              <Trash2 size={14} /> Delete
            </button>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onClose} style={secondaryButton}>Close</button>
              <button onClick={() => onSchedule(candidate)} style={{ ...primaryButton, display: "flex", alignItems: "center", gap: 6 }}>
                <CalendarPlus size={14} /> Schedule Interview
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
