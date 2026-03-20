import { useEffect, useState } from "react";

import DiseaseCard from "../components/DiseaseCard";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import SearchBar from "../components/SearchBar";
import ErrorState from "../components/ui/ErrorState";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import type { Disease, SearchResponse } from "../types/disease";

function FeatureIcon({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} shadow-[0_12px_24px_rgba(15,23,42,0.08)]`}>
      {children}
    </div>
  );
}

const pillars = [
  {
    title: "Disease Encyclopedia",
    copy: "Structured condition pages with overview, causes, symptoms, diagnosis, treatment, prevention, and emergency warning signs.",
    tone: "from-cyan-100 to-sky-50",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7 text-cyan-900" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 4h8a4 4 0 0 1 4 4v12H10a4 4 0 0 0-4 4V4Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 8h4M10 12h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "AI Health Assistant",
    copy: "A carefully positioned health assistant for education, symptom explanation, and lifestyle guidance with strong disclaimers.",
    tone: "from-violet-100 to-fuchsia-50",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7 text-violet-900" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3a7 7 0 0 0-4 12.7V19a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3.3A7 7 0 0 0 12 3Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 22h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Pandemic Intelligence",
    copy: "A timeline and response analysis area covering major outbreaks, public health measures, and lessons learned.",
    tone: "from-rose-100 to-orange-50",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7 text-rose-900" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="7" />
        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Personal Monitoring",
    copy: "Weight, blood pressure, sugar, sleep, risk summaries, and visual progress tracking for everyday health management.",
    tone: "from-emerald-100 to-teal-50",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7 text-emerald-900" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 12h3l2-5 4 10 2-5h5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const designGoals = [
  "Structured clinical content rather than generic blog-style pages",
  "Clear disclaimers for AI guidance instead of diagnostic claims",
  "Visual health tracking with summaries, alerts, and reports",
  "Educational public health and pandemic intelligence modules",
];

function Home() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetchDiseases("");
  }, []);

  const fetchDiseases = async (nextQuery: string) => {
    setLoading(true);
    setError("");
    setQuery(nextQuery);

    try {
      const response = await API.get<SearchResponse>("/diseases/search", {
        params: { q: nextQuery || undefined, limit: 6 },
      });
      setDiseases(response.data.results);
    } catch (requestError) {
      console.error(requestError);
      setError("Disease knowledge is temporarily unavailable. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  };

  const workspacePath = user
    ? user.role === "admin"
      ? "/admin"
      : user.role === "doctor"
        ? "/doctor"
        : "/dashboard"
    : "/register";

  return (
    <div className="space-y-16">
      <section id="platform" className="relative grid items-center gap-10 overflow-hidden pt-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="premium-orb left-[-6rem] top-[-3rem] h-40 w-40 bg-cyan-200/60" />
        <div className="premium-orb right-[-4rem] top-12 h-44 w-44 bg-fuchsia-200/40" />
        <div>
          <Badge tone="accent">AI-powered health knowledge and monitoring platform</Badge>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight text-slate-900 md:text-7xl">
            A structured medical platform built around <span className="gradient-text">knowledge, monitoring, and guidance</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            CarePath combines a disease encyclopedia, AI health assistant, pandemic intelligence, and personal health tracking into one professional product experience.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button to={workspacePath} variant="default" className="rounded-2xl px-5 py-3">
              Open CarePath
            </Button>
            <Button to="/#knowledge" variant="outline" className="rounded-2xl px-5 py-3">
              Explore disease library
            </Button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Core pillars", value: "4 integrated modules" },
              { label: "Health inputs", value: "Weight, BP, sugar, sleep" },
              { label: "Knowledge format", value: "Structured clinical pages" },
            ].map((metric) => (
              <GlassCard key={metric.label} className="p-4">
                <p className="text-sm text-slate-500">{metric.label}</p>
                <div className="mt-2 text-lg font-semibold text-slate-900">{metric.value}</div>
              </GlassCard>
            ))}
          </div>
        </div>

        <div className="dark-panel relative overflow-hidden p-6">
          <div className="premium-orb right-0 top-0 h-28 w-28 bg-cyan-400/20" />
          <div className="premium-orb bottom-0 left-10 h-28 w-28 bg-fuchsia-400/15" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">Product blueprint</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">What makes CarePath different</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
              Placement-ready scope
            </div>
          </div>

          <div className="relative mt-6 space-y-3">
            {designGoals.map((item) => (
              <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-slate-200">
                {item}
              </div>
            ))}
          </div>

          <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
            {[
              { label: "Clinical pages", value: "Overview to emergency signs" },
              { label: "Guided monitoring", value: "Daily logs, alerts, and reports" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{item.label}</p>
                <p className="mt-2 text-base font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="space-y-6">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-800">Product pillars</p>
          <h2 className="mt-3 text-4xl font-semibold text-slate-900">The platform is organized around four clear healthcare modules.</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {pillars.map((pillar) => (
            <GlassCard key={pillar.title} className="relative overflow-hidden p-6">
              <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-white/30 blur-2xl" />
              <FeatureIcon tone={pillar.tone}>{pillar.icon}</FeatureIcon>
              <h3 className="mt-5 text-xl font-semibold text-slate-900">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{pillar.copy}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section id="knowledge" className="space-y-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-800">Disease knowledge</p>
            <h2 className="mt-3 text-4xl font-semibold text-slate-900">Browse clinically structured condition profiles.</h2>
            <p className="mt-3 text-slate-600">
              Every disease card leads into a more structured page with overview, symptoms, diagnosis, treatment, prevention, and warning signs.
            </p>
          </div>
          <div className="w-full max-w-xl">
            <SearchBar defaultValue={query} onSearch={(value) => void fetchDiseases(value)} />
          </div>
        </div>

        {error ? <ErrorState title="Disease search unavailable" message={error} actionLabel="Try again" onAction={() => void fetchDiseases(query)} /> : null}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <LoadingSkeleton key={index} className="h-72" />)
            : diseases.map((disease) => <DiseaseCard key={disease.id} disease={disease} />)}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-8">
          <div className="flex items-center gap-4">
            <FeatureIcon tone="from-violet-100 to-fuchsia-50">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-violet-900" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 3a7 7 0 0 0-4 12.7V19a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3.3A7 7 0 0 0 12 3Z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 22h4" strokeLinecap="round" />
              </svg>
            </FeatureIcon>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-800">AI assistant principles</p>
          </div>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900">Designed for guidance, not diagnosis.</h3>
          <div className="mt-5 space-y-3">
            {[
              "Explains symptoms and medical terms in plain language",
              "Suggests possible condition categories with medical disclaimers",
              "Provides lifestyle and diet guidance without replacing a doctor",
              "Clearly tells users when to consult a licensed physician",
            ].map((item) => (
              <div key={item} className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-8">
          <div className="flex items-center gap-4">
            <FeatureIcon tone="from-cyan-100 to-sky-50">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-cyan-900" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 7h16M7 12h10M9 17h6" strokeLinecap="round" />
              </svg>
            </FeatureIcon>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-800">Implementation roadmap</p>
          </div>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900">A cleaner way to grow the platform.</h3>
          <div className="mt-5 space-y-4">
            {[
              "Phase 1: Disease encyclopedia with structured clinical data",
              "Phase 2: Accounts, health logs, dashboards, and reports",
              "Phase 3: AI assistant with legal disclaimers and source-backed answers",
              "Phase 4: Pandemic timelines, analytics, and health risk scoring",
            ].map((item, index) => (
              <div key={item} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-medium text-white">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-slate-600">{item}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="dark-panel p-8">
          <Badge tone="muted">CarePath experience</Badge>
          <h3 className="mt-4 text-3xl font-semibold text-white">A unified platform for health knowledge, monitoring, and guided care journeys.</h3>
          <p className="mt-4 max-w-2xl text-slate-300">
            Move from learning to tracking with a single product flow built for patients, doctors, and care teams.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button to={workspacePath} variant="default" className="rounded-2xl px-5 py-3">
              Enter CarePath
            </Button>
            <Button to="/login" variant="outline" className="rounded-2xl px-5 py-3">
              Sign in
            </Button>
          </div>
        </div>

        <GlassCard className="p-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-800">Experience goals</p>
          <div className="mt-5 space-y-3">
            {[
              "Responsive layouts for mobile, tablet, laptop, and larger desktop screens",
              "Actionable loading, empty, and error states instead of blank pages",
              "Clear navigation from marketing content into the product workspace",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
    </div>
  );
}

export default Home;
