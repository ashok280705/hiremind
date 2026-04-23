"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon: React.ReactNode;
  color: string;
}

export default function StatCard({ title, value, trend, trendLabel, icon, color }: StatCardProps) {
  const isPositive = (trend ?? 0) >= 0;

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        borderRadius: 16,
        padding: "22px 24px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: "var(--text-primary)",
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6, fontWeight: 500 }}>
          {title}
        </div>
        {trend !== undefined && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              fontWeight: 600,
              marginTop: 8,
              color: isPositive ? "var(--accent-emerald)" : "var(--accent-rose)",
            }}
          >
            {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {isPositive ? "+" : ""}{trend}%
            {trendLabel && (
              <span style={{ color: "var(--text-muted)", fontWeight: 400, marginLeft: 2 }}>
                {trendLabel}
              </span>
            )}
          </div>
        )}
      </div>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          background: `${color}15`,
          color,
        }}
      >
        {icon}
      </div>
    </div>
  );
}
