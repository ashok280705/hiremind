"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "blue" | "violet" | "emerald" | "amber" | "rose" | "cyan" | "default";
}

const colors: Record<string, { bg: string; text: string }> = {
  blue: { bg: "rgba(96,165,250,0.12)", text: "#60a5fa" },
  violet: { bg: "rgba(139,92,246,0.12)", text: "#a78bfa" },
  emerald: { bg: "rgba(52,211,153,0.12)", text: "#34d399" },
  amber: { bg: "rgba(251,191,36,0.12)", text: "#fbbf24" },
  rose: { bg: "rgba(251,113,133,0.12)", text: "#fb7185" },
  cyan: { bg: "rgba(34,211,238,0.12)", text: "#22d3ee" },
  default: { bg: "var(--bg-elevated)", text: "var(--text-secondary)" },
};

export default function Badge({ children, variant = "default" }: BadgeProps) {
  const c = colors[variant];
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 6,
        background: c.bg,
        color: c.text,
        display: "inline-block",
      }}
    >
      {children}
    </span>
  );
}
