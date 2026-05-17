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
      <section className="relative bg-background pt-20 pb-24 md:pt-32 md:pb-40 overflow-hidden" id="hero">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.05),transparent_50%)]" />
        <div className="container relative mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-8 max-w-2xl animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Addis Ababa's Premier Marketplace
              </div>
              <h1 className="text-5xl md:text-7xl font-black leading-[1.1] text-foreground tracking-tighter italic">
                Connect. <br />
                <span className="text-primary">Discover.</span> <br />
                Acquire.
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed font-medium max-w-lg">
                The most trusted digital bridge for premium real estate, high-end vehicles, and professional services in Ethiopia.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="h-14 px-10 rounded-2xl text-base font-black gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary text-white hover:bg-primary/90" asChild>
                  <Link href="#listings">
                    Explore Assets
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-8 pt-10 border-t border-border/40">
                <div>
                  <p className="text-3xl font-black text-foreground tracking-tighter italic">{houses.length}+</p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">house</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-foreground tracking-tighter italic">{cars.length}+</p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">cars</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-foreground tracking-tighter italic">{services.length}+</p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">other services</p>
                </div>
              </div>
            </div>
            
            <div className="relative hidden lg:block animate-fade-in animation-delay-300">
              <div className="relative z-10 rounded-[3rem] border border-border/50 bg-card/50 backdrop-blur-sm p-8 shadow-2xl shadow-black/5 overflow-hidden group">
                <div className="absolute top-0 right-0 h-64 w-64 bg-primary/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="aspect-[4/3] rounded-[2rem] bg-muted/30 flex items-center justify-center border border-border/50 relative overflow-hidden">
                  <Home className="h-24 w-24 text-primary/20 group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent" />
                </div>
                <div className="mt-8 flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-32 rounded-full bg-muted/60" />
                    <div className="h-3 w-24 rounded-full bg-muted/40" />
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 h-24 w-24 bg-blue-500/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-indigo-500/10 rounded-full blur-3xl" />
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

      {/* house */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground tracking-tight uppercase">house</h2>
              <p className="text-muted-foreground max-w-md text-sm">Homes and apartments for rent or sale in Addis Ababa.</p>
            </div>
            <Link href="/house-listings">
              <Button variant="ghost" size="sm" className="text-primary font-medium -mb-1">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="flex overflow-x-auto pb-6 gap-6 snap-x scrollbar-hide">
            {filteredHouses.map((listing) => (
              <div key={listing.id} className="min-w-[300px] md:min-w-[350px] snap-start">
                <ListingCard {...listing} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* cars */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground tracking-tight uppercase">cars</h2>
              <p className="text-muted-foreground max-w-md text-sm">Cars and SUVs for rent or hire.</p>
            </div>
            <Link href="/car-listings">
              <Button variant="ghost" size="sm" className="text-primary font-medium -mb-1">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="flex overflow-x-auto pb-6 gap-6 snap-x scrollbar-hide">
            {filteredCars.map((listing) => (
              <div key={listing.id} className="min-w-[300px] md:min-w-[350px] snap-start">
                <ListingCard {...listing} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* other services */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground tracking-tight uppercase">other services</h2>
              <p className="text-muted-foreground max-w-md text-sm">Professional services for home and business.</p>
            </div>
            <Link href="/service-listings">
              <Button variant="ghost" size="sm" className="text-primary font-medium -mb-1">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="flex overflow-x-auto pb-6 gap-6 snap-x scrollbar-hide">
            {filteredServices.map((listing) => (
              <div key={listing.id} className="min-w-[300px] md:min-w-[350px] snap-start">
                <ListingCard {...listing} />
              </div>
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
            <div className="flex justify-center gap-3 mt-8">
              <Button size="lg" variant="secondary" className="font-medium" asChild>
                <Link href="/login">Login to Get Started</Link>
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
