"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Sparkles, MapPin, Briefcase, Upload, CheckCircle2, LogOut, FileText, Calendar, Clock, TrendingUp, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import Modal, { primaryButton, secondaryButton } from "@/components/ui/Modal";
import { MyApplication } from "@/types";

interface PublicJob {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string | null;
  skills: string[];
  posted_date: string;
}

const typeColors: Record<string, { bg: string; text: string }> = {
  "full-time": { bg: "rgba(52,211,153,0.12)", text: "#34d399" },
  "part-time": { bg: "rgba(251,191,36,0.12)", text: "#fbbf24" },
  contract: { bg: "rgba(34,211,238,0.12)", text: "#22d3ee" },
  remote: { bg: "rgba(139,92,246,0.12)", text: "#a78bfa" },
};

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  new: { bg: "rgba(96,165,250,0.12)", text: "#60a5fa", label: "Submitted" },
  screening: { bg: "rgba(251,191,36,0.12)", text: "#fbbf24", label: "Screening" },
  interview: { bg: "rgba(139,92,246,0.12)", text: "#a78bfa", label: "Interview Stage" },
  offer: { bg: "rgba(34,211,238,0.12)", text: "#22d3ee", label: "Offer Extended" },
  hired: { bg: "rgba(52,211,153,0.12)", text: "#34d399", label: "Hired" },
  rejected: { bg: "rgba(251,113,133,0.12)", text: "#fb7185", label: "Not Selected" },
};

export default function CandidateHomePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [apps, setApps] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyJob, setApplyJob] = useState<PublicJob | null>(null);
  const [view, setView] = useState<"browse" | "my-apps">("browse");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [j, a] = await Promise.all([
        fetch("/api/v1/public/jobs").then((r) => r.json()),
        api.get<{ data: MyApplication[] }>("/candidate/my-applications"),
      ]);
      setJobs(j.data || []);
      setApps(a.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/candidate/login"); return; }
    if (user.role !== "candidate") { router.replace("/"); return; }
    fetchAll();
  }, [user, authLoading, router, fetchAll]);

  if (authLoading || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #22d3ee", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const appliedJobIds = new Set(apps.map((a) => a.job?.id).filter(Boolean));
  const activeApps = apps.filter((a) => !["hired", "rejected"].includes(a.status));
  const topFit = apps.length > 0 ? Math.max(...apps.map((a) => a.fit_score || 0)) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <header style={{ padding: "20px 48px", borderBottom: "1px solid var(--border-color)", background: "var(--bg-secondary)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--accent-violet)", boxShadow: "0 0 20px rgba(139, 92, 246, 0.2)" }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>HireMind</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Candidate Portal</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{user.name}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{user.email}</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#22d3ee", color: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>
              {user.name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <button onClick={logout} title="Sign out"
              style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border-color)", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 48px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: 6 }}>
            Hello, {user.name.split(" ")[0]}
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>Browse open roles or check the status of your applications.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Active Applications", value: activeApps.length, color: "#22d3ee", icon: <FileText size={20} /> },
            { label: "Total Applications", value: apps.length, color: "#8b5cf6", icon: <Briefcase size={20} /> },
            { label: "Best Fit Score", value: topFit || "—", color: "#34d399", icon: <TrendingUp size={20} /> },
          ].map((s) => (
            <div key={s.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: `${s.color}15`, color: s.color }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 4, width: "fit-content" }}>
          {[
            { id: "browse", label: "Browse Jobs", count: jobs.length },
            { id: "my-apps", label: "My Applications", count: apps.length },
          ].map((t) => (
            <button key={t.id} onClick={() => setView(t.id as typeof view)}
              style={{
                padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                border: "none", cursor: "pointer",
                background: view === t.id ? "var(--bg-elevated)" : "transparent",
                color: view === t.id ? "var(--text-primary)" : "var(--text-secondary)",
                display: "flex", alignItems: "center", gap: 8,
              }}>
              {t.label}
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: view === t.id ? "var(--accent-violet)" : "var(--bg-elevated)", color: view === t.id ? "#fff" : "var(--text-muted)", fontWeight: 700 }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>Loading...</div>
        ) : view === "browse" ? (
          jobs.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)", fontSize: 14, background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border-color)" }}>
              No open positions at the moment.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {jobs.map((job) => {
                const tc = typeColors[job.type] || typeColors["full-time"];
                const applied = appliedJobIds.has(job.id);
                return (
                  <div key={job.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <Briefcase size={14} color="var(--text-muted)" />
                      <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{job.department}</span>
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, letterSpacing: "-0.01em" }}>{job.title}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} />{job.location}</span>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: tc.bg, color: tc.text, fontWeight: 600 }}>{job.type}</span>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 20, minHeight: 24 }}>
                      {job.skills.slice(0, 4).map((s) => (
                        <span key={s} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)", fontWeight: 500 }}>{s}</span>
                      ))}
                      {job.skills.length > 4 && <span style={{ fontSize: 10, color: "var(--text-muted)" }}>+{job.skills.length - 4}</span>}
                    </div>
                    {applied ? (
                      <button disabled
                        style={{ marginTop: "auto", padding: "11px 16px", borderRadius: 10, border: "1px solid rgba(52,211,153,0.25)", background: "rgba(52,211,153,0.08)", color: "#34d399", fontSize: 13, fontWeight: 600, cursor: "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        <CheckCircle2 size={14} /> Applied
                      </button>
                    ) : (
                      <button onClick={() => setApplyJob(job)}
                        style={{ marginTop: "auto", padding: "11px 16px", borderRadius: 10, border: "none", background: "var(--accent-violet)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                        Apply Now
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          apps.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)", fontSize: 14, background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border-color)" }}>
              You haven&apos;t applied to any jobs yet. Browse open roles to get started.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {apps.map((a) => {
                const sc = statusColors[a.status] || statusColors.new;
                return (
                  <div key={a.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, color: "var(--accent-violet-light)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                          {a.job?.department || "—"}
                        </div>
                        <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, letterSpacing: "-0.01em" }}>
                          {a.job?.title || "Role no longer available"}
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12, color: "var(--text-muted)", marginBottom: 14, flexWrap: "wrap" }}>
                          {a.job?.location && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} />{a.job.location}</span>}
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12} />Applied {new Date(a.applied_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          {a.resume_filename && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><FileText size={12} />{a.resume_filename}</span>}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 8, background: sc.bg, color: sc.text, display: "inline-block" }}>
                          {sc.label}
                        </span>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>AI Fit Score</div>
                        <div style={{ fontSize: 36, fontWeight: 800, color: a.fit_score >= 75 ? "#34d399" : a.fit_score >= 50 ? "#22d3ee" : "#fbbf24", lineHeight: 1, marginTop: 4 }}>
                          {a.fit_score}
                        </div>
                      </div>
                    </div>

                    {a.interview && (
                      <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: "var(--bg-primary)", border: "1px solid var(--border-subtle)" }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                          {a.interview.status === "completed" ? "Interview Completed" : "Interview Scheduled"}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 13, color: "var(--text-secondary)", flexWrap: "wrap" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Calendar size={12} />{a.interview.date}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Clock size={12} />{a.interview.time}</span>
                          <span style={{ padding: "2px 8px", borderRadius: 6, background: "var(--bg-elevated)", fontSize: 11, fontWeight: 600, textTransform: "capitalize" }}>{a.interview.type}</span>
                          {a.interview.rating && (
                            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                              <Star size={12} color="#fbbf24" fill="#fbbf24" />
                              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{a.interview.rating}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {a.skills.length > 0 && (
                      <div style={{ marginTop: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {a.skills.slice(0, 8).map((s) => (
                          <span key={s} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)", fontWeight: 500 }}>{s}</span>
                        ))}
                        {a.skills.length > 8 && <span style={{ fontSize: 10, color: "var(--text-muted)" }}>+{a.skills.length - 8}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </main>

      <ApplyModal
        job={applyJob}
        onClose={() => setApplyJob(null)}
        onApplied={() => { setApplyJob(null); fetchAll(); setView("my-apps"); }}
      />
    </div>
  );
}

interface ApplyResult {
  success: boolean;
  fit_score?: number;
  recommendation?: string;
  matched_skills?: string[];
  missing_skills?: string[];
  error?: string;
}

function ApplyModal({ job, onClose, onApplied }: { job: PublicJob | null; onClose: () => void; onApplied: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ApplyResult | null>(null);

  useEffect(() => {
    if (job) { setFile(null); setError(""); setResult(null); }
  }, [job]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !job) return;
    setError(""); setSubmitting(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("job_id", String(job.id));
      const data = await api.postForm<ApplyResult>("/candidate/apply", form);
      if (!data.success) setError(data.error || "Application failed.");
      else setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Application failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={!!job} onClose={onClose} title={result ? "Application Submitted" : "Apply to Role"} subtitle={job ? `${job.title} · ${job.department}` : ""} width={560}>
      {!result ? (
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>Upload Resume (PDF or DOCX)</label>
            <label style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 12, background: "var(--bg-primary)", border: "2px dashed var(--border-color)", cursor: "pointer" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-violet)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-color)"; }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--accent-violet-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {file ? <FileText size={18} color="var(--accent-violet-light)" /> : <Upload size={18} color="var(--accent-violet-light)" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{file ? file.name : "Click to choose a file"}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{file ? `${(file.size / 1024).toFixed(1)} KB` : "PDF or DOCX · Max 10 MB"}</div>
              </div>
              <input type="file" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} style={{ display: "none" }} required />
            </label>
          </div>

          <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
            We&apos;ll instantly parse your resume and compute an AI fit score against the role&apos;s required skills and experience.
          </p>

          {error && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(251,113,133,0.1)", border: "1px solid rgba(251,113,133,0.2)", color: "#fb7185", fontSize: 12 }}>{error}</div>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" onClick={onClose} style={secondaryButton}>Cancel</button>
            <button type="submit" disabled={!file || submitting} style={{ ...primaryButton, opacity: (!file || submitting) ? 0.6 : 1, cursor: (!file || submitting) ? "not-allowed" : "pointer" }}>
              {submitting ? "Analyzing..." : "Submit Application"}
            </button>
          </div>
        </form>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(52,211,153,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <CheckCircle2 size={28} color="#34d399" />
            </div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>Your application was submitted successfully.</p>
          </div>

          <div style={{ padding: 20, borderRadius: 12, background: "var(--bg-primary)", border: "1px solid var(--border-subtle)", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>AI Fit Score</div>
            <div style={{ fontSize: 40, fontWeight: 800, color: (result.fit_score ?? 0) >= 75 ? "#34d399" : (result.fit_score ?? 0) >= 50 ? "#22d3ee" : "#fbbf24", lineHeight: 1 }}>
              {result.fit_score}
            </div>
            <div style={{ marginTop: 6, fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>{result.recommendation}</div>
          </div>

          {result.matched_skills && result.matched_skills.length > 0 && (
            <div style={{ padding: 14, borderRadius: 10, background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.15)" }}>
              <div style={{ fontSize: 11, color: "#34d399", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Matched Skills</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {result.matched_skills.map((s) => (
                  <span key={s} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "rgba(52,211,153,0.1)", color: "#34d399", fontWeight: 600 }}>{s}</span>
                ))}
              </div>
            </div>
          )}
          {result.missing_skills && result.missing_skills.length > 0 && (
            <div style={{ padding: 14, borderRadius: 10, background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.15)" }}>
              <div style={{ fontSize: 11, color: "#fbbf24", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Skills to Strengthen</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {result.missing_skills.map((s) => (
                  <span key={s} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "rgba(251,191,36,0.1)", color: "#fbbf24", fontWeight: 600 }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          <button onClick={onApplied} style={{ ...primaryButton, width: "100%" }}>View My Applications</button>
        </div>
      )}
    </Modal>
  );
}
