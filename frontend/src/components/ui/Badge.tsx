import type { HTMLAttributes, ReactNode } from "react";

type BadgeTone = "default" | "accent" | "muted";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: BadgeTone;
}

function toneClassName(tone: BadgeTone) {
  switch (tone) {
    case "accent":
      return "border-cyan-200 bg-cyan-50 text-cyan-900";
    case "muted":
      return "border-stone-200 bg-stone-100 text-slate-600";
    default:
      return "border-slate-200 bg-white text-slate-700";
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
