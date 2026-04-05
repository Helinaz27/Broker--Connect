import { X, Search } from "lucide-react";

interface FilterSectionProps {
  filters: {
    priceRange: [number, number];
    location: string;
    search: string;
    type: "all" | "house" | "car" | "service";
  };
  onFilterChange: (filters: any) => void;
  variant?: "horizontal" | "sidebar";
}

export default function FilterSection({
  filters,
  onFilterChange,
  variant = "sidebar",
}: FilterSectionProps) {
  const handlePriceChange = (value: string) => {
    const [min, max] = value.split("-").map(Number);
    onFilterChange({
      ...filters,
      priceRange: [min, max],
    });
  };

  const handleLocationChange = (location: string) => {
    onFilterChange({
      ...filters,
      location,
    });
  };

  const handleSearchChange = (search: string) => {
    onFilterChange({
      ...filters,
      search,
    });
  };

  const handleTypeChange = (type: "all" | "house" | "car" | "service") => {
    onFilterChange({
      ...filters,
      type,
    });
  };

  const clearFilters = () => {
    onFilterChange({
      priceRange: [0, 100000],
      location: "",
      search: "",
      type: "all",
    });
  };

  const isFiltered = filters.location || filters.priceRange[1] < 100000 || filters.search || filters.type !== "all";

  if (variant === "horizontal") {
    return (
      <div className="flex flex-col lg:flex-row items-end gap-4">
        <div className="w-full lg:flex-[1.5]">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Properties, cars, or services..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="w-full lg:flex-1">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Location</label>
          <input
            type="text"
            placeholder="e.g. Addis Ababa, Bole"
            value={filters.location}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary placeholder:text-muted-foreground"
          />
        </div>
        <div className="w-full lg:w-48">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Price range</label>
          <select
            value={`${filters.priceRange[0]}-${filters.priceRange[1]}`}
            onChange={(e) => handlePriceChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary appearance-none cursor-pointer"
          >
            <option value="0-100000">Any</option>
            <option value="0-1000">Under 1,000 Birr</option>
            <option value="1000-5000">1,000 – 5,000</option>
            <option value="5000-20000">5,000 – 20,000</option>
            <option value="20000-100000">20,000+</option>
          </select>
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto">
          {isFiltered && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-muted/50"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          )}
          <button className="px-4 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 w-full lg:w-auto">
            Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Refine search</h3>
        {isFiltered && (
          <button
            onClick={clearFilters}
            className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Type Selection */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Asset Category</label>
          <div className="grid grid-cols-2 gap-2">
            {["all", "house", "car", "service"].map((t) => (
              <button
                key={t}
                onClick={() => handleTypeChange(t as any)}
                className={`px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                  filters.type === t
                    ? "bg-primary border-primary text-primary-foreground shadow-md"
                    : "bg-muted/30 border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">District</label>
          <input
            type="text"
            placeholder="Search location..."
            value={filters.location}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full px-5 py-4 bg-muted/30 border border-border/60 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Price Bracket</label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { label: "Any Valuation", value: "0-100000" },
              { label: "Below 5k", value: "0-5000" },
              { label: "5k - 20k", value: "5000-20000" },
              { label: "Above 20k", value: "20000-100000" }
            ].map((p) => (
              <button
                key={p.value}
                onClick={() => handlePriceChange(p.value)}
                className={`px-5 py-3.5 rounded-xl text-[11px] font-bold text-left border transition-all ${
                  `${filters.priceRange[0]}-${filters.priceRange[1]}` === p.value
                    ? "bg-primary/5 border-primary text-primary"
                    : "bg-muted/10 border-transparent text-muted-foreground hover:bg-muted/20"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
