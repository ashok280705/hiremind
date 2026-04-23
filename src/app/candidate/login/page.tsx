"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Sparkles, Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

function CandidateLoginInner() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/candidate";
  const { login, register, user } = useAuth();

  useEffect(() => {
    if (user?.role === "candidate") router.replace(redirect);
  }, [user, redirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUp) await register(name, email, password, "candidate");
      else await login(email, password, "candidate");
      router.push(redirect);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", paddingLeft: 42, paddingRight: 16, paddingTop: 13, paddingBottom: 13,
    borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border-color)",
    fontSize: 14, color: "var(--text-primary)", outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg-primary)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -200, right: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -300, left: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 60%)", pointerEvents: "none" }} />

      <div style={{ flex: "0 0 480px", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px 56px", background: "var(--bg-secondary)", borderRight: "1px solid var(--border-color)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)`, backgroundSize: "24px 24px", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 64 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--accent-violet)", boxShadow: "0 0 24px rgba(139, 92, 246, 0.3)" }}>
              <Sparkles size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>HireMind</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Candidate Portal</div>
            </div>
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2, letterSpacing: "-0.03em", marginBottom: 20 }}>
            Find your<br />
            <span style={{ color: "#22d3ee" }}>next role</span><br />
            with AI matching.
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 360 }}>
            Create an account to apply to jobs, track your applications, and get instant AI fit scores against every role.
          </p>
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ padding: "18px 22px", borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Demo candidate</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>alex@candidate.ai / password123</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: 8 }}>
            {isSignUp ? "Create Candidate Account" : "Candidate Login"}
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 36 }}>
            {isSignUp ? "Sign up to apply and track your applications." : "Sign in to view your applications."}
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
                  <input type="text" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
                  style={{ ...inputStyle, paddingRight: 48 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex" }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: loading ? "var(--bg-elevated)" : "#22d3ee", color: "#0a0a0f", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: 4, boxShadow: "0 0 20px rgba(34,211,238,0.2)" }}>
              {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginTop: 28 }}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
              style={{ background: "none", border: "none", color: "#22d3ee", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border-color)", textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Are you a recruiter?</p>
            <a href="/login" style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-violet-light)", textDecoration: "none" }}>
              Go to recruiter login →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CandidateLoginPage() {
  return <Suspense fallback={null}><CandidateLoginInner /></Suspense>;
}
