"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Briefcase, Video,
  BarChart3, Settings, Sparkles, LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const mainNav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/candidates", label: "Candidates", icon: Users },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/interviews", label: "Interviews", icon: Video },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

const otherNav = [
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <aside
      className={`fixed left-0 top-0 h-screen flex flex-col z-50 transition-all duration-300 ${collapsed ? "w-[76px]" : "w-[270px]"}`}
      style={{ background: "var(--bg-secondary)", borderRight: "1px solid var(--border-color)" }}
    >
      {/* Logo */}
      <div style={{ padding: collapsed ? "28px 16px 32px" : "28px 24px 32px", cursor: "pointer" }} onClick={onToggle}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: 42, height: 42, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "var(--accent-violet)", boxShadow: "0 0 20px rgba(139, 92, 246, 0.25)" }}>
            <Sparkles size={20} color="#fff" />
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", lineHeight: 1 }}>HireMind</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Talent Intelligence</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ margin: collapsed ? "0 12px 20px" : "0 20px 20px", borderTop: "1px solid var(--border-color)" }} />

      {!collapsed && (
        <div style={{ padding: "0 28px", marginBottom: 12, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
          Main Menu
        </div>
      )}

      <nav style={{ padding: collapsed ? "0 10px" : "0 16px", display: "flex", flexDirection: "column", gap: 4 }}>
        {mainNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, fontSize: 15, fontWeight: isActive ? 600 : 500, color: isActive ? "var(--text-primary)" : "var(--text-secondary)", background: isActive ? "var(--bg-elevated)" : "transparent", textDecoration: "none", transition: "all 0.15s ease" }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.color = "var(--text-primary)"; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; } }}
            >
              <Icon size={22} style={{ flexShrink: 0, color: isActive ? "var(--accent-violet-light)" : undefined }} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      {!collapsed && (
        <div style={{ padding: "0 16px", marginBottom: 16 }}>
          <div style={{ padding: "18px 18px", borderRadius: 16, background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(34,211,238,0.04))", border: "1px solid var(--border-color)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <Sparkles size={13} color="var(--accent-violet-light)" /> Candidate Portal
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 12 }}>Share this link so candidates can apply directly.</div>
            <a href="/candidate/login" target="_blank" rel="noopener noreferrer"
              style={{ display: "block", textAlign: "center", padding: "9px 0", borderRadius: 10, border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: 12, fontWeight: 600, cursor: "pointer", textDecoration: "none" }}>
              Open /candidate →
            </a>
          </div>
        </div>
      )}

      {!collapsed && (
        <div style={{ margin: "0 20px 12px", borderTop: "1px solid var(--border-color)", paddingTop: 16 }}>
          <div style={{ padding: "0 8px", marginBottom: 8, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>Other</div>
        </div>
      )}

      <nav style={{ padding: collapsed ? "0 10px" : "0 16px", display: "flex", flexDirection: "column", gap: 2, marginBottom: 8 }}>
        {otherNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 14, fontSize: 14, fontWeight: isActive ? 600 : 500, color: isActive ? "var(--text-primary)" : "var(--text-secondary)", background: isActive ? "var(--bg-elevated)" : "transparent", textDecoration: "none", transition: "all 0.15s ease" }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.color = "var(--text-primary)"; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; } }}
            >
              <Icon size={20} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div style={{ paddingTop: 16, paddingRight: collapsed ? 12 : 16, paddingBottom: 16, paddingLeft: collapsed ? 12 : 16, borderTop: "1px solid var(--border-color)", marginLeft: collapsed ? 8 : 16, marginRight: collapsed ? 8 : 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--accent-violet)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>
              {initials}
            </div>
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: "#34d399", border: "2px solid var(--bg-secondary)" }} />
          </div>
          {!collapsed && (
            <>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.name || "User"}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{user?.email || ""}</div>
              </div>
              <button
                onClick={logout}
                title="Logout"
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", padding: 4, borderRadius: 6 }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#fb7185"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
