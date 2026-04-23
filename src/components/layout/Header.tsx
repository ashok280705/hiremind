"use client";

import React from "react";
import { Search, Bell } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header
      style={{
        height: 70,
        borderBottom: "1px solid var(--border-color)",
        background: "var(--bg-secondary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      <div>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            placeholder="Search anything..."
            style={{
              width: 220,
              paddingLeft: 34,
              paddingRight: 16,
              paddingTop: 8,
              paddingBottom: 8,
              borderRadius: 10,
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              fontSize: 13,
              color: "var(--text-primary)",
              outline: "none",
            }}
          />
        </div>

        {/* Notifications */}
        <button
          style={{
            position: "relative",
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            cursor: "pointer",
          }}
        >
          <Bell size={16} />
          <span
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "var(--accent-violet)",
              color: "#fff",
              fontSize: 9,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            3
          </span>
        </button>
      </div>
    </header>
  );
}
