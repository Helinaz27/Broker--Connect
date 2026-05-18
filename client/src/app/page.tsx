"use client";

import ListingCard from "@/components/ListingCard";
import FilterPanel, { FilterValues } from "@/components/FilterPanel";
import Chat from "@/components/Chat";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { houses, cars, otherServices, getListingPath } from "@/data/listings";

export default function Index() {
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    location: "",
    priceMin: 0,
    priceMax: 100000,
    category: "all",
  });

  const filterListings = (items: any[]) => {
    return items.filter((item) => {
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
  };

  const filteredHouses = filterListings(
    filters.category === "all" || filters.category === "house" ? houses : []
  );

  const filteredCars = filterListings(
    filters.category === "all" || filters.category === "car" ? cars : []
  );

  const filteredServices = filterListings(
    filters.category === "all" || filters.category === "otherService"
      ? otherServices
      : []
  );

  const handleReset = () => {
    setFilters({
      search: "",
      location: "",
      priceMin: 0,
      priceMax: 100000,
      category: "all",
    });
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section with Filters */}
      <section className="relative py-8 md:py-12 bg-gradient-to-b from-primary/5 to-background overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
              Find Your Perfect Match
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Browse thousands of houses, cars, and services from trusted sellers in your area.
            </p>
          </div>

          {/* Horizontal Filter Bar */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      category: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                >
                  <option value="all">All</option>
                  <option value="house">Houses</option>
                  <option value="car">Cars</option>
                  <option value="otherService">Services</option>
                </select>
              </div>

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

              {/* Reset Button */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="w-full"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Listings Sections */}
      <section className="py-16 container mx-auto px-6">
        {/* Houses Section - Horizontal Scrollable */}
        {(filters.category === "all" || filters.category === "house") &&
          filteredHouses.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Houses for {filters.category === "house" ? "Sale" : "Sale & Rent"}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {filteredHouses.length} properties available
                  </p>
                </div>
                <Link href="/house-listings">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="overflow-x-auto pb-4 -mx-6 px-6">
                <div className="flex gap-6" style={{ minWidth: "min-content" }}>
                  {filteredHouses.slice(0, 8).map((listing) => (
                    <div
                      key={listing.id}
                      className="flex-shrink-0 w-80"
                    >
                      <ListingCard
                        id={listing.id}
                        title={listing.title}
                        image={listing.image}
                        price={listing.price}
                        location={listing.location}
                        category={listing.category}
                        rating={listing.rating}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        {/* Cars Section - Horizontal Scrollable */}
        {(filters.category === "all" || filters.category === "car") &&
          filteredCars.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Cars for {filters.category === "car" ? "Sale" : "Sale & Rent"}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {filteredCars.length} vehicles available
                  </p>
                </div>
                <Link href="/car-listings">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="overflow-x-auto pb-4 -mx-6 px-6">
                <div className="flex gap-6" style={{ minWidth: "min-content" }}>
                  {filteredCars.slice(0, 8).map((listing) => (
                    <div
                      key={listing.id}
                      className="flex-shrink-0 w-80"
                    >
                      <ListingCard
                        id={listing.id}
                        title={listing.title}
                        image={listing.image}
                        price={listing.price}
                        location={listing.location}
                        category={listing.category}
                        rating={listing.rating}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        {/* Other Services Section - Horizontal Scrollable */}
        {(filters.category === "all" || filters.category === "otherService") &&
          filteredServices.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Other Services
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {filteredServices.length} services available
                  </p>
                </div>
                <Link href="/service-listings">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="overflow-x-auto pb-4 -mx-6 px-6">
                <div className="flex gap-6" style={{ minWidth: "min-content" }}>
                  {filteredServices.slice(0, 8).map((listing) => (
                    <div
                      key={listing.id}
                      className="flex-shrink-0 w-80"
                    >
                      <ListingCard
                        id={listing.id}
                        title={listing.title}
                        image={listing.image}
                        price={listing.price}
                        location={listing.location}
                        category={listing.category}
                        rating={listing.rating}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        {/* No Results */}
        {filteredHouses.length === 0 &&
          filteredCars.length === 0 &&
          filteredServices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-dashed border-border rounded-[2rem]">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
                <ArrowRight className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                No listings found
              </h3>
              <p className="text-muted-foreground max-w-xs">
                Try adjusting your filters to find what you're looking for.
              </p>
            </div>
          )}
      </section>

      <Chat />
    </main>
  );
}
