"use client";

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import { Star, Sparkles, CalendarCheck, Video, MessageSquare, CheckCircle2, Plus, CheckSquare, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useInterviews } from "@/hooks/useData";
import ScheduleInterviewModal from "@/components/modals/ScheduleInterviewModal";
import CompleteInterviewModal from "@/components/modals/CompleteInterviewModal";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { api } from "@/lib/api";
import { Interview } from "@/types";

const typeColors: Record<string, { bg: string; text: string }> = {
  technical: { bg: "rgba(34,211,238,0.12)", text: "#22d3ee" },
  behavioral: { bg: "rgba(139,92,246,0.12)", text: "#a78bfa" },
  cultural: { bg: "rgba(52,211,153,0.12)", text: "#34d399" },
  final: { bg: "rgba(251,191,36,0.12)", text: "#fbbf24" },
};

export default function InterviewsPage() {
  const { interviews, loading, error, refetch } = useInterviews();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [completeFor, setCompleteFor] = useState<Interview | null>(null);
  const [deleteFor, setDeleteFor] = useState<Interview | null>(null);

  const scheduled = interviews.filter((i) => i.status === "scheduled");
  const completed = interviews.filter((i) => i.status === "completed");
  const avgRating = completed.length > 0
    ? (completed.reduce((s, i) => s + (i.rating || 0), 0) / completed.length).toFixed(1)
    : "—";

  const ratingData = (() => {
    const buckets: Record<string, { sum: number; count: number }> = {};
    for (const i of completed) {
      if (!i.rating) continue;
      const t = i.type;
      buckets[t] = buckets[t] || { sum: 0, count: 0 };
      buckets[t].sum += i.rating;
      buckets[t].count++;
    }
    const rows = ["technical", "behavioral", "cultural", "final"].map((t) => ({
      name: t.charAt(0).toUpperCase() + t.slice(1),
      score: buckets[t] ? Math.round((buckets[t].sum / buckets[t].count) * 10) / 10 : 0,
    }));
    return rows;
  })();

  return (
    <>
      <Header title="Interviews" subtitle={`${interviews.length} total interviews`} />
      <main style={{ padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(200px, 1fr))", gap: 16, flex: 1 }}>
            {[
              { label: "Upcoming", value: scheduled.length, color: "#60a5fa", icon: <CalendarCheck size={20} /> },
              { label: "Completed", value: completed.length, color: "#34d399", icon: <CheckCircle2 size={20} /> },
              { label: "Avg. Rating", value: avgRating, color: "#fbbf24", icon: <Star size={20} /> },
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
          <button onClick={() => setScheduleOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 12, background: "var(--accent-violet)", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 0 20px rgba(139,92,246,0.2)" }}>
            <Plus size={16} /> Schedule Interview
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading interviews...</div>
        ) : error ? (
          <div style={{ padding: 60, textAlign: "center", color: "#fb7185", fontSize: 13 }}>{error}</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <Video size={18} color="#a78bfa" /> Upcoming Interviews
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {scheduled.length === 0 ? (
                    <p style={{ fontSize: 13, color: "var(--text-muted)", padding: 20, textAlign: "center" }}>No upcoming interviews.</p>
                  ) : scheduled.map((iv) => (
                    <div key={iv.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, borderRadius: 12, background: "var(--bg-primary)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0, background: "#8b5cf6" }}>
                        {iv.candidate_avatar}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{iv.candidate_name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{iv.role} · {iv.interviewer}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{iv.date.split("-").slice(1).join("/")}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{iv.time}</div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: typeColors[iv.type]?.bg, color: typeColors[iv.type]?.text }}>
                        {iv.type}
                      </span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setCompleteFor(iv)} title="Mark complete"
                          style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <CheckSquare size={13} />
                        </button>
                        <button onClick={() => setDeleteFor(iv)} title="Cancel"
                          style={{ width: 30, height: 30, borderRadius: 8, background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "#fb7185", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <MessageSquare size={18} color="#22d3ee" /> AI Interview Insights
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {completed.length === 0 ? (
                    <p style={{ fontSize: 13, color: "var(--text-muted)", padding: 20, textAlign: "center" }}>No completed interviews yet.</p>
                  ) : completed.map((iv) => (
                    <div key={iv.id} style={{ padding: 16, borderRadius: 12, background: "var(--bg-primary)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0, background: "#34d399" }}>
                          {iv.candidate_avatar}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{iv.candidate_name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{iv.role}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={14} style={{ color: i < Math.floor(iv.rating || 0) ? "#fbbf24" : "var(--text-muted)", fill: i < Math.floor(iv.rating || 0) ? "#fbbf24" : "none" }} />
                          ))}
                          <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)", marginLeft: 6 }}>{iv.rating}</span>
                        </div>
                      </div>
                      {iv.ai_insight && (
                        <div style={{ display: "flex", gap: 8, padding: 12, borderRadius: 10, background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.08)" }}>
                          <Sparkles size={14} color="#a78bfa" style={{ flexShrink: 0, marginTop: 1 }} />
                          <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>{iv.ai_insight}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Feedback Analytics</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>Average rating by interview type</p>
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ratingData} layout="vertical" barSize={12}>
                      <CartesianGrid stroke="rgba(255,255,255,0.03)" horizontal={false} />
                      <XAxis type="number" domain={[0, 5]} tick={{ fill: "#55555f", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fill: "#8a8a98", fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                      <Tooltip contentStyle={{ background: "#111116", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#f0f0f3", fontSize: 12 }} />
                      <Bar dataKey="score" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Interview Types</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {(["technical", "behavioral", "cultural", "final"] as const).map((type) => {
                    const count = interviews.filter((i) => i.type === type).length;
                    const pct = interviews.length > 0 ? (count / interviews.length) * 100 : 0;
                    return (
                      <div key={type}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                          <span style={{ color: "var(--text-secondary)", textTransform: "capitalize", fontWeight: 500 }}>{type}</span>
                          <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{count}</span>
                        </div>
                        <div style={{ height: 5, background: "var(--bg-elevated)", borderRadius: 100, overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 100, width: `${pct}%`, background: typeColors[type].text }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <ScheduleInterviewModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} onSaved={refetch} />
      <CompleteInterviewModal open={!!completeFor} onClose={() => setCompleteFor(null)} onSaved={refetch} interview={completeFor} />
      <ConfirmModal
        open={!!deleteFor}
        onClose={() => setDeleteFor(null)}
        onConfirm={async () => { if (deleteFor) { await api.delete(`/interviews/${deleteFor.id}`); refetch(); } }}
        title="Cancel interview?"
        message={deleteFor ? `Cancel interview with ${deleteFor.candidate_name}? This will remove it permanently.` : ""}
        confirmLabel="Cancel Interview"
        variant="danger"
      />
    </>
  );
}
