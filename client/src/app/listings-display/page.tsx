"use client";

import { useState, useMemo } from "react";
import FilterPanel, { FilterValues } from "@/components/FilterPanel";
import ListingsGrid from "@/components/ListingsGrid";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { houses, cars, otherServices, getListingPath } from "@/data/listings";

export default function ListingsDisplayPage() {
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    location: "",
    priceMin: 0,
    priceMax: 100000,
    category: "all",
    listingMode: "all",
  });

  const allListings = useMemo(() => {
    const combined = [...houses, ...cars, ...otherServices];
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
        {/* Header */}
        <div className="mb-12">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            Search Results
          </h1>
          <p className="text-lg text-muted-foreground">
            Found {allListings.length} listing{allListings.length !== 1 ? "s" : ""}
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
              
              emptyMessage="No listings match your filters. Try adjusting your search criteria."
            />
          </div>
        </div>
      </div>
    </main>
  );
}
