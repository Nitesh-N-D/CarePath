import { useEffect, useMemo, useState } from "react";

import DiseaseCard from "../components/DiseaseCard";
import SearchBar from "../components/SearchBar";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import type { Disease, SearchResponse } from "../types/disease";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import ErrorState from "../components/ui/ErrorState";
import GlassCard from "../components/ui/GlassCard";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";

interface FilterResponse {
  bodySystems: string[];
  categories: string[];
}

function FeatureIcon({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <div
      className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} shadow-[0_12px_24px_rgba(15,23,42,0.08)]`}
    >
      {children}
    </div>
  );
}

const pillars = [
  {
    title: "Structured Disease Encyclopedia",
    copy: "Searchable condition cards and detail pages with symptoms, causes, treatments, prevention, and emergency signs.",
    tone: "from-cyan-100 to-sky-50",
  },
  {
    title: "AI Health Guidance",
    copy: "Context-aware assistant responses grounded in profile data, risk signals, and clear medical disclaimers.",
    tone: "from-violet-100 to-fuchsia-50",
  },
  {
    title: "Health Analytics",
    copy: "Risk scoring, charts, weekly reports, prediction signals, and recruiter-ready health tracking dashboards.",
    tone: "from-amber-100 to-orange-50",
  },
  {
    title: "Connected Care Workflows",
    copy: "Doctor recommendations, medication reminders, clinician notes, and role-based admin operations.",
    tone: "from-emerald-100 to-teal-50",
  },
];

function Home() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [bodySystem, setBodySystem] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterResponse>({ bodySystems: [], categories: [] });
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [error, setError] = useState("");

  const workspacePath = useMemo(() => {
    if (!user) {
      return "/register";
    }

    if (user.role === "admin") {
      return "/admin";
    }

    if (user.role === "doctor") {
      return "/doctor";
    }

    return "/dashboard";
  }, [user]);

  const fetchDiseases = async (nextQuery = query, nextBodySystem = bodySystem, nextCategory = category) => {
    setLoading(true);
    setError("");
    setQuery(nextQuery);
    setBodySystem(nextBodySystem);
    setCategory(nextCategory);

    try {
      const response = await API.get<SearchResponse>("/diseases/search", {
        params: {
          q: nextQuery || undefined,
          body_system: nextBodySystem || undefined,
          category: nextCategory || undefined,
          limit: 6,
        },
      });
      setDiseases(response.data.results);
    } catch (requestError) {
      console.error(requestError);
      setError("Disease knowledge is temporarily unavailable. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const response = await API.get<FilterResponse>("/diseases/filters");
        setFilters(response.data);
      } catch (requestError) {
        console.error(requestError);
      }
      setLoading(true);
      try {
        const response = await API.get<SearchResponse>("/diseases/search", { params: { limit: 6 } });
        setDiseases(response.data.results);
      } catch (requestError) {
        console.error(requestError);
        setError("Disease knowledge is temporarily unavailable. Please try again shortly.");
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, []);

  return (
    <div className="space-y-16">
      <section id="platform" className="relative grid items-center gap-10 overflow-hidden pt-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="premium-orb left-[-6rem] top-[-3rem] h-40 w-40 bg-cyan-200/60" />
        <div className="premium-orb right-[-4rem] top-12 h-44 w-44 bg-fuchsia-200/40" />
        <div>
          <Badge tone="accent">Production-grade healthcare SaaS workspace</Badge>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight text-slate-900 md:text-7xl">
            One premium health platform for <span className="gradient-text">monitoring, knowledge, AI guidance, and care operations</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            CarePath combines disease search, profile-driven analytics, AI assistance, doctor routing, and medication reminders in a clean recruiter-level product experience.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button to={workspacePath} variant="default" className="rounded-2xl px-5 py-3">
              Open Workspace
            </Button>
            <Button to="/#knowledge" variant="outline" className="rounded-2xl px-5 py-3">
              Explore disease library
            </Button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Knowledge Base", value: "Static DB + filters" },
              { label: "Health Tracking", value: "BMI, BP, sugar, sleep" },
              { label: "Ops Layer", value: "AI, reminders, doctor routing" },
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
          <p className="text-sm text-slate-300">Deployment-ready scope</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Built to impress recruiters and still hold up in production.</h2>

          <div className="mt-6 grid gap-3">
            {[
              "Patient dashboard with live metrics, weekly insights, and exportable PDF reports",
              "Role-based doctor and admin surfaces with assignment and note workflows",
              "LLM-ready AI assistant with local Ollama or API-based provider configuration",
              "Reminders, notifications, and doctor recommendation engine backed by persistent storage",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="space-y-6">
        <div className="max-w-3xl">
          <p className="section-heading">Platform pillars</p>
          <h2 className="mt-3 text-4xl font-semibold text-slate-900">Everything requested in the healthcare roadmap now lives in one cohesive product system.</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {pillars.map((pillar) => (
            <GlassCard key={pillar.title} className="relative overflow-hidden p-6">
              <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-white/30 blur-2xl" />
              <FeatureIcon tone={pillar.tone}>
                <span className="text-lg font-semibold text-slate-900">{pillar.title.slice(0, 2)}</span>
              </FeatureIcon>
              <h3 className="mt-5 text-xl font-semibold text-slate-900">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{pillar.copy}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section id="knowledge" className="space-y-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="section-heading">Disease knowledge</p>
            <h2 className="mt-3 text-4xl font-semibold text-slate-900">Search the encyclopedia with body-system and category filters.</h2>
            <p className="mt-3 text-slate-600">
              Each result links into a cleaner medical detail page with treatment, prevention, and emergency signs.
            </p>
          </div>
          <div className="w-full max-w-2xl">
            <SearchBar defaultValue={query} onSearch={(value) => void fetchDiseases(value, bodySystem, category)}>
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={bodySystem}
                  onChange={(event) => void fetchDiseases(query, event.target.value, category)}
                  className="rounded-2xl border border-white/80 bg-white/95 px-4 py-3 text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.05)] focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                >
                  <option value="">All body systems</option>
                  {filters.bodySystems.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <select
                  value={category}
                  onChange={(event) => void fetchDiseases(query, bodySystem, event.target.value)}
                  className="rounded-2xl border border-white/80 bg-white/95 px-4 py-3 text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.05)] focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                >
                  <option value="">All categories</option>
                  {filters.categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </SearchBar>
          </div>
        </div>

        {error ? (
          <ErrorState title="Disease search unavailable" message={error} actionLabel="Try again" onAction={() => void fetchDiseases(query, bodySystem, category)} />
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <LoadingSkeleton key={index} className="h-72" />)
            : diseases.map((disease) => <DiseaseCard key={disease.id} disease={disease} />)}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-8">
          <p className="section-heading">Product maturity</p>
          <div className="mt-5 space-y-3">
            {[
              "Persistent profile storage for age, gender, weight, height, location, chronic conditions, and medications",
              "Risk scoring engine for BP, BMI, sugar, and sleep with real-time alerts",
              "Weekly health report summaries with exportable PDF reporting",
              "Medication reminders and doctor recommendation engine with persistent records",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-8">
          <p className="section-heading">UX quality bar</p>
          <div className="mt-5 space-y-3">
            {[
              "Responsive dashboard layout with empty, loading, and error states",
              "Clean card system, premium shadows, rounded 2xl surfaces, and calmer charts",
              "Dark mode toggle, improved metadata, sitemap, robots file, and deployment-friendly environment config",
              "Role-aware navigation for patients, doctors, and admins",
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
