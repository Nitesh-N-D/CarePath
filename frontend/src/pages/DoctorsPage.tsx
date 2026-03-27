import { useEffect, useState } from "react";

import GlassCard from "../components/ui/GlassCard";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import API from "../services/api";
import type { DoctorRecommendation } from "../types/health";

function DoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await API.get<DoctorRecommendation[]>("/health/doctor-recommendations");
        setDoctors(response.data);
      } catch (requestError) {
        console.error(requestError);
      } finally {
        setLoading(false);
      }
    };

    void fetchDoctors();
  }, []);

  return (
    <div className="space-y-8">
      <section className="max-w-3xl">
        <p className="section-heading">Doctors</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">Recommended clinicians and specialists connected to your CarePath record.</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">Find relevant specialists based on your condition history and location so follow-up feels faster and more intentional.</p>
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => <LoadingSkeleton key={index} className="h-56" />)
          : doctors.map((doctor) => (
              <GlassCard key={doctor.id} className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xl font-semibold text-slate-900">{doctor.name}</div>
                    <div className="mt-1 text-sm text-slate-500">{doctor.specialization}</div>
                  </div>
                  <div className="rounded-full bg-cyan-50 px-3 py-1 text-sm text-cyan-700">{doctor.rating}/5</div>
                </div>
                <div className="mt-4 text-sm text-slate-600">{doctor.hospital}</div>
                <div className="mt-2 text-sm text-slate-500">{doctor.location}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {doctor.conditions.map((condition) => (
                    <span key={condition} className="rounded-full border border-[var(--color-border)] bg-white/70 px-3 py-1 text-xs text-[var(--color-text-soft)]">
                      {condition}
                    </span>
                  ))}
                </div>
                <div className="mt-4 text-sm text-slate-600">{doctor.experience_years} years experience · {doctor.contact_phone}</div>
              </GlassCard>
            ))}
      </div>
    </div>
  );
}

export default DoctorsPage;
