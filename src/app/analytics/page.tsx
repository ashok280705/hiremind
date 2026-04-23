"use client";

import React from "react";
import Header from "@/components/layout/Header";
import { Target, TrendingUp, Shield, Award } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useAnalytics } from "@/hooks/useData";

const tt = { background: "#111116", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#f0f0f3", fontSize: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" };

export default function AnalyticsPage() {
  const { analytics, loading } = useAnalytics();

  const kpi = analytics?.kpi;
  const funnel = analytics?.funnel ?? [];
  const diversity = analytics?.diversity ?? [];
  const predictions = analytics?.predictions ?? [];
  const accuracy = analytics?.accuracy ?? [];

  return (
    <>
      <Header title="Analytics" subtitle="AI-powered recruitment intelligence" />
      <main style={{ padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { icon: <Target size={20} />, label: "Avg. Fit Score", value: loading ? "—" : `${kpi?.avg_fit_score ?? 0}`, color: "#8b5cf6" },
            { icon: <TrendingUp size={20} />, label: "Hire Success Rate", value: loading ? "—" : `${kpi?.hire_success_rate ?? 0}%`, color: "#34d399" },
            { icon: <Shield size={20} />, label: "Bias-Free Score", value: loading ? "—" : `${kpi?.bias_free_score ?? 0}%`, color: "#22d3ee" },
            { icon: <Award size={20} />, label: "Diversity Index", value: loading ? "—" : `${kpi?.diversity_index ?? 0}`, color: "#fbbf24" },
          ].map((m) => (
            <div key={m.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: `${m.color}15`, color: m.color, flexShrink: 0 }}>
                {m.icon}
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{m.value}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{m.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Hiring Funnel</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>Candidates at each stage</p>
            <div style={{ height: 280 }}>
              {loading ? (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnel} barSize={40}>
                    <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="stage" tick={{ fill: "#8a8a98", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#55555f", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={tt} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {funnel.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Diversity Distribution</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>Candidates by diversity score band</p>
            {loading ? (
              <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>
            ) : diversity.length === 0 ? (
              <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>No candidate data yet.</div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
                <div style={{ width: 200, height: 200, flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={diversity} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                        {diversity.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={tt} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
                  {diversity.map((d) => {
                    const total = diversity.reduce((s, x) => s + x.value, 0);
                    const pct = total ? Math.round((d.value / total) * 100) : 0;
                    return (
                      <div key={d.name}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)" }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />{d.name}
                          </span>
                          <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{d.value} · {pct}%</span>
                        </div>
                        <div style={{ height: 4, background: "var(--bg-elevated)", borderRadius: 100, overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 100, width: `${pct}%`, background: d.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Prediction vs Actual</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>AI success prediction vs real hire rate (6 months)</p>
            <div style={{ height: 280 }}>
              {loading ? (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predictions}>
                    <CartesianGrid stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="month" tick={{ fill: "#55555f", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#55555f", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={tt} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "#8a8a98" }} />
                    <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6", r: 4 }} name="Predicted" />
                    <Line type="monotone" dataKey="actual" stroke="#34d399" strokeWidth={2} dot={{ fill: "#34d399", r: 4 }} strokeDasharray="5 3" name="Actual" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>AI Engine Benchmarks</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 24 }}>Live metrics from your pipeline</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {loading ? (
                <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>
              ) : accuracy.map((m) => (
                <div key={m.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                    <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{m.label}</span>
                    <span style={{ fontWeight: 800, color: "var(--text-primary)" }}>{m.value}%</span>
                  </div>
                  <div style={{ height: 6, background: "var(--bg-elevated)", borderRadius: 100, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 100, width: `${Math.min(m.value, 100)}%`, background: m.color, transition: "width 1s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
