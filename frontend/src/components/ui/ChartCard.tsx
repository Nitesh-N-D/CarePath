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
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-cyan-50/70 via-white/10 to-fuchsia-50/70" />
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      <div className="relative mt-6 h-72">{children}</div>
    </GlassCard>
  );
}

export default ChartCard;
