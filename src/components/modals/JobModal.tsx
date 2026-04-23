"use client";

import React, { useState, useEffect } from "react";
import Modal, { fieldLabel, fieldInput, primaryButton, secondaryButton } from "@/components/ui/Modal";
import { api } from "@/lib/api";
import { Job } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  job?: Job | null;
}

export default function JobModal({ open, onClose, onSaved, job }: Props) {
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<"full-time" | "part-time" | "contract" | "remote">("full-time");
  const [status, setStatus] = useState<"active" | "paused" | "closed">("active");
  const [description, setDescription] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(job?.title ?? "");
      setDepartment(job?.department ?? "");
      setLocation(job?.location ?? "");
      setType(job?.type ?? "full-time");
      setStatus(job?.status ?? "active");
      setDescription(job?.description ?? "");
      setSkillsText((job?.skills ?? []).join(", "));
      setError("");
    }
  }, [open, job]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const skills = skillsText.split(",").map((s) => s.trim()).filter(Boolean);
    const payload = { title, department, location, type, status, description: description || null, skills };
    try {
      if (job) await api.patch(`/jobs/${job.id}`, payload);
      else await api.post("/jobs", payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={job ? "Edit Job" : "Create New Job"} subtitle={job ? "Update the role details." : "Post a new role and start collecting candidates."} width={580}>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={fieldLabel}>Title</label>
          <input style={fieldInput} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Frontend Engineer" required />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={fieldLabel}>Department</label>
            <input style={fieldInput} value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Engineering" required />
          </div>
          <div>
            <label style={fieldLabel}>Location</label>
            <input style={fieldInput} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Remote" required />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={fieldLabel}>Type</label>
            <select style={fieldInput} value={type} onChange={(e) => setType(e.target.value as typeof type)}>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="remote">Remote</option>
            </select>
          </div>
          <div>
            <label style={fieldLabel}>Status</label>
            <select style={fieldInput} value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        <div>
          <label style={fieldLabel}>Required Skills (comma-separated)</label>
          <input style={fieldInput} value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="React, TypeScript, Next.js" />
        </div>
        <div>
          <label style={fieldLabel}>Job Description</label>
          <textarea style={{ ...fieldInput, minHeight: 110, resize: "vertical", fontFamily: "inherit" }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Role responsibilities, required experience, qualifications..." />
        </div>

        {error && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(251,113,133,0.1)", border: "1px solid rgba(251,113,133,0.2)", color: "#fb7185", fontSize: 12 }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
          <button type="button" onClick={onClose} style={secondaryButton}>Cancel</button>
          <button type="submit" disabled={saving} style={{ ...primaryButton, opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Saving..." : job ? "Save Changes" : "Create Job"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
