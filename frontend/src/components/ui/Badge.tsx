import type { HTMLAttributes, ReactNode } from "react";

type BadgeTone = "default" | "accent" | "muted";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: BadgeTone;
}

function toneClassName(tone: BadgeTone) {
  switch (tone) {
    case "accent":
      return "border-[rgba(49,88,79,0.18)] bg-[rgba(223,238,232,0.8)] text-[var(--color-accent)]";
    case "muted":
      return "border-[rgba(123,97,71,0.14)] bg-[rgba(255,248,240,0.7)] text-[var(--color-text-soft)]";
    default:
      return "border-[rgba(123,97,71,0.14)] bg-[rgba(255,255,255,0.8)] text-[var(--color-text)]";
  }
}

function Badge({ children, className = "", tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] ${toneClassName(
        tone
      )} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
