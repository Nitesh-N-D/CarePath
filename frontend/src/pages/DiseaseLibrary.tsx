import axios from "axios";
import { useCallback, useEffect, useState } from "react";

import DiseaseCard from "../components/DiseaseCard";
import SearchBar from "../components/SearchBar";
import Button from "../components/ui/Button";
import ErrorState from "../components/ui/ErrorState";
import GlassCard from "../components/ui/GlassCard";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import API from "../services/api";
import type { Disease, SearchResponse } from "../types/disease";

interface DiseaseFiltersResponse {
  bodySystems: string[];
  categories: string[];
}

function DiseaseLibrary() {
  const [results, setResults] = useState<Disease[]>([]);
  const [bodySystems, setBodySystems] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [bodySystem, setBodySystem] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDiseases = useCallback(async (params?: { q?: string; body_system?: string; category?: string }) => {
    setLoading(true);
    try {
      const [filterResponse, searchResponse] = await Promise.all([
        API.get<DiseaseFiltersResponse>("/diseases/filters"),
        API.get<SearchResponse>("/diseases/search", {
          params: {
            q: params?.q ?? query,
            body_system: params?.body_system ?? bodySystem,
            category: params?.category ?? category,
            limit: 12,
          },
        }),
      ]);

      setBodySystems(filterResponse.data.bodySystems);
      setCategories(filterResponse.data.categories);
      setResults(searchResponse.data.results);
      setError("");
    } catch (requestError) {
      setError(
        axios.isAxiosError(requestError)
          ? requestError.response?.data?.message || "Unable to load the disease encyclopedia right now."
          : "Unable to load the disease encyclopedia right now."
      );
    } finally {
      setLoading(false);
    }
  }, [bodySystem, category, query]);

  useEffect(() => {
    void loadDiseases();
  }, [loadDiseases]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-8 sm:gap-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-borderLight bg-card/95 px-6 py-7 shadow-[0_30px_80px_rgba(15,23,42,0.08)] dark:border-borderDark dark:bg-cardDark/95 sm:px-8 sm:py-8">
        <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <Button to="/#disease-library" variant="secondary" className="mb-5 w-full gap-2 rounded-xl px-4 py-2.5 shadow-sm sm:w-auto">
              <span aria-hidden="true">←</span>
              Back to landing page
            </Button>
            <p className="section-heading">Disease Encyclopedia</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-textPrimary dark:text-textDark sm:text-4xl xl:text-5xl">
              Search structured condition profiles with symptoms, causes, treatment, and prevention.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
              Explore the CarePath disease reference with faster filters, cleaner summaries, and detailed condition pages designed to be easier to scan and easier to trust.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:min-w-[340px] xl:grid-cols-1">
            <GlassCard className="p-5">
              <div className="text-sm text-slate-500 dark:text-slate-400">Conditions indexed</div>
              <div className="mt-2 text-3xl font-semibold text-textPrimary dark:text-textDark">{results.length || "--"}</div>
            </GlassCard>
            <GlassCard className="p-5">
              <div className="text-sm text-slate-500 dark:text-slate-400">Body systems</div>
              <div className="mt-2 text-3xl font-semibold text-textPrimary dark:text-textDark">{bodySystems.length || "--"}</div>
            </GlassCard>
            <GlassCard className="p-5">
              <div className="text-sm text-slate-500 dark:text-slate-400">Categories</div>
              <div className="mt-2 text-3xl font-semibold text-textPrimary dark:text-textDark">{categories.length || "--"}</div>
            </GlassCard>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-start">
        <GlassCard className="p-6 xl:sticky xl:top-24">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Search and filter</p>
            <h2 className="text-xl font-semibold tracking-tight text-textPrimary dark:text-textDark sm:text-2xl">Find a condition quickly</h2>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              Search by condition name, symptom, body system, or category to narrow the encyclopedia instantly.
            </p>
          </div>

          <div className="mt-6">
            <SearchBar
              defaultValue={query}
              onSearch={(value) => {
                setQuery(value);
                void loadDiseases({ q: value, body_system: bodySystem, category });
              }}
            >
              <div className="grid gap-3">
                <select
                  value={bodySystem}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setBodySystem(nextValue);
                    void loadDiseases({ q: query, body_system: nextValue, category });
                  }}
                  className="field-shell rounded-xl px-4 py-3"
                >
                  <option value="">All body systems</option>
                  {bodySystems.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <select
                  value={category}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setCategory(nextValue);
                    void loadDiseases({ q: query, body_system: bodySystem, category: nextValue });
                  }}
                  className="field-shell rounded-xl px-4 py-3"
                >
                  <option value="">All categories</option>
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </SearchBar>
          </div>
        </GlassCard>

        <div className="space-y-5">
          {error ? <ErrorState title="Disease library unavailable" message={error} actionLabel="Retry" onAction={() => void loadDiseases()} /> : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-soft)]">Results</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-textPrimary dark:text-textDark">
                {loading ? "Loading conditions..." : `${results.length} condition${results.length === 1 ? "" : "s"} available`}
              </h2>
            </div>
            {!loading && (query || bodySystem || category) ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Refine or clear your filters to broaden the results.</p>
            ) : null}
          </div>

          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <LoadingSkeleton key={index} className="h-72" />
              ))}
            </div>
          ) : results.length ? (
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {results.map((disease) => (
                <DiseaseCard key={disease.id} disease={disease} />
              ))}
            </div>
          ) : (
            <GlassCard className="p-8 text-center">
              <div className="text-lg font-semibold text-textPrimary dark:text-textDark">No matching conditions found.</div>
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Try a symptom, body system, or category to explore the encyclopedia.
              </div>
            </GlassCard>
          )}
        </div>
      </section>
    </div>
  );
}

export default DiseaseLibrary;
