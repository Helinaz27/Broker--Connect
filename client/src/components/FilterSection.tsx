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
      <div className="flex flex-col lg:flex-row items-end gap-6 bg-card p-2 rounded-2xl">
        <div className="w-full lg:flex-[1.5]">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2.5 ml-1 block">Search Query</label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="house, cars, or services..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-muted/30 border border-border/50 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-muted-foreground/50"
            />
          </div>
        </div>
        <div className="w-full lg:flex-1">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2.5 ml-1 block">Location</label>
          <input
            type="text"
            placeholder="Addis Ababa, Bole..."
            value={filters.location}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full px-4 py-3.5 bg-muted/30 border border-border/50 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-muted-foreground/50"
          />
        </div>
        <div className="w-full lg:w-56">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2.5 ml-1 block">Price Bracket</label>
          <select
            value={`${filters.priceRange[0]}-${filters.priceRange[1]}`}
            onChange={(e) => handlePriceChange(e.target.value)}
            className="w-full px-4 py-3.5 bg-muted/30 border border-border/50 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary appearance-none cursor-pointer transition-all"
          >
            <option value="0-100000">Any Valuation</option>
            <option value="0-1000">Under 1,000 Birr</option>
            <option value="1000-5000">1,000 – 5,000</option>
            <option value="5000-20000">5,000 – 20,000</option>
            <option value="20000-100000">20,000+</option>
          </select>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          {isFiltered && (
            <button
              onClick={clearFilters}
              className="flex items-center justify-center gap-2 h-[52px] px-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground border border-border/50 rounded-xl hover:bg-muted transition-all"
            >
              <X className="h-4 w-4" />
              Reset
            </button>
          )}
          <button className="h-[52px] px-8 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 w-full lg:w-auto">
            Apply Filters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black italic text-foreground tracking-tight">Refine Portfolio</h3>
        {isFiltered && (
          <button
            onClick={clearFilters}
            className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
          >
            Reset All
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Type Selection */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Asset Category</label>
          <div className="grid grid-cols-2 gap-2">
            {["all", "house", "cars", "other services"].map((t) => (
              <button
                key={t}
                onClick={() => {
                  const internalValue = t === "cars" ? "car" : t === "other services" ? "service" : t;
                  handleTypeChange(internalValue as any);
                }}
                className={`px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                  (filters.type === "car" && t === "cars") || (filters.type === "service" && t === "other services") || filters.type === t
                    ? "bg-primary border-primary text-primary-foreground shadow-[0_10px_20px_-5px_rgba(59,130,246,0.4)]"
                    : "bg-muted/30 border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted/50"
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
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search location..."
              value={filters.location}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-muted/30 border border-border/50 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Price Bracket</label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { label: "Any Valuation", value: "0-100000" },
              { label: "Below 5,000 Br", value: "0-5000" },
              { label: "5,000 – 20,000", value: "5000-20000" },
              { label: "Above 20,000", value: "20000-100000" }
            ].map((p) => (
              <button
                key={p.value}
                onClick={() => handlePriceChange(p.value)}
                className={`px-5 py-4 rounded-2xl text-[11px] font-bold text-left border transition-all ${
                  `${filters.priceRange[0]}-${filters.priceRange[1]}` === p.value
                    ? "bg-primary/5 border-primary text-primary shadow-sm shadow-primary/5"
                    : "bg-muted/10 border-transparent text-muted-foreground hover:bg-muted/20 hover:border-border/60"
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
