"use client";

import ListingsGrid from "@/components/ListingsGrid";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { services, getListingPath } from "@/data/listings";

export default function ServiceListingsPage() {
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    priceMin: 0,
    priceMax: 100000,
  });

  const filteredServices = services.filter((item) => {
    const priceMatch =
      item.price >= filters.priceMin && item.price <= filters.priceMax;
    const searchMatch =
      !filters.search ||
      item.title.toLowerCase().includes(filters.search.toLowerCase());
    const locationMatch =
      !filters.location ||
      item.location.toLowerCase().includes(filters.location.toLowerCase());
    return priceMatch && searchMatch && locationMatch;
  });

  const handleReset = () => {
    setFilters({
      search: "",
      location: "",
      priceMin: 0,
      priceMax: 100000,
    });
  };

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6">
        <div className="mb-12">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            Other Services
          </h1>
          <p className="text-lg text-muted-foreground">
            Browse all available services
          </p>
        </div>

        {/* Horizontal Filter Bar */}
        <div className="bg-card border border-border rounded-lg p-6 mb-12 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <input
                type="text"
                placeholder="Search..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <input
                type="text"
                placeholder="Location..."
                value={filters.location}
                onChange={(e) =>
                  setFilters({ ...filters, location: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
              />
            </div>

            {/* Price Min */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Min Price</label>
              <input
                type="number"
                value={filters.priceMin}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    priceMin: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
              />
            </div>

            {/* Price Max */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Price</label>
              <input
                type="number"
                value={filters.priceMax}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    priceMax: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
              />
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Listings Grid */}
        <ListingsGrid
          listings={filteredServices}
          
          emptyMessage="No services found. Try adjusting your filters."
        />
      </div>
    </main>
  );
}
