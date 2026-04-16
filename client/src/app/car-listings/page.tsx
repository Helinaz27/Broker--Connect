"use client";

import Header from "@/components/Header";
import ListingCard from "@/components/ListingCard";
import FilterSection from "@/components/FilterSection";
import Chat from "@/components/Chat";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { cars } from "@/data/listings";
import Link from "next/link";

export default function CarListings() {
  const [filters, setFilters] = useState({
    priceRange: [0, 100000] as [number, number],
    location: "",
    search: "",
    type: "car" as "all" | "house" | "car" | "service",
  });

  const filteredCars = cars.filter((car) => {
    const priceMatch =
      car.price >= filters.priceRange[0] && car.price <= filters.priceRange[1];
    const locationMatch = !filters.location || car.location.toLowerCase().includes(filters.location.toLowerCase());
    const searchMatch = !filters.search || car.title.toLowerCase().includes(filters.search.toLowerCase());
    return priceMatch && locationMatch && searchMatch;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Vehicles</h1>
              <p className="text-muted-foreground">
                {filteredCars.length} vehicles available
              </p>
            </div>
            <Button size="lg" className="gap-2 w-fit" asChild>
              <Link href="/dashboard">
                <Plus className="h-5 w-5" />
                Post a vehicle
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

          {filteredCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredCars.map((car) => (
                <ListingCard
                  key={car.id}
                  id={car.id}
                  title={car.title}
                  image={car.image}
                  price={car.price}
                  location={car.location}
                  category="car"
                  rating={car.rating}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground text-lg">
                No vehicles found matching your filters.
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
