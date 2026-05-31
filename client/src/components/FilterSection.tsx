"use client";

import { X, Search, SlidersHorizontal } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

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
  const { t } = useLanguage();

  const updateFilter = (updates: Partial<typeof filters>) => {
    onFilterChange({ ...filters, ...updates });
  };

  const handlePriceChange = (value: string) => {
    const [min, max] = value.split("-").map(Number);
    updateFilter({ priceRange: [min, max] });
  };

  const clearFilters = () => {
    onFilterChange({
      priceRange: [0, 100000],
      location: "",
      search: "",
      type: "all",
    });
  };

  const isFiltered =
    filters.location ||
    filters.priceRange[1] < 100000 ||
    filters.search ||
    filters.type !== "all";

  const categories = [
    { label: t("filters.categoryAll"), value: "all" },
    { label: t("filters.categoryHouse"), value: "house" },
    { label: t("filters.categoryCars"), value: "car" },
    { label: t("filters.categoryServices"), value: "service" },
  ];

  const priceBrackets = [
    { label: t("filters.anyValuation"), value: "0-100000" },
    { label: t("filters.below5000"), value: "0-5000" },
    { label: t("filters.range5000_20000"), value: "5000-20000" },
    { label: t("filters.above20000"), value: "20000-100000" },
  ];

  const inputStyles =
    "w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-muted-foreground/50";
  const labelStyles =
    "text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 ml-1 block";

  if (variant === "horizontal") {
    return (
      <div className="flex flex-col lg:flex-row items-end gap-6 bg-card p-3 rounded-2xl shadow-soft">
        <div className="w-full lg:flex-[1.5]">
          <label className={labelStyles}>{t("filters.searchQuery")}</label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search listings..."
              value={filters.search}
              onChange={(e) => updateFilter({ search: e.target.value })}
              className={`${inputStyles} pl-11 font-inter`}
            />
          </div>
        </div>
        <div className="w-full lg:flex-1">
          <label className={labelStyles}>{t("common.location")}</label>
          <input
            type="text"
            placeholder={t("filters.locationPlaceholder")}
            value={filters.location}
            onChange={(e) => updateFilter({ location: e.target.value })}
            className={inputStyles}
          />
        </div>
        <div className="w-full lg:w-56">
          <label className={labelStyles}>{t("filters.priceBracket")}</label>
          <select
            value={`${filters.priceRange[0]}-${filters.priceRange[1]}`}
            onChange={(e) => handlePriceChange(e.target.value)}
            className={`${inputStyles} font-semibold appearance-none cursor-pointer`}
          >
            {priceBrackets.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          {isFiltered && (
            <button
              onClick={clearFilters}
              className="flex items-center justify-center gap-2 h-12 px-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground border border-border rounded-xl hover:bg-muted transition-all"
            >
              <X className="h-4 w-4" /> {t("home.reset")}
            </button>
          )}
          <button
            onClick={() => {
              const element = document.getElementById("listings");
              if (element) {
                element.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="h-12 px-8 bg-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 w-full lg:w-auto"
          >
            {t("home.applyFilters")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground tracking-tight">
          {t("filters.refinePortfolio")}
        </h3>
        {isFiltered && (
          <button
            onClick={clearFilters}
            className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
          >
            {t("filters.resetAll")}
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <label className={labelStyles}>{t("filters.assetCategory")}</label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => updateFilter({ type: cat.value as any })}
                className={`px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest border transition-all ${
                  filters.type === cat.value
                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                    : "bg-muted/50 border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className={labelStyles}>{t("filters.district")}</label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder={t("filters.searchLocation")}
              value={filters.location}
              onChange={(e) => updateFilter({ location: e.target.value })}
              className={`${inputStyles} pl-11`}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className={labelStyles}>{t("filters.priceBracket")}</label>
          <div className="grid grid-cols-1 gap-2">
            {priceBrackets.map((p) => (
              <button
                key={p.value}
                onClick={() => handlePriceChange(p.value)}
                className={`px-4 py-3.5 rounded-xl text-[11px] font-semibold text-left border transition-all ${
                  `${filters.priceRange[0]}-${filters.priceRange[1]}` ===
                  p.value
                    ? "bg-primary/5 border-primary text-primary"
                    : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50 hover:border-border"
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

FilterSection.Icon = SlidersHorizontal;
