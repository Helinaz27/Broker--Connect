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
        item.price >= filters.priceRange[0] &&
        item.price <= filters.priceRange[1];
      const searchMatch =
        !filters.search ||
        item.title.toLowerCase().includes(filters.search.toLowerCase());
      const locationMatch =
        !filters.location ||
        item.location.toLowerCase().includes(filters.location.toLowerCase());
      return priceMatch && searchMatch && locationMatch;
    });
  };

  const filteredHouses = filterBySearch(
    filters.type === "all" || filters.type === "house" ? houses : [],
  );

  const filteredCars = filterBySearch(
    filters.type === "all" || filters.type === "car" ? cars : [],
  );

  const filteredServices = filterBySearch(
    filters.type === "all" || filters.type === "service" ? services : [],
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 md:pt-32 md:pb-48 overflow-hidden" id="hero">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[120px] opacity-60 pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] opacity-60 pointer-events-none" />
        
        <div className="container relative mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-10 max-w-2xl animate-in">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/50 dark:bg-white/5 border border-white/20 shadow-soft text-primary text-[11px] font-bold uppercase tracking-wider w-fit backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                The Professional Broker Network
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
              
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button size="lg" className="h-14 px-10 rounded-2xl text-sm font-bold gap-3 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all text-white group" asChild>
                  <Link href="#listings">
                    Explore Marketplace
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="h-14 px-10 rounded-2xl text-sm font-bold border-border bg-background/50 backdrop-blur-sm text-foreground hover:bg-muted transition-all" asChild>
                  <Link href="/about">How it Works</Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-8 pt-12 border-t border-border">
                <div>
                  <p className="text-4xl font-bold text-foreground tracking-tight">{houses.length}+</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5">Houses</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-foreground tracking-tight">{cars.length}+</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5">Cars</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-foreground tracking-tight">{services.length}+</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5">Experts</p>
                </div>
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
                  </div>
                </div>
              </div>
              {/* Floating decorative elements */}
              <div className="absolute -top-12 -right-12 h-40 w-40 bg-primary/20 rounded-full blur-[80px] opacity-40 animate-pulse-soft" />
              <div className="absolute -bottom-16 -left-16 h-56 w-56 bg-primary/20 rounded-full blur-[100px] opacity-40 animate-pulse-soft" />
            </div>
          </div>
        </div>
      </section>

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
                  <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                    View Segment
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Global Filter Console */}
      <section className="relative z-20 -mt-12 mb-20" id="listings">
        <div className="container mx-auto px-6">
          <div className="bg-background/80 backdrop-blur-xl border border-border p-2 rounded-3xl shadow-glass">
            <FilterSection
              filters={filters}
              onFilterChange={setFilters}
              variant="horizontal"
            />
          </div>
        </div>
      </section>

      <main className="container mx-auto px-6 py-16">
        {/* Marketplace Sections */}
        <div className="space-y-32">
          {[
            { id: "house", label: "Houses", sub: "Real Estate", data: filteredHouses, href: "/house-listings" },
            { id: "car", label: "Cars", sub: "Automotive", data: filteredCars, href: "/car-listings" },
            { id: "service", label: "Services", sub: "Experts & Professionals", data: filteredServices, href: "/service-listings" }
          ].map((section) => (filters.type === "all" || filters.type === section.id) && (
            <section key={section.id} className="animate-in">
              <div className="flex items-end justify-between mb-12 px-2">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-widest">
                    <div className="h-0.5 w-6 bg-primary" />
                    {section.sub}
                  </div>
                  <h2 className="text-4xl font-bold text-foreground tracking-tight">{section.label}</h2>
                </div>
                <Link href={section.href} className="group flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-all uppercase tracking-widest pb-1 border-b border-transparent hover:border-primary/20">
                  Explore All
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              <div className="flex overflow-x-auto gap-6 pb-10 custom-scrollbar scroll-smooth snap-x snap-mandatory px-2">
                {section.data.map((item) => (
                  <div key={item.id} className="min-w-[300px] md:min-w-[380px] snap-start">
                    <ListingCard {...item} category={section.id as any} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Trust & Stats Section */}
      <section className="py-32 bg-card border-y border-border overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,var(--tw-gradient-from),transparent_70%)] from-primary/5 pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 mb-24">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
              Institutional trust. <br />
              <span className="text-gradient">Digital speed.</span>
            </h2>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
              We've re-engineered the brokerage experience for a generation that values transparency, security, and elite service.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: "Verified Assets", value: "2.4k+" },
              { label: "Direct Connections", value: "15k+" },
              { label: "Market Trust", value: "99.8%" },
              { label: "Cities Covered", value: "12" }
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <p className="text-5xl font-bold tracking-tight text-foreground">{stat.value}</p>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <Chat />
    </div>
  );
}
