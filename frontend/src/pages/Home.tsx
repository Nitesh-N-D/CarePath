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
    title: "Disease Library",
    copy: "Condition pages are written for real use, with symptoms, causes, treatments, prevention, and emergency signs in one place.",
    tone: "from-[rgba(49,88,79,0.16)] to-[rgba(143,194,176,0.18)]",
  },
  {
    title: "Care Guidance",
    copy: "The built-in assistant responds using your profile and health history while keeping medical disclaimers clear and responsible.",
    tone: "from-[rgba(68,80,86,0.16)] to-[rgba(166,124,82,0.16)]",
  },
  {
    title: "Health Journal",
    copy: "Blood pressure, sugar, sleep, weight, BMI, reports, and weekly patterns stay visible in a calmer daily record.",
    tone: "from-[rgba(166,124,82,0.16)] to-[rgba(214,176,132,0.18)]",
  },
  {
    title: "Care Team Tools",
    copy: "Doctor suggestions, medication reminders, clinician notes, and role-based administration are all part of the CarePath experience.",
    tone: "from-[rgba(81,103,95,0.18)] to-[rgba(223,238,232,0.22)]",
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
        <div className="premium-orb left-[-6rem] top-[-3rem] h-40 w-40 bg-[rgba(214,176,132,0.22)]" />
        <div className="premium-orb right-[-4rem] top-12 h-44 w-44 bg-[rgba(143,194,176,0.18)]" />
        <div>
          <Badge tone="accent">CarePath</Badge>
          <h1 className="editorial-title mt-6 max-w-4xl">
            A more refined home for <span className="gradient-text">health records, disease understanding, and everyday care guidance</span>.
          </h1>
          <p className="muted-copy mt-6 max-w-2xl text-lg leading-8">
            CarePath is built for people who want one elegant place to understand symptoms, track personal health, receive thoughtful guidance, and stay organized with care routines.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button to={workspacePath} variant="default" className="rounded-2xl px-5 py-3">
              Enter CarePath
            </Button>
            <Button to="/#knowledge" variant="outline" className="rounded-2xl px-5 py-3">
              Browse conditions
            </Button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Condition Search", value: "Filters by system and category" },
              { label: "Personal Records", value: "BMI, BP, sugar, sleep" },
              { label: "Care Guidance", value: "AI, reminders, doctor support" },
            ].map((metric) => (
              <GlassCard key={metric.label} className="p-4">
                <p className="text-sm text-[var(--color-text-soft)]">{metric.label}</p>
                <div className="mt-2 text-lg font-semibold text-[var(--color-text)]">{metric.value}</div>
              </GlassCard>
            ))}
          </div>
        </div>

        <div className="dark-panel relative overflow-hidden p-6">
          <div className="premium-orb right-0 top-0 h-28 w-28 bg-[rgba(214,176,132,0.16)]" />
          <div className="premium-orb bottom-0 left-10 h-28 w-28 bg-[rgba(143,194,176,0.14)]" />
          <p className="text-sm text-slate-300">What CarePath brings together</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">The entire website is centered on clear, personal, medically aware care support.</h2>

          <div className="mt-6 grid gap-3">
            {[
              "A condition library that is easier to read than scattered health articles",
              "A personal health journal with weekly reporting and exportable summaries",
              "An assistant that answers with awareness of your recorded history",
              "Reminder, recommendation, doctor, and admin areas that support the same care story",
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
          <p className="section-heading">CarePath essentials</p>
          <h2 className="mt-3 text-4xl font-semibold text-slate-900">Every major page now serves the CarePath story instead of talking like a generic software product.</h2>
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
            <h2 className="mt-3 text-4xl font-semibold text-slate-900">Search the CarePath disease library by body system and condition type.</h2>
            <p className="mt-3 text-slate-600">
              Every result opens into a focused medical reference page with prevention, treatment, and warning signs.
            </p>
          </div>
          <div className="w-full max-w-2xl">
            <SearchBar defaultValue={query} onSearch={(value) => void fetchDiseases(value, bodySystem, category)}>
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={bodySystem}
                  onChange={(event) => void fetchDiseases(query, event.target.value, category)}
                  className="field-shell rounded-2xl px-4 py-3 shadow-[0_8px_24px_rgba(38,31,26,0.05)] focus:border-[rgba(49,88,79,0.4)] focus:outline-none focus:ring-2 focus:ring-[rgba(49,88,79,0.08)]"
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
                  className="field-shell rounded-2xl px-4 py-3 shadow-[0_8px_24px_rgba(38,31,26,0.05)] focus:border-[rgba(49,88,79,0.4)] focus:outline-none focus:ring-2 focus:ring-[rgba(49,88,79,0.08)]"
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
          <p className="section-heading">What you can do here</p>
          <div className="mt-5 space-y-3">
            {[
              "Save personal details, medications, and health conditions in one place",
              "Track blood pressure, sugar, sleep, weight, and BMI with clearer summaries",
              "Read weekly health reflections and export them as a polished PDF",
              "Set medication reminders and receive suggested doctors when extra support is needed",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-8">
          <p className="section-heading">How it feels</p>
          <div className="mt-5 space-y-3">
            {[
              "A quieter, more elegant visual tone built specifically for a health-focused website",
              "Responsive layouts with cleaner loading, empty, and error states across every role",
              "A dark mode that now follows the same warm editorial design language as the light theme",
              "Consistent navigation and copy that always feels like CarePath, not a generic SaaS demo",
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
