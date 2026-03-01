import { useState, useEffect } from "react";
import API from "../services/api";
import type { Disease } from "../types/disease";
import { Link } from "react-router-dom";

interface Props {
  setDiseases: React.Dispatch<React.SetStateAction<Disease[]>>;
}

function SearchBar({ setDiseases }: Props) {
  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<
    { name: string; slug: string }[]
  >([]);

  // Debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.length >= 2) {
        fetchAutocomplete(query);
      } else {
        setSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  const fetchAutocomplete = async (value: string) => {
    const res = await API.get(`/diseases/autocomplete?q=${value}`);
    setSuggestions(res.data);
  };

  const handleSearch = async () => {
    const res = await API.get(`/diseases/search?q=${query}`);
    setDiseases(res.data.results);
    setSuggestions([]);
  };

  return (
    <div className="relative max-w-xl">
      <div className="flex">
        <input
          type="text"
          placeholder="Search disease..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border border-gray-300 p-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 rounded-r-md"
        >
          Search
        </button>
      </div>

      {suggestions.length > 0 && (
        <ul className="absolute bg-white border w-full mt-1 rounded-md shadow-lg z-10">
          {suggestions.map((item) => (
            <li
              key={item.slug}
              className="p-2 hover:bg-blue-100 cursor-pointer"
            >
              <Link to={`/disease/${item.slug}`}>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;