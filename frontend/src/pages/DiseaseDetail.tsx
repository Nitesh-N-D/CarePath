import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import Button from "../components/ui/Button";
import ErrorState from "../components/ui/ErrorState";
import GlassCard from "../components/ui/GlassCard";
import API from "../services/api";
import type { Disease } from "../types/disease";

function toList(value: string[] | string | undefined) {
  if (Array.isArray(value)) {
    return value.map((item) => item.replace(/\s+/g, " ").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      return trimmed
        .slice(1, -1)
        .split(/","|",|","|,/)
        .map((item) => item.replace(/^"+|"+$/g, "").replace(/\\n/g, " ").replace(/\s+/g, " ").trim())
        .filter(Boolean);
    }

    return value
      .split(/[,.;]\s*/)
      .map((item) => item.replace(/\s+/g, " ").trim())
      .filter(Boolean);
  }

  return [];
}

function DiseaseDetail() {
  const { slug } = useParams();
  const [disease, setDisease] = useState<Disease | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDisease = async () => {
      try {
        const response = await API.get<Disease>(`/diseases/${slug}`);
        setDisease(response.data);
      } catch (requestError) {
        console.error(requestError);
        setError("Unable to load this disease profile.");
      }
    };

    void fetchDisease();
  }, [slug]);

  const emergencySigns = useMemo(() => toList(disease?.emergency_signs), [disease]);
  const symptoms = useMemo(() => toList(disease?.symptoms), [disease]);
  const sources = useMemo(() => toList(disease?.sources), [disease]);

  if (error) {
    return <ErrorState title="Disease profile unavailable" message={error} />;
  }

  if (!disease) {
    return <GlassCard className="p-6 text-slate-600">Loading disease profile...</GlassCard>;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button to="/diseases" variant="secondary" className="w-full gap-2 rounded-xl px-4 py-2.5 shadow-sm sm:w-auto">
          <span aria-hidden="true">←</span>
          Back to disease library
        </Button>
        <Button to="/#disease-library" variant="outline" className="w-full gap-2 rounded-xl px-4 py-2.5 sm:w-auto">
          <span aria-hidden="true">Back</span>
          Back to landing page
        </Button>
      </div>

      <GlassCard className="relative overflow-hidden p-5 sm:p-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
        <p className="text-sm uppercase tracking-[0.24em] text-accent">{disease.body_system}</p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-textPrimary dark:text-textDark sm:text-4xl">{disease.name}</h1>
          <span className="w-fit rounded-full border border-borderLight bg-card px-4 py-2 text-sm text-[var(--color-text-soft)] dark:border-borderDark dark:bg-cardDark dark:text-slate-300">
            {disease.category}
          </span>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {symptoms.map((symptom) => (
            <span
              key={symptom}
              className="rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-sm text-primary dark:border-accent/20 dark:bg-accent/10 dark:text-accent"
            >
              {symptom}
            </span>
          ))}
        </div>
        <div className="mt-6 rounded-[1.75rem] border border-borderLight bg-card p-5 shadow-sm dark:border-borderDark dark:bg-cardDark">
          <div className="text-sm uppercase tracking-[0.18em] text-[var(--color-text-soft)]">Clinical overview</div>
          <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{disease.causes}</p>
        </div>
      </GlassCard>

      <section className="grid gap-6 lg:grid-cols-2">
        {[
          ["Causes", disease.causes],
          ["Diagnosis", disease.diagnosis],
          ["Treatment", disease.treatment],
          ["Prevention", disease.prevention],
        ].map(([title, value]) => (
          <GlassCard key={title} className="p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-textPrimary dark:text-textDark">{title}</h2>
            <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">{value}</p>
          </GlassCard>
        ))}
      </section>

      <GlassCard className="p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-textPrimary dark:text-textDark">Emergency signs</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {emergencySigns.length ? (
            emergencySigns.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
              >
                {item}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-borderLight bg-card px-4 py-3 text-slate-600 dark:border-borderDark dark:bg-cardDark dark:text-slate-300">
              No emergency signs listed for this condition.
            </div>
          )}
        </div>
      </GlassCard>

      <GlassCard className="p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-textPrimary dark:text-textDark">References</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {sources.length ? (
            sources.map((source) => (
              <span
                key={source}
                className="rounded-full border border-borderLight bg-card px-4 py-2 text-sm text-slate-600 dark:border-borderDark dark:bg-cardDark dark:text-slate-300"
              >
                {source}
              </span>
            ))
          ) : (
            <div className="rounded-2xl border border-borderLight bg-card px-4 py-3 text-slate-600 dark:border-borderDark dark:bg-cardDark dark:text-slate-300">
              Reference sources were not provided for this entry.
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

export default DiseaseDetail;
