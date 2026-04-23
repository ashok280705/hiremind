"use client";

import React, { useState, useEffect } from "react";
import Modal, { fieldLabel, fieldInput, primaryButton, secondaryButton } from "@/components/ui/Modal";
import { api } from "@/lib/api";
import { Job } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function AddCandidateModal({ open, onClose, onSaved }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [jobId, setJobId] = useState<string>("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(""); setEmail(""); setRole(""); setExperience(""); setSkillsText(""); setJobId(""); setError("");
    api.get<{ data: Job[] }>("/jobs").then((res) => setJobs(res.data)).catch(() => {});
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const skills = skillsText.split(",").map((s) => s.trim()).filter(Boolean);
    try {
      await api.post("/candidates", {
        name, email, role: role || (jobs.find((j) => String(j.id) === jobId)?.title ?? "Unassigned"),
        experience: experience || null,
        skills,
        job_id: jobId ? Number(jobId) : null,
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
    <Modal open={open} onClose={onClose} title="Add Candidate" subtitle="Add a candidate manually." width={560}>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={fieldLabel}>Full Name</label>
            <input style={fieldInput} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label style={fieldLabel}>Email</label>
            <input type="email" style={fieldInput} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={fieldLabel}>Role</label>
            <input style={fieldInput} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Senior Frontend Engineer" />
          </div>
          <div>
            <label style={fieldLabel}>Experience</label>
            <input style={fieldInput} value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="5 years" />
          </div>
        </div>
        <div>
          <label style={fieldLabel}>Assign to Job</label>
          <select style={fieldInput} value={jobId} onChange={(e) => setJobId(e.target.value)}>
            <option value="">— None —</option>
            {jobs.map((j) => <option key={j.id} value={j.id}>{j.title} · {j.department}</option>)}
          </select>
        </div>
        <div>
          <label style={fieldLabel}>Skills (comma-separated)</label>
          <input style={fieldInput} value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="React, TypeScript" />
        </div>

        {error && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(251,113,133,0.1)", border: "1px solid rgba(251,113,133,0.2)", color: "#fb7185", fontSize: 12 }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
          <button type="button" onClick={onClose} style={secondaryButton}>Cancel</button>
          <button type="submit" disabled={saving} style={{ ...primaryButton, opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Saving..." : "Add Candidate"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
