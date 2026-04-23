"use client";

import React, { useState, useEffect } from "react";
import Modal, { fieldLabel, fieldInput, primaryButton, secondaryButton } from "@/components/ui/Modal";
import { api } from "@/lib/api";
import { Interview } from "@/types";
import { Star } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  interview: Interview | null;
}

export default function CompleteInterviewModal({ open, onClose, onSaved, interview }: Props) {
  const [rating, setRating] = useState<number>(4);
  const [insight, setInsight] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) { setRating(4); setInsight(""); setError(""); }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interview) return;
    setError("");
    setSaving(true);
    try {
      await api.patch(`/interviews/${interview.id}/complete`, { rating, ai_insight: insight || null });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Mark Interview Complete" subtitle={interview ? `${interview.candidate_name} · ${interview.role}` : ""} width={520}>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={fieldLabel}>Rating</label>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button type="button" key={n} onClick={() => setRating(n)} style={{ background: "none", border: "none", padding: 2, cursor: "pointer" }}>
                <Star size={28} style={{ color: n <= rating ? "#fbbf24" : "var(--text-muted)", fill: n <= rating ? "#fbbf24" : "none" }} />
              </button>
            ))}
            <span style={{ marginLeft: 10, fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{rating}.0</span>
          </div>
        </div>
        <div>
          <label style={fieldLabel}>AI Insight / Feedback Notes</label>
          <textarea
            style={{ ...fieldInput, minHeight: 120, resize: "vertical", fontFamily: "inherit" }}
            value={insight} onChange={(e) => setInsight(e.target.value)}
            placeholder="Strong coding fundamentals. Good communication. Recommend next round..."
          />
        </div>

        {error && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(251,113,133,0.1)", border: "1px solid rgba(251,113,133,0.2)", color: "#fb7185", fontSize: 12 }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" onClick={onClose} style={secondaryButton}>Cancel</button>
          <button type="submit" disabled={saving} style={{ ...primaryButton, opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Saving..." : "Complete Interview"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
