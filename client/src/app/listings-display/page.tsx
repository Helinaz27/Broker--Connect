"use client";

import { useState, useMemo } from "react";
import FilterPanel, { FilterValues } from "@/components/FilterPanel";
import ListingsGrid from "@/components/ListingsGrid";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { houses, cars, otherServices } from "@/data/listings";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function ListingsDisplayPage() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    location: "",
    priceMin: 0,
    priceMax: 100000,
    category: "all",
    listingMode: "all",
  });

  const allListings = useMemo(() => {
    const combined = [...houses, ...cars, ...services];
    return combined.filter((item) => {
      const priceMatch =
        item.price >= filters.priceMin && item.price <= filters.priceMax;
      const searchMatch =
        !filters.search ||
        item.title.toLowerCase().includes(filters.search.toLowerCase());
      const locationMatch =
        !filters.location ||
        item.location.toLowerCase().includes(filters.location.toLowerCase());
      const categoryMatch =
        filters.category === "all" || item.category === filters.category;
      return priceMatch && searchMatch && locationMatch && categoryMatch;
    });
  }, [filters]);

  const handleReset = () => {
    setFilters({
      search: "",
      location: "",
      priceMin: 0,
      priceMax: 100000,
      category: "all",
      listingMode: "all",
    });
  };

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6">
        <div className="mb-12">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              {t("common.back")}
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            {t("listings.searchResults")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t("listings.foundListings", { count: allListings.length })}
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filter Panel */}
          <div className="lg:col-span-1">
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              onReset={handleReset}
              showListingMode={true}
              className="sticky top-24"
            />
          </div>

          {/* Listings Grid */}
          <div className="lg:col-span-3">
            <ListingsGrid
              listings={allListings}
              emptyMessage={t("listings.noSearchResults")}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
