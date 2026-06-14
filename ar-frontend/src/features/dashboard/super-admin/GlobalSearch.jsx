import { useState } from "react";
import { Search } from "lucide-react";

export default function GlobalSearch() {
  const [query, setQuery] = useState("");

  return (
    <div className="relative w-full max-w-md">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search restaurants, models, plans..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}