import type { ReactNode } from "react";

import GlassCard from "./GlassCard";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <GlassCard className="relative overflow-hidden p-6">
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-[rgba(223,238,232,0.76)] via-transparent to-[rgba(214,176,132,0.18)]" />
      <div>
        <h3 className="text-2xl font-semibold text-[var(--color-text)]">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-[var(--color-text-soft)]">{subtitle}</p> : null}
      </div>
      <div className="relative mt-6 h-72">{children}</div>
    </GlassCard>
  );
}

export default ChartCard;
