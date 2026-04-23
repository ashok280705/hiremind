"use client";

import React, { useState } from "react";
import Modal, { primaryButton, secondaryButton, dangerButton } from "@/components/ui/Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "danger" | "primary";
}

export default function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = "Confirm", variant = "primary" }: Props) {
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try { await onConfirm(); onClose(); } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={title} width={440}>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 24 }}>{message}</p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button onClick={onClose} style={secondaryButton}>Cancel</button>
        <button onClick={handle} disabled={loading} style={{ ...(variant === "danger" ? dangerButton : primaryButton), opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Working..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
