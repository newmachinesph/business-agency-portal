"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { User } from "@/lib/types";

export function Avatar({
  user,
  size = 28,
  ring = false,
}: {
  user?: User;
  size?: number;
  ring?: boolean;
}) {
  if (!user) {
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-full border border-dashed border-line text-ink-faint"
        style={{ width: size, height: size, fontSize: size * 0.38 }}
        title="Unassigned"
      >
        ?
      </span>
    );
  }
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${
        ring ? "ring-2 ring-surface" : ""
      }`}
      style={{ width: size, height: size, background: user.color, fontSize: size * 0.38 }}
      title={`${user.name} · ${user.role}`}
    >
      {user.initials}
    </span>
  );
}

export function Chip({
  children,
  color,
  tone = "soft",
}: {
  children: React.ReactNode;
  color?: string;
  tone?: "soft" | "solid" | "outline";
}) {
  const c = color ?? "#8b93a7";
  const style =
    tone === "solid"
      ? { background: c, color: "#fff" }
      : tone === "outline"
        ? { borderColor: c, color: c }
        : { background: `${c}1a`, color: c };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${
        tone === "outline" ? "border" : ""
      }`}
      style={style}
    >
      {children}
    </span>
  );
}

export function Modal({
  open,
  onClose,
  children,
  width = 720,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // AppShell only renders pages after hydration, so document is always available here.
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 backdrop-blur-[2px] sm:p-10"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="pop-in relative w-full rounded-[18px] border border-line bg-surface shadow-[0_24px_60px_-12px_rgba(14,17,22,0.35)]"
        style={{ maxWidth: width }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 rounded-lg p-1.5 text-ink-faint transition hover:bg-line-soft hover:text-ink"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function Progress({ value, color = "#7c5cff" }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line-soft">
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
      />
    </div>
  );
}

export function SectionTitle({
  title,
  hint,
  right,
}: {
  title: string;
  hint?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-[15px] font-semibold tracking-tight text-ink">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-ink-faint">{hint}</p>}
      </div>
      {right}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-dashed border-line px-6 py-10 text-center text-sm text-ink-faint">
      {children}
    </div>
  );
}
