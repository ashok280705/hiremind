"use client";

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import { Search, Download, Eye, Plus } from "lucide-react";
import { useCandidates } from "@/hooks/useData";
import AddCandidateModal from "@/components/modals/AddCandidateModal";
import CandidateDetailModal from "@/components/modals/CandidateDetailModal";
import ScheduleInterviewModal from "@/components/modals/ScheduleInterviewModal";
import { Candidate } from "@/types";

const statusColors: Record<string, { bg: string; text: string }> = {
  new: { bg: "rgba(96,165,250,0.12)", text: "#60a5fa" },
  screening: { bg: "rgba(251,191,36,0.12)", text: "#fbbf24" },
  interview: { bg: "rgba(139,92,246,0.12)", text: "#a78bfa" },
  offer: { bg: "rgba(34,211,238,0.12)", text: "#22d3ee" },
  hired: { bg: "rgba(52,211,153,0.12)", text: "#34d399" },
  rejected: { bg: "rgba(251,113,133,0.12)", text: "#fb7185" },
};

function toCsv(rows: Candidate[]): string {
  const header = ["id", "name", "email", "role", "experience", "status", "fit_score", "resume_score", "bias_flag", "skills", "applied_date"];
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const body = rows.map((c) => [
    c.id, c.name, c.email, c.role, c.experience ?? "", c.status,
    c.fit_score, c.resume_score, c.bias_flag, c.skills.join("; "), c.applied_date,
  ].map(esc).join(","));
  return [header.join(","), ...body].join("\n");
}

export default function CandidatesPage() {
  const { candidates, loading, error, refetch } = useCandidates();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"fit_score" | "resume_score" | "name">("fit_score");
  const [addOpen, setAddOpen] = useState(false);
  const [detail, setDetail] = useState<Candidate | null>(null);
  const [scheduleFor, setScheduleFor] = useState<Candidate | null>(null);

  const filtered = candidates
    .filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.role.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return (b[sortBy] || 0) - (a[sortBy] || 0);
    });

  const exportCsv = () => {
    const csv = toCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `candidates-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Header title="Candidates" subtitle={`${candidates.length} total candidates in pipeline`} />
      <main style={{ padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 300px", maxWidth: 400 }}>
            <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input type="text" placeholder="Search by name or role..." value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", paddingLeft: 38, paddingRight: 16, paddingTop: 10, paddingBottom: 10, borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border-color)", fontSize: 13, color: "var(--text-primary)", outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "10px 14px", borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border-color)", fontSize: 13, color: "var(--text-secondary)", outline: "none", cursor: "pointer" }}>
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="screening">Screening</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "fit_score" | "resume_score" | "name")}
              style={{ padding: "10px 14px", borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border-color)", fontSize: 13, color: "var(--text-secondary)", outline: "none", cursor: "pointer" }}>
              <option value="fit_score">Sort: Fit Score</option>
              <option value="resume_score">Sort: Resume Score</option>
              <option value="name">Sort: Name</option>
            </select>
            <button onClick={exportCsv} disabled={!filtered.length}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 12, background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: filtered.length ? "pointer" : "not-allowed", opacity: filtered.length ? 1 : 0.5 }}>
              <Download size={14} /> Export
            </button>
            <button onClick={() => setAddOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 12, background: "var(--accent-violet)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 200px 120px 80px 80px 50px", gap: 12, padding: "14px 24px", borderBottom: "1px solid var(--border-color)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
            <span>Candidate</span><span>Skills</span><span>Status</span><span>Resume</span><span>Fit Score</span><span>Action</span>
          </div>

          {loading ? (
            <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading candidates...</div>
          ) : error ? (
            <div style={{ padding: 60, textAlign: "center", color: "#fb7185", fontSize: 13 }}>{error}</div>
          ) : filtered.map((c) => {
            const sc = statusColors[c.status] || statusColors.new;
            const avatar = c.name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
            return (
              <div key={c.id}
                onClick={() => setDetail(c)}
                style={{ display: "grid", gridTemplateColumns: "1fr 200px 120px 80px 80px 50px", gap: 12, alignItems: "center", padding: "16px 24px", borderBottom: "1px solid var(--border-subtle)", cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-card-hover)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0, background: c.fit_score >= 90 ? "#8b5cf6" : c.fit_score >= 80 ? "#22d3ee" : "#60a5fa" }}>
                    {avatar}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.role} · {c.experience}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {c.skills.slice(0, 2).map((s) => (
                    <span key={s} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)", fontWeight: 500 }}>{s}</span>
                  ))}
                  {c.skills.length > 2 && <span style={{ fontSize: 10, color: "var(--text-muted)" }}>+{c.skills.length - 2}</span>}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6, background: sc.bg, color: sc.text, textTransform: "capitalize", display: "inline-block", width: "fit-content" }}>{c.status}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{c.resume_score}</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: c.fit_score >= 90 ? "#34d399" : c.fit_score >= 80 ? "#22d3ee" : "#fbbf24" }}>{c.fit_score}</span>
                <button onClick={(e) => { e.stopPropagation(); setDetail(c); }}
                  style={{ width: 32, height: 32, borderRadius: 8, background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", cursor: "pointer" }}>
                  <Eye size={14} />
                </button>
              </div>
            );
          })}
        </div>

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)", fontSize: 13 }}>No candidates match your filters.</div>
        )}
      </main>

      <AddCandidateModal open={addOpen} onClose={() => setAddOpen(false)} onSaved={refetch} />
      <CandidateDetailModal
        open={!!detail}
        onClose={() => setDetail(null)}
        onChanged={refetch}
        onSchedule={(c) => { setScheduleFor(c); setDetail(null); }}
        candidate={detail}
      />
      <ScheduleInterviewModal
        open={!!scheduleFor}
        onClose={() => setScheduleFor(null)}
        onSaved={refetch}
        candidate={scheduleFor}
      />
    </>
  );
}
