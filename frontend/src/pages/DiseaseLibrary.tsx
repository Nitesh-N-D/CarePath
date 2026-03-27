import axios from "axios";
import { useCallback, useEffect, useState } from "react";

import DiseaseCard from "../components/DiseaseCard";
import SearchBar from "../components/SearchBar";
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
    <div className="space-y-8">
      <section className="max-w-4xl">
        <p className="section-heading">Disease Encyclopedia</p>
        <h1 className="mt-3 text-4xl font-semibold">Search structured condition profiles with symptoms, causes, treatment, and prevention.</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
          The encyclopedia is now a dedicated product area inside CarePath, so users, doctors, and admins can access it directly from the app shell.
        </p>
      </section>

      <GlassCard className="p-6">
        <SearchBar
          defaultValue={query}
          onSearch={(value) => {
            setQuery(value);
            void loadDiseases({ q: value, body_system: bodySystem, category });
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
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
      </GlassCard>

      {error ? <ErrorState title="Disease library unavailable" message={error} actionLabel="Retry" onAction={() => void loadDiseases()} /> : null}

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-72" />
          ))}
        </div>
      ) : results.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {results.map((disease) => (
            <DiseaseCard key={disease.id} disease={disease} />
          ))}
        </div>
      ) : (
        <GlassCard className="p-8 text-center">
          <div className="text-lg font-semibold">No matching conditions found.</div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Try a symptom, body system, or category to explore the encyclopedia.
          </div>
        </GlassCard>
      )}
    </div>
  );
}

export default DiseaseLibrary;
