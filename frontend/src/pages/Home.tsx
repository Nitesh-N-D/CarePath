import { useEffect, useState } from "react";
import API from "../services/api";
import SearchBar from "../components/SearchBar";
import DiseaseCard from "../components/DiseaseCard";
import type { Disease, SearchResponse } from "../types/disease";

function Home() {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
const [bodySystem, setBodySystem] = useState<string>("");
const [category, setCategory] = useState<string>("");
const [sort, setSort] = useState<string>("relevance");
const [totalResults, setTotalResults] = useState<number>(0);
  const fetchDiseases = async (pageNumber = 1) => {
    try {
      setLoading(true);
      setError("");

const res = await API.get<SearchResponse>(
  `/diseases/search?page=${pageNumber}&limit=5&body_system=${bodySystem}&category=${category}&sort=${sort}`
);
      setDiseases(res.data.results);
      setTotalPages(res.data.totalPages);
      setTotalResults(res.data.totalResults);
    } catch (err) {
      setError("Failed to fetch diseases.");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  fetchDiseases(page);
}, [page, bodySystem, category, sort]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">
        Medical Disease Encyclopedia
      </h1>

      <SearchBar setDiseases={setDiseases} />
<div className="flex gap-4 mt-4">
  <select
    value={bodySystem}
    onChange={(e) => setBodySystem(e.target.value)}
    className="border p-2 rounded"
  >
    <option value="">All Body Systems</option>
    <option value="Respiratory">Respiratory</option>
    <option value="Cardiovascular">Cardiovascular</option>
    <option value="Endocrine">Endocrine</option>
    <option value="Neurological">Neurological</option>
  </select>

  <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="border p-2 rounded"
  >
    <option value="">All Categories</option>
    <option value="Infectious">Infectious</option>
    <option value="Chronic">Chronic</option>
    <option value="Genetic">Genetic</option>
    <option value="Autoimmune">Autoimmune</option>
  </select>

  <button
    onClick={() => fetchDiseases(1)}
    className="bg-blue-600 text-white px-4 rounded"
  >
    Apply Filters
  </button>
  <button
  onClick={() => {
    setBodySystem("");
    setCategory("");
    setSort("relevance");
    setPage(1);
  }}
  className="bg-gray-400 text-white px-4 rounded"
>
  Clear
</button>
  <div className="flex justify-between items-center mt-4">
  <p className="text-gray-600">
    Showing {diseases.length} of {totalResults} results
  </p>

  <select
    value={sort}
    onChange={(e) => setSort(e.target.value)}
    className="border p-2 rounded"
  >
    <option value="relevance">Relevance</option>
    <option value="newest">Newest</option>
  </select>
</div>
</div>
      {loading && <p className="mt-4 text-blue-500">Loading...</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}

      <div className="mt-6 space-y-4">
        {diseases.map((disease) => (
          <DiseaseCard key={disease.id} disease={disease} />
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Home;