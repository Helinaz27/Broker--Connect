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
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row items-end gap-4">
          {/* Search Bar */}
          <div className="w-full lg:flex-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search listings..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Location */}
          <div className="w-full lg:flex-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
              Location
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type location (e.g. Bole, Addis Ababa)..."
                value={filters.location}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Price Range */}
          <div className="w-full lg:w-64">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
              Price Range
            </label>
            <select
              value={
                filters.priceRange[0] === 0 && filters.priceRange[1] === 5000
                  ? "0-5000"
                  : filters.priceRange[0] === 5000 && filters.priceRange[1] === 15000
                    ? "5000-15000"
                    : filters.priceRange[0] === 15000 && filters.priceRange[1] === 30000
                      ? "15000-30000"
                      : filters.priceRange[0] === 30000 ? "30000-100000" : ""
              }
              onChange={(e) => handlePriceChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
            >
              <option value="">All Prices</option>
              <option value="0-5000">Under 5,000 Birr</option>
              <option value="5000-15000">5,000 - 15,000 Birr</option>
              <option value="15000-30000">15,000 - 30,000 Birr</option>
              <option value="30000-100000">30,000+ Birr</option>
            </select>
          </div>

          {/* Clear Button */}
          {isFiltered && (
            <button
              onClick={clearFilters}
              className="h-10 px-4 text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 mb-0.5"
            >
              <X className="h-4 w-4" />
              Reset
            </button>
          )}
        </div>
      </div>
    );
  }

  // Sidebar variant
  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-lg font-semibold">Filters</h3>
        {isFiltered && (
          <button
            onClick={clearFilters}
            className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-4 md:space-y-6">
        {/* Price Range */}
        <div>
          <label className="text-sm font-semibold block mb-3">Price Range</label>
          <div className="space-y-2">
            {[
              { label: "Under 5,000 Birr", value: "0-5000" },
              { label: "5,000 - 15,000 Birr", value: "5000-15000" },
              { label: "15,000 - 30,000 Birr", value: "15000-30000" },
              { label: "30,000+ Birr", value: "30000-100000" },
            ].map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="price"
                  value={option.value}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-foreground">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="text-sm font-semibold block mb-2">Location</label>
          <input
            type="text"
            placeholder="Enter area/city"
            value={filters.location}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
    </div>
  );
}
