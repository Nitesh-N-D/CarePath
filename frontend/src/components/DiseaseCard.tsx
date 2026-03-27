import type { Disease } from "../types/disease";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import GlassCard from "./ui/GlassCard";

interface DiseaseCardProps {
  disease: Disease;
}

function DiseaseCard({ disease }: DiseaseCardProps) {
  const symptomPreview = disease.symptoms.slice(0, 3);
  const iconTone =
    disease.category.toLowerCase() === "infectious"
      ? "from-[rgba(168,98,79,0.18)] to-[rgba(214,176,132,0.16)]"
      : disease.category.toLowerCase() === "chronic"
        ? "from-[rgba(49,88,79,0.18)] to-[rgba(143,194,176,0.14)]"
        : "from-[rgba(68,80,86,0.16)] to-[rgba(166,124,82,0.16)]";

  return (
    <GlassCard className="flex h-full flex-col p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${iconTone}`}>
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-slate-800" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 3v18M3 12h18" strokeLinecap="round" />
              <path d="M7.5 7.5h9v9h-9z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-accent)]">{disease.body_system}</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">{disease.name}</h3>
          </div>
        </div>
        <Badge tone="muted" className="tracking-[0.14em]">
          {disease.category}
        </Badge>
      </div>

      <div className="mt-5 space-y-4">
        <div className="soft-panel p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Overview</p>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{disease.causes}</p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Common Symptoms</p>
          <div className="mt-2 flex min-h-12 flex-wrap gap-2">
            {symptomPreview.map((symptom) => (
              <span key={symptom} className="rounded-full border border-[rgba(49,88,79,0.12)] bg-[rgba(223,238,232,0.72)] px-3 py-1 text-xs text-[var(--color-accent)]">
                {symptom}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-4">
        <Button
          to={`/diseases/${disease.slug}`}
          variant="outline"
          className="rounded-2xl px-4 py-2.5 text-slate-900 hover:text-cyan-700"
        >
          View condition profile
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 10h12M10 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>
      </div>
    </GlassCard>
  );
}

export default DiseaseCard;
