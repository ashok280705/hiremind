"use client";

import React, { useState, useEffect } from "react";
import Modal, { fieldLabel, fieldInput, primaryButton, secondaryButton } from "@/components/ui/Modal";
import { api } from "@/lib/api";
import { Candidate } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  candidate?: Candidate | null;
}

export default function ScheduleInterviewModal({ open, onClose, onSaved, candidate }: Props) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidateId, setCandidateId] = useState<string>("");
  const [role, setRole] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState<"technical" | "behavioral" | "cultural" | "final">("technical");
  const [interviewer, setInterviewer] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setCandidateId(candidate ? String(candidate.id) : "");
    setRole(candidate?.role ?? "");
    setDate(""); setTime(""); setType("technical"); setInterviewer(""); setError("");
    if (!candidate) {
      api.get<{ data: Candidate[] }>("/candidates").then((res) => setCandidates(res.data)).catch(() => {});
    }
  }, [open, candidate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/interviews", {
        candidate_id: Number(candidateId),
        role, date, time, type, interviewer,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Schedule Interview" subtitle="Set up an interview session." width={560}>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={fieldLabel}>Candidate</label>
          {candidate ? (
            <div style={{ ...fieldInput, color: "var(--text-primary)", background: "var(--bg-elevated)" }}>{candidate.name} · {candidate.role}</div>
          ) : (
            <select style={fieldInput} value={candidateId} onChange={(e) => {
              setCandidateId(e.target.value);
              const c = candidates.find((x) => String(x.id) === e.target.value);
              if (c) setRole(c.role);
            }} required>
              <option value="">— Select candidate —</option>
              {candidates.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.role}</option>)}
            </select>
          )}
        </div>
        <div>
          <label style={fieldLabel}>Role</label>
          <input style={fieldInput} value={role} onChange={(e) => setRole(e.target.value)} required />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={fieldLabel}>Date</label>
            <input type="date" style={fieldInput} value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label style={fieldLabel}>Time</label>
            <input style={fieldInput} value={time} onChange={(e) => setTime(e.target.value)} placeholder="10:00 AM" required />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={fieldLabel}>Type</label>
            <select style={fieldInput} value={type} onChange={(e) => setType(e.target.value as typeof type)}>
              <option value="technical">Technical</option>
              <option value="behavioral">Behavioral</option>
              <option value="cultural">Cultural</option>
              <option value="final">Final</option>
            </select>
          </div>
          <div>
            <label style={fieldLabel}>Interviewer</label>
            <input style={fieldInput} value={interviewer} onChange={(e) => setInterviewer(e.target.value)} placeholder="Alex Rivera" required />
          </div>
        </div>

        {error && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(251,113,133,0.1)", border: "1px solid rgba(251,113,133,0.2)", color: "#fb7185", fontSize: 12 }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
          <button type="button" onClick={onClose} style={secondaryButton}>Cancel</button>
          <button type="submit" disabled={saving} style={{ ...primaryButton, opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Scheduling..." : "Schedule"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
