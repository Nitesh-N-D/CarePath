import GlassCard from "./GlassCard";

interface StatCardProps {
  label: string;
  value: string;
  detail: string;
  accent?: "indigo" | "cyan" | "red" | "yellow";
}

const accentMap = {
  indigo: "from-[rgba(37,48,53,0.06)] via-[rgba(255,255,255,0.88)] to-[rgba(166,124,82,0.08)] text-slate-700",
  cyan: "from-[rgba(49,88,79,0.08)] via-[rgba(255,255,255,0.92)] to-[rgba(143,194,176,0.16)] text-slate-700",
  red: "from-[rgba(168,98,79,0.08)] via-[rgba(255,255,255,0.92)] to-[rgba(199,166,129,0.12)] text-slate-700",
  yellow: "from-[rgba(166,124,82,0.1)] via-[rgba(255,255,255,0.92)] to-[rgba(214,176,132,0.12)] text-slate-700",
};

function StatCard({ label, value, detail, accent = "indigo" }: StatCardProps) {
  return (
    <GlassCard className="group relative overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
      <div className={`absolute inset-0 bg-gradient-to-br opacity-95 ${accentMap[accent]}`} />
      <div className="absolute right-3 top-3 h-16 w-16 rounded-full bg-white/60 blur-2xl" />
      <div className="relative">
        <p className="text-sm font-medium text-[var(--color-text-soft)]">{label}</p>
        <div className="mt-4 text-3xl font-semibold text-[var(--color-text)]">{value}</div>
        <p className="mt-2 text-sm text-[var(--color-text-soft)]">{detail}</p>
      </div>
    </GlassCard>
  );
}

export default StatCard;
