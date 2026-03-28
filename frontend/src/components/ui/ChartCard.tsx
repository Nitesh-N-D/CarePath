import type { ReactNode } from "react";

import GlassCard from "./GlassCard";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <GlassCard className="relative overflow-hidden p-5 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-[rgba(223,238,232,0.76)] via-transparent to-[rgba(214,176,132,0.18)] dark:from-[rgba(34,211,238,0.08)] dark:to-[rgba(15,118,110,0.08)]" />
      <div className="relative">
        <div className="inline-flex rounded-full border border-borderLight bg-card/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-soft)] shadow-sm dark:border-borderDark dark:bg-cardDark/80">
          Trend View
        </div>
        <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--color-text)]">{title}</h3>
        {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-soft)]">{subtitle}</p> : null}
      </div>
      <div className="relative mt-6 h-72">{children}</div>
    </GlassCard>
  );
}

export default ChartCard;
