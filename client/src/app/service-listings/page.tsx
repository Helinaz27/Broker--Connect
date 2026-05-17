"use client";

import Header from "@/components/Header";
import ListingCard from "@/components/ListingCard";
import FilterSection from "@/components/FilterSection";
import Chat from "@/components/Chat";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { services } from "@/data/listings";
import Link from "next/link";

export default function ServiceListings() {
  const [filters, setFilters] = useState({
    priceRange: [0, 100000] as [number, number],
    location: "",
    search: "",
    type: "service" as "all" | "house" | "car" | "service",
  });

  const filteredServices = services.filter((service) => {
    const priceMatch =
      service.price >= filters.priceRange[0] && service.price <= filters.priceRange[1];
    const locationMatch = !filters.location || service.location.toLowerCase().includes(filters.location.toLowerCase());
    const searchMatch = !filters.search || service.title.toLowerCase().includes(filters.search.toLowerCase());
    return priceMatch && locationMatch && searchMatch;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 uppercase tracking-tight">other services</h1>
              <p className="text-muted-foreground font-medium">
                {filteredServices.length} other services available
              </p>
            </div>
            <Button size="lg" className="gap-2 w-fit font-bold rounded-xl" asChild>
              <Link href="/dashboard">
                <Plus className="h-5 w-5" />
                Offer a service
              </Link>
            </Button>
          </div>

          <div className="mb-8">
            <FilterSection
              filters={filters}
              onFilterChange={setFilters}
              variant="horizontal"
            />
          </div>

          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredServices.map((service) => (
                <ListingCard
                  key={service.id}
                  id={service.id}
                  title={service.title}
                  image={service.image}
                  price={service.price}
                  location={service.location}
                  category="service"
                  rating={service.rating}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground text-lg">
                No other services found matching your filters.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <Chat />
    </div>
  );
}
