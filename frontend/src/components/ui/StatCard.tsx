import GlassCard from "./GlassCard";

interface StatCardProps {
  label: string;
  value: string;
  detail: string;
  accent?: "indigo" | "cyan" | "red" | "yellow";
}

const accentMap = {
  indigo: {
    shell: "from-[rgba(37,48,53,0.08)] via-[rgba(255,255,255,0.94)] to-[rgba(166,124,82,0.10)]",
    chip: "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900",
  },
  cyan: {
    shell: "from-[rgba(49,88,79,0.10)] via-[rgba(255,255,255,0.94)] to-[rgba(143,194,176,0.18)]",
    chip: "bg-cyan-500 text-white dark:bg-cyan-400 dark:text-slate-950",
  },
  red: {
    shell: "from-[rgba(168,98,79,0.10)] via-[rgba(255,255,255,0.94)] to-[rgba(199,166,129,0.14)]",
    chip: "bg-rose-500 text-white dark:bg-rose-400 dark:text-slate-950",
  },
  yellow: {
    shell: "from-[rgba(166,124,82,0.12)] via-[rgba(255,255,255,0.94)] to-[rgba(214,176,132,0.16)]",
    chip: "bg-amber-500 text-white dark:bg-amber-400 dark:text-slate-950",
  },
};

function StatCard({ label, value, detail, accent = "indigo" }: StatCardProps) {
  return (
    <GlassCard className="group relative overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.10)] sm:p-6">
      <div className={`absolute inset-0 bg-gradient-to-br opacity-95 ${accentMap[accent].shell}`} />
      <div className="absolute -right-2 top-2 h-20 w-20 rounded-full bg-white/60 blur-2xl dark:bg-white/10" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-soft)]">{label}</p>
          <span className={`inline-flex h-9 min-w-9 items-center justify-center rounded-2xl px-3 text-xs font-semibold shadow-sm ${accentMap[accent].chip}`}>
            {label.slice(0, 1)}
          </span>
        </div>
        <div className="mt-5 text-3xl font-semibold tracking-tight text-[var(--color-text)]">{value}</div>
        <p className="mt-2 max-w-[24ch] text-sm leading-6 text-[var(--color-text-soft)]">{detail}</p>
      </div>
    </GlassCard>
  );
}

export default StatCard;
