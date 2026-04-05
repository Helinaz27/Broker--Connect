"use client";

import Header from "@/components/Header";
import ListingCard from "@/components/ListingCard";
import FilterSection from "@/components/FilterSection";
import Chat from "@/components/Chat";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { houses, cars, services } from "@/data/listings";

export default function Index() {
  const [filters, setFilters] = useState({
    priceRange: [0, 100000] as [number, number],
    location: "",
    search: "",
    type: "all" as "all" | "house" | "car" | "service",
  });

  const filterBySearch = (items: any[]) => {
    return items.filter((item) => {
      const priceMatch =
        item.price >= filters.priceRange[0] && item.price <= filters.priceRange[1];
      const searchMatch = !filters.search || item.title.toLowerCase().includes(filters.search.toLowerCase());
      const locationMatch = !filters.location || item.location.toLowerCase().includes(filters.location.toLowerCase());
      return priceMatch && searchMatch && locationMatch;
    });
  };

  const filteredHouses = filterBySearch(
    filters.type === "all" || filters.type === "house" ? houses : []
  );

  const filteredCars = filterBySearch(
    filters.type === "all" || filters.type === "car" ? cars : []
  );

  const filteredServices = filterBySearch(
    filters.type === "all" || filters.type === "service" ? services : []
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-background pt-14 pb-20 md:pt-20 md:pb-28" id="hero">
        <div className="container relative mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="flex flex-col gap-6 max-w-xl">
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-foreground tracking-tight">
                Properties, vehicles &amp; services in one place
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                List and discover properties, vehicles, and professional services in Addis Ababa with a secure, professional marketplace.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="font-medium" asChild>
                  <Link href="#listings">Explore listings</Link>
                </Button>
                <Button variant="outline" size="lg" className="font-medium" asChild>
                  <Link href="/register">List your property</Link>
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border">
                <div>
                  <p className="text-2xl font-semibold text-foreground">{houses.length}+</p>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">Properties</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{cars.length}+</p>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">Vehicles</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{services.length}+</p>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">Services</p>
                </div>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="aspect-[4/3] rounded-lg bg-muted/50 flex items-center justify-center">
                  <Home className="h-20 w-20 text-muted-foreground/40" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="h-9 w-24 rounded bg-muted" />
                  <div className="h-9 w-9 rounded bg-muted" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="relative z-20 -mt-8 mb-12" id="listings">
        <div className="container mx-auto px-4">
          <div className="bg-card border border-border p-6 md:p-6 rounded-lg shadow-sm">
            <FilterSection
              filters={filters}
              onFilterChange={setFilters}
              variant="horizontal"
            />
          </div>
        </div>
      </section>

      {/* Properties */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground tracking-tight">Properties</h2>
              <p className="text-muted-foreground max-w-md text-sm">Homes and apartments for rent or sale in Addis Ababa.</p>
            </div>
            <Link href="/house-listings">
              <Button variant="ghost" size="sm" className="text-primary font-medium -mb-1">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredHouses.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        </div>
      </section>

      {/* Vehicles */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground tracking-tight">Vehicles</h2>
              <p className="text-muted-foreground max-w-md text-sm">Cars and SUVs for rent or hire.</p>
            </div>
            <Link href="/car-listings">
              <Button variant="ghost" size="sm" className="text-primary font-medium -mb-1">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredCars.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground tracking-tight">Services</h2>
              <p className="text-muted-foreground max-w-md text-sm">Professional services for home and business.</p>
            </div>
            <Link href="/service-listings">
              <Button variant="ghost" size="sm" className="text-primary font-medium -mb-1">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredServices.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-primary rounded-xl p-10 md:p-14 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-primary-foreground leading-tight">
              List your property or service
            </h2>
            <p className="text-primary-foreground/90 mt-3 max-w-xl mx-auto text-sm md:text-base">
              Join thousands of users. Create an account and start listing in minutes.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Button size="lg" variant="secondary" className="font-medium" asChild>
                <Link href="/register">Create account</Link>
              </Button>
              <Button size="lg" variant="outline" className="font-medium border-white/30 text-primary-foreground hover:bg-white/10" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Chat Component */}
      <Chat />
    </div>
  );
}
