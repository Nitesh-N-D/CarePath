import { useEffect, useState, type ReactNode } from "react";

import Button from "./ui/Button";

interface SearchBarProps {
  defaultValue?: string;
  onSearch: (value: string) => void;
  children?: ReactNode;
}

function SearchBar({ defaultValue = "", onSearch, children }: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(value);
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search diseases, symptoms, or body systems"
          className="min-w-0 flex-1 rounded-2xl border border-white/80 bg-white/95 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-[0_8px_24px_rgba(15,23,42,0.05)] focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-100"
        />
        <Button type="submit" variant="default" className="rounded-2xl px-5 py-3 font-semibold">
          Search
        </Button>
      </div>
      {children}
    </form>
  );
}

export default SearchBar;
