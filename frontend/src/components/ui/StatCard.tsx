import GlassCard from "./GlassCard";

interface StatCardProps {
  label: string;
  value: string;
  detail: string;
  accent?: "indigo" | "cyan" | "red" | "yellow";
}

const accentMap = {
  indigo: "from-slate-100 via-white to-violet-50 text-slate-700",
  cyan: "from-cyan-50 via-white to-teal-50 text-cyan-800",
  red: "from-rose-50 via-white to-orange-50 text-rose-700",
  yellow: "from-amber-50 via-white to-yellow-50 text-amber-700",
};

function StatCard({ label, value, detail, accent = "indigo" }: StatCardProps) {
  return (
    <GlassCard className="group relative overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
      <div className={`absolute inset-0 bg-gradient-to-br opacity-95 ${accentMap[accent]}`} />
      <div className="absolute right-3 top-3 h-16 w-16 rounded-full bg-white/50 blur-2xl" />
      <div className="relative">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className="mt-4 text-3xl font-semibold text-slate-900">{value}</div>
        <p className="mt-2 text-sm text-slate-600">{detail}</p>
      </div>
    </GlassCard>
  );
}

export default StatCard;
