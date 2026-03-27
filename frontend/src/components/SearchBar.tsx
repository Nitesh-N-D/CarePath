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
          className="field-shell min-w-0 flex-1 rounded-2xl px-4 py-3 placeholder:text-[var(--color-text-soft)] shadow-[0_8px_24px_rgba(38,31,26,0.05)] focus:border-[rgba(49,88,79,0.4)] focus:outline-none focus:ring-2 focus:ring-[rgba(49,88,79,0.08)]"
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
