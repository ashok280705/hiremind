"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { useAuth } from "@/hooks/useAuth";

const PUBLIC_ROUTES = ["/login", "/candidate/login", "/apply"];
const CANDIDATE_ROUTES = ["/candidate"]; // prefixes

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const isPublic = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
  const isCandidateRoute = CANDIDATE_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
  const isRecruiterRoute = !isPublic && !isCandidateRoute;

  useEffect(() => {
    if (loading) return;
    if (isPublic) return;

    if (!user) {
      const next = isCandidateRoute ? "/candidate/login" : "/login";
      router.replace(next);
      return;
    }

    // Role mismatch — send them to their own area
    if (isRecruiterRoute && user.role === "candidate") {
      router.replace("/candidate");
      return;
    }
    if (isCandidateRoute && user.role === "recruiter") {
      router.replace("/");
      return;
    }
  }, [loading, user, isPublic, isCandidateRoute, isRecruiterRoute, router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--accent-violet)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (isPublic) return <>{children}</>;
  if (!user) return null;

  // Candidate routes have their own chrome (no sidebar)
  if (isCandidateRoute) {
    if (user.role !== "candidate") return null;
    return <>{children}</>;
  }

  // Recruiter shell (sidebar + main content)
  if (user.role !== "recruiter") return null;

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div
        className="shrink-0 transition-all duration-300"
        style={{ width: sidebarCollapsed ? "76px" : "270px" }}
      />
      <div className="flex-1 min-w-0 min-h-screen">
        {children}
      </div>
    </div>
  );
}
