"use client";

import React from "react";
import Header from "@/components/layout/Header";
import StatCard from "@/components/ui/StatCard";
import { Briefcase, Users, CalendarCheck, UserCheck, AlertTriangle, Sparkles, MoreHorizontal } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useCandidates, useInterviews, useDashboardStats, useAnalytics } from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";

const statusColors: Record<string, string> = {
  new: "#60a5fa", screening: "#fbbf24", interview: "#8b5cf6",
  offer: "#22d3ee", hired: "#34d399", rejected: "#fb7185",
};

const tooltipStyle = {
  background: "#111116", border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12, color: "#f0f0f3", fontSize: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { candidates, loading: cLoading } = useCandidates();
  const { interviews, loading: iLoading } = useInterviews();
  const { stats, loading: sLoading } = useDashboardStats();
  const { analytics, loading: aLoading } = useAnalytics();

  const pipelineData = analytics?.pipeline ?? [];
  const funnelData = analytics?.funnel ?? [];

  const topCandidates = candidates
    .filter((c) => c.status !== "rejected")
    .sort((a, b) => (b.fit_score || 0) - (a.fit_score || 0))
    .slice(0, 5);

  const upcomingInterviews = interviews
    .filter((i) => i.status === "scheduled")
    .slice(0, 4);

  const biasCandidates = candidates.filter((c) => c.bias_flag);

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <>
      <Header title="Dashboard" subtitle="Welcome back! Here's your recruitment overview." />
      <main style={{ padding: 32, display: "flex", flexDirection: "column", gap: 28 }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Welcome back, {firstName}!
          </h2>
          <div style={{ padding: "8px 16px", borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border-color)", fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>

        {/* KPI Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <StatCard title="Active Jobs" value={sLoading ? "—" : stats?.active_jobs ?? 0} icon={<Briefcase size={22} />} color="#8b5cf6" />
          <StatCard title="Total Candidates" value={sLoading ? "—" : stats?.total_candidates ?? 0} icon={<Users size={22} />} color="#22d3ee" />
          <StatCard title="Scheduled Interviews" value={sLoading ? "—" : stats?.scheduled_interviews ?? 0} icon={<CalendarCheck size={22} />} color="#fbbf24" />
          <StatCard title="Hires This Month" value={sLoading ? "—" : stats?.hires_this_month ?? 0} icon={<UserCheck size={22} />} color="#34d399" />
        </div>

        {/* Charts Row */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Candidate Pipeline</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Last 6 months breakdown</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 11, color: "var(--text-muted)" }}>
                {[["#8b5cf6", "Applications"], ["#22d3ee", "Interviewed"], ["#34d399", "Hired"]].map(([color, label]) => (
                  <span key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: color }} /> {label}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ height: 300 }}>
              {aLoading ? (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pipelineData}>
                    <defs>
                      <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} /><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient>
                      <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity={0.15} /><stop offset="100%" stopColor="#22d3ee" stopOpacity={0} /></linearGradient>
                      <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34d399" stopOpacity={0.15} /><stop offset="100%" stopColor="#34d399" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: "#55555f", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#55555f", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="applications" stroke="#8b5cf6" fill="url(#gV)" strokeWidth={2} />
                    <Area type="monotone" dataKey="interviewed" stroke="#22d3ee" fill="url(#gC)" strokeWidth={2} />
                    <Area type="monotone" dataKey="hired" stroke="#34d399" fill="url(#gE)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Hiring Funnel</h3>
              <button style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><MoreHorizontal size={16} /></button>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 24 }}>Current cycle conversion</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {aLoading ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>
              ) : funnelData.length === 0 || funnelData[0].count === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No candidates yet.</div>
              ) : funnelData.map((item, index) => {
                const widthPercent = funnelData[0].count ? (item.count / funnelData[0].count) * 100 : 0;
                const prevCount = index > 0 ? funnelData[index - 1].count : null;
                const convRate = prevCount ? ((item.count / prevCount) * 100).toFixed(0) : null;
                return (
                  <div key={item.stage}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontSize: 13 }}>
                      <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{item.stage}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {convRate && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{convRate}%</span>}
                        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{item.count.toLocaleString()}</span>
                      </div>
                    </div>
                    <div style={{ height: 6, background: "var(--bg-elevated)", borderRadius: 100, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 100, width: `${widthPercent}%`, background: item.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Top Candidates</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Ranked by AI fit score</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 160px 100px 70px", gap: 12, padding: "0 12px 12px", borderBottom: "1px solid var(--border-subtle)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
              <span>#</span><span>Candidate</span><span>Skills</span><span>Status</span><span style={{ textAlign: "right" }}>Score</span>
            </div>
            {cLoading ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>
            ) : topCandidates.map((c, i) => (
              <div key={c.id} style={{ display: "grid", gridTemplateColumns: "36px 1fr 160px 100px 70px", gap: 12, alignItems: "center", padding: "14px 12px", borderBottom: "1px solid var(--border-subtle)", cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-card-hover)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>{i + 1}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0, background: i % 3 === 0 ? "#8b5cf6" : i % 3 === 1 ? "#22d3ee" : "#34d399" }}>
                    {c.avatar}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.role}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {c.skills.slice(0, 2).map((s) => (
                    <span key={s} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)", fontWeight: 500 }}>{s}</span>
                  ))}
                  {c.skills.length > 2 && <span style={{ fontSize: 10, color: "var(--text-muted)" }}>+{c.skills.length - 2}</span>}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6, background: `${statusColors[c.status]}15`, color: statusColors[c.status], textTransform: "capitalize", display: "inline-block" }}>{c.status}</span>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: c.fit_score >= 90 ? "#34d399" : c.fit_score >= 80 ? "#22d3ee" : "#fbbf24" }}>{c.fit_score}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Upcoming</h3>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{upcomingInterviews.length} scheduled</span>
              </div>
              {iLoading ? (
                <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {upcomingInterviews.map((iv) => (
                    <div key={iv.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, background: "var(--bg-primary)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0, background: "#8b5cf6" }}>
                        {iv.candidate_avatar}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{iv.candidate_name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{iv.time} · {iv.date.split("-").slice(1).join("/")}</div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 6, color: iv.type === "technical" ? "#22d3ee" : iv.type === "behavioral" ? "#8b5cf6" : iv.type === "cultural" ? "#34d399" : "#fbbf24", background: iv.type === "technical" ? "rgba(34,211,238,0.1)" : iv.type === "behavioral" ? "rgba(139,92,246,0.1)" : iv.type === "cultural" ? "rgba(52,211,153,0.1)" : "rgba(251,191,36,0.1)" }}>
                        {iv.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {biasCandidates.length > 0 && (
              <div style={{ background: "var(--bg-card)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: 16, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(251,191,36,0.1)" }}>
                    <AlertTriangle size={16} color="#fbbf24" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>Bias Alert</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>AI-detected potential bias</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {biasCandidates.map((c) => (
                    <div key={c.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: 10, borderRadius: 8, background: "rgba(251,191,36,0.04)" }}>
                      <Sparkles size={12} color="#fbbf24" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                        <strong style={{ color: "var(--text-primary)" }}>{c.name}</strong> — scoring may be affected by language pattern bias.
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
