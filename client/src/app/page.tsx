"use client";

import Header from "@/components/Header";
import ListingCard from "@/components/ListingCard";
import FilterPanel, { FilterValues } from "@/components/FilterPanel";
import Chat from "@/components/Chat";
import Footer from "@/components/Footer";
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
              
              <div className="space-y-6">
                <h1 className="text-5xl md:text-8xl font-bold leading-[1.1] text-foreground tracking-tight">
                  Premium <br />
                  <span className="text-gradient">Marketplace</span> <br />
                  for Ethiopia.
                </h1>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-medium max-w-lg">
                  Ethiopia's most trusted ecosystem for high-value real estate, premium automotive assets, and vetted professional services.
                </p>
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
            </div>
            
            <div className="relative hidden lg:block animate-in" style={{ animationDelay: '200ms' }}>
              <div className="relative z-10 rounded-[2.5rem] border border-white/20 bg-white/10 backdrop-blur-md p-4 shadow-glass overflow-hidden group">
                <div className="aspect-[4/3] rounded-[2rem] overflow-hidden relative">
                  <img 
                    src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&q=80" 
                    alt="Premium Assets"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-8 left-8">
                    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl p-3 pr-8 rounded-2xl border border-white/20 shadow-2xl">
                      <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Home className="h-6 w-6" />
                      </div>
                      <div className="text-white">
                        <p className="text-base font-bold tracking-tight">Luxury Estate</p>
                        <p className="text-[10px] font-medium uppercase tracking-wider opacity-80">Bole Atlas, Addis Ababa</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

      {/* Segment Curations */}
      <section className="py-32 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
            <div className="max-w-2xl space-y-4">
              <h2 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-[1.1]">
                Precision for <br />
                <span className="text-gradient">Your Ambition.</span>
              </h2>
              <p className="text-lg text-muted-foreground font-medium">
                Highly vetted collections across three core pillars of modern success.
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: "Houses", 
                img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
                desc: "High-yield real estate and luxury living spaces in Addis.",
                href: "/house-listings"
              },
              { 
                title: "Cars", 
                img: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80",
                desc: "Premium mobility for professional excellence.",
                href: "/car-listings"
              },
              { 
                title: "Services", 
                img: "https://images.unsplash.com/photo-1581578731548-c64695ce6958?w=800&q=80",
                desc: "Bespoke services for technical & creative needs.",
                href: "/service-listings"
              }
            ].map((cat, i) => (
              <Link key={i} href={cat.href} className="group relative rounded-[2rem] overflow-hidden aspect-[4/5] bg-card border border-border shadow-soft hover:shadow-xl hover:-translate-y-2 transition-all duration-500 ease-out">
                <img 
                  src={cat.img} 
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-80 transition-opacity" />
                <div className="absolute bottom-10 left-8 right-8">
                  <h3 className="text-3xl font-bold text-white tracking-tight mb-4 uppercase">{cat.title}</h3>
                  <p className="text-white/70 text-sm font-medium leading-relaxed mb-6 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-400">
                    {cat.desc}
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
