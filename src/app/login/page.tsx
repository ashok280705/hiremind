"use client";

import React, { useState } from "react";
import { Sparkles, Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        await register(name, email, password, "recruiter");
      } else {
        await login(email, password, "recruiter");
      }
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    paddingLeft: 42,
    paddingRight: 16,
    paddingTop: 13,
    paddingBottom: 13,
    borderRadius: 12,
    background: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    fontSize: 14,
    color: "var(--text-primary)",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg-primary)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -200, right: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -300, left: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 60%)", pointerEvents: "none" }} />

      {/* Left Panel */}
      <div style={{ flex: "0 0 480px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px 56px", background: "var(--bg-secondary)", borderRight: "1px solid var(--border-color)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)`, backgroundSize: "24px 24px", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 64 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--accent-violet)", boxShadow: "0 0 24px rgba(139, 92, 246, 0.3)" }}>
              <Sparkles size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>HireMind</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Talent Intelligence</div>
            </div>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2, letterSpacing: "-0.03em", marginBottom: 20 }}>
            AI-Powered<br />
            <span style={{ color: "var(--accent-violet-light)" }}>Recruitment</span><br />
            Intelligence
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 360 }}>
            Screen smarter, hire faster. Leverage AI to find the perfect candidates, detect bias, and predict hiring success.
          </p>
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", gap: 32, marginBottom: 40 }}>
            {[{ value: "94%", label: "Accuracy" }, { value: "3.2x", label: "Faster Hiring" }, { value: "10K+", label: "Candidates" }].map((stat) => (
              <div key={stat.label}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>{stat.label}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: "20px 22px", borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, fontStyle: "italic", marginBottom: 14 }}>
              &ldquo;HireMind reduced our time-to-hire by 60% while improving candidate quality.&rdquo;
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent-emerald)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>SK</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>Sarah Kim</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>VP of Engineering, TechCorp</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: 8 }}>
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 36 }}>
            {isSignUp ? "Start hiring smarter with AI-powered recruitment." : "Sign in to continue to your dashboard."}
          </p>

          {error && (
            <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(251,113,133,0.1)", border: "1px solid rgba(251,113,133,0.2)", color: "#fb7185", fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {isSignUp && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>Full Name</label>
                <div style={{ position: "relative" }}>
                  <User size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = "var(--accent-violet)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "var(--border-color)"; }} />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "var(--accent-violet)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--border-color)"; }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Password</label>
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
                  style={{ ...inputStyle, paddingRight: 48 }}
                  onFocus={(e) => { e.target.style.borderColor = "var(--accent-violet)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--border-color)"; }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex" }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: loading ? "var(--bg-elevated)" : "var(--accent-violet)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: 4, boxShadow: "0 0 20px rgba(139, 92, 246, 0.2)", transition: "all 0.2s" }}>
              {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginTop: 28 }}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
              style={{ background: "none", border: "none", color: "var(--accent-violet-light)", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>

          <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 16 }}>
            Demo: carter@hiremind.ai / password123
          </p>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border-color)", textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Are you a candidate?</p>
            <a href="/candidate/login" style={{ fontSize: 13, fontWeight: 600, color: "#22d3ee", textDecoration: "none" }}>
              Go to candidate portal →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
