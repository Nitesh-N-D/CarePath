import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import Button from "../components/ui/Button";
import ErrorState from "../components/ui/ErrorState";
import GlassCard from "../components/ui/GlassCard";
import API from "../services/api";
import type { Disease } from "../types/disease";

function toList(value: string[] | string | undefined) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    return value
      .split(/[,.;]\s*/)
      .map((item) => item.trim())
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
    <div className="space-y-6">
      <Button to="/#knowledge" variant="outline" className="rounded-2xl px-4 py-2.5">
        Back to disease library
      </Button>

      <GlassCard className="p-6 sm:p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-sky-700">{disease.body_system}</p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-4xl font-semibold text-slate-900">{disease.name}</h1>
          <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
            {disease.category}
          </span>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {symptoms.map((symptom) => (
            <span key={symptom} className="rounded-full bg-sky-50 px-3 py-1 text-sm text-sky-700">
              {symptom}
            </span>
          ))}
        </div>
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
          <div className="text-sm uppercase tracking-[0.18em] text-slate-500">Clinical overview</div>
          <p className="mt-3 leading-7 text-slate-600">{disease.causes}</p>
        </div>
      </GlassCard>

      <section className="grid gap-6 lg:grid-cols-2">
        {[
          ["Causes", disease.causes],
          ["Diagnosis", disease.diagnosis],
          ["Treatment", disease.treatment],
          ["Prevention", disease.prevention],
        ].map(([title, value]) => (
          <GlassCard key={title} className="p-6">
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            <p className="mt-4 leading-7 text-slate-600">{value}</p>
          </GlassCard>
        ))}
      </section>

      <GlassCard className="p-6">
        <h2 className="text-xl font-semibold text-slate-900">Emergency signs</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {emergencySigns.length ? (
            emergencySigns.map((item) => (
              <div key={item} className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
                {item}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-600">
              No emergency signs listed for this condition.
            </div>
          )}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-xl font-semibold text-slate-900">References</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {sources.length ? (
            sources.map((source) => (
              <span key={source} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
                {source}
              </span>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-600">
              Reference sources were not provided for this entry.
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

export default DiseaseDetail;
