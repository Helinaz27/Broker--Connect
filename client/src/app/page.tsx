"use client";

import ListingCard from "@/components/ListingCard";
import { FilterValues } from "@/components/FilterPanel";
import Chat from "@/components/Chat";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home, Car, Wrench } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { houses, cars, services } from "@/data/listings";

export default function Index() {
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    location: "",
    priceMin: 0,
    priceMax: 100000000,
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
    filters.category === "all" || filters.category === "service" ? services : []
  );

  const handleReset = () => {
    setFilters({
      search: "",
      location: "",
      priceMin: 0,
      priceMax: 100000000,
      category: "all",
    });
  };

  const sections = [
    { id: "house", title: "Premium Real Estate", data: filteredHouses, href: "/house-listings", label: "Houses" },
    { id: "car", title: "Automotive Collection", data: filteredCars, href: "/car-listings", label: "Cars" },
    { id: "service", title: "Professional Services", data: filteredServices, href: "/service-listings", label: "Services" },
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 md:pt-32 md:pb-48 overflow-hidden" id="hero">
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
                <h1 className="text-5xl md:text-8xl font-bold leading-[1.1] text-foreground tracking-tight italic">
                  Premium <br />
                  <span className="text-primary">Marketplace</span> <br />
                  for Ethiopia.
                </h1>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-medium max-w-lg">
                  Ethiopia's most trusted ecosystem for high-value real estate, premium automotive assets, and vetted professional services.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="h-16 px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all group" asChild>
                  <Link href="/house-listings">
                    Explore Assets
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl border-border/60 font-black uppercase tracking-widest text-xs hover:bg-muted/50 transition-all" asChild>
                  <Link href="/dashboard">Post Asset</Link>
                </Button>
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
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Horizontal Filter Bar */}
      <section className="container mx-auto px-6 -mt-12 relative z-20">
        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Asset Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value as any })}
                className="w-full h-14 px-5 bg-muted/30 border border-border/60 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none"
              >
                <option value="all">All Categories</option>
                <option value="house">Houses</option>
                <option value="car">Cars</option>
                <option value="service">Services</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Location</label>
              <input
                type="text"
                placeholder="District in Addis..."
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full h-14 px-5 bg-muted/30 border border-border/60 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Min Price (ETB)</label>
              <input
                type="number"
                placeholder="0"
                value={filters.priceMin || ""}
                onChange={(e) => setFilters({ ...filters, priceMin: parseInt(e.target.value) || 0 })}
                className="w-full h-14 px-5 bg-muted/30 border border-border/60 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Max Price (ETB)</label>
              <input
                type="number"
                placeholder="Any"
                value={filters.priceMax || ""}
                onChange={(e) => setFilters({ ...filters, priceMax: parseInt(e.target.value) || 100000000 })}
                className="w-full h-14 px-5 bg-muted/30 border border-border/60 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleReset} variant="outline" className="w-full h-14 rounded-2xl border-border/60 font-black uppercase tracking-widest text-[10px] hover:bg-muted/50 transition-all">
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Listings Sections */}
      <section className="py-32">
        <div className="container mx-auto px-6 space-y-32">
          {sections.map((section) => (
            section.data.length > 0 && (
              <div key={section.id} className="space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest">
                      <div className="h-0.5 w-6 bg-primary" />
                      {section.label}
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight italic">{section.title}</h2>
                  </div>
                  <Button variant="ghost" className="text-primary font-black text-xs hover:bg-primary/5 px-6 h-12 rounded-xl group" asChild>
                    <Link href={section.href}>
                      View Collection
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
                
                <div className="flex overflow-x-auto gap-8 pb-10 -mx-6 px-6 custom-scrollbar scroll-smooth snap-x snap-mandatory">
                  {section.data.slice(0, 8).map((item) => (
                    <div key={item.id} className="min-w-[320px] md:min-w-[420px] snap-start">
                      <ListingCard {...item} category={section.id as any} type={item.type} />
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}

          {filteredHouses.length === 0 && filteredCars.length === 0 && filteredServices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-card/30 border border-dashed border-border/60 rounded-[3rem]">
              <div className="h-20 w-20 rounded-3xl bg-muted/50 flex items-center justify-center mb-8">
                <ArrowRight className="h-10 w-10 text-muted-foreground -rotate-45" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-3 italic">No matching assets found.</h3>
              <p className="text-muted-foreground max-w-sm font-medium">Try broadening your search criteria or resetting the filters to explore the marketplace.</p>
              <Button onClick={handleReset} variant="outline" className="mt-10 rounded-2xl border-border/60 font-bold px-8 h-12">Clear all filters</Button>
            </div>
          )}
        </div>
      </section>

      {/* Segment Curations */}
      <section className="py-32 bg-muted/30 border-y border-border/40">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
            <div className="max-w-2xl space-y-4">
              <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-[1.1] italic">
                Precision for <br />
                <span className="text-primary">Your Ambition.</span>
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
                href: "/house-listings",
                icon: Home
              },
              { 
                title: "Cars", 
                img: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80",
                desc: "Premium mobility for professional excellence.",
                href: "/car-listings",
                icon: Car
              },
              { 
                title: "Services", 
                img: "https://images.unsplash.com/photo-1581578731548-c64695ce6958?w=800&q=80",
                desc: "Bespoke services for technical & creative needs.",
                href: "/service-listings",
                icon: Wrench
              }
            ].map((cat, i) => (
              <Link key={i} href={cat.href} className="group relative rounded-[2.5rem] overflow-hidden aspect-[4/5] bg-card border border-border shadow-soft hover:shadow-2xl transition-all duration-700 ease-out">
                <img 
                  src={cat.img} 
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-in-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 group-hover:opacity-80 transition-opacity" />
                <div className="absolute bottom-12 left-10 right-10">
                  <div className="h-12 w-12 rounded-2xl bg-primary/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                    <cat.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-3xl font-black text-white tracking-tight mb-4 uppercase italic">{cat.title}</h3>
                  <p className="text-white/70 text-sm font-medium leading-relaxed opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    {cat.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Chat />
    </main>
  );
}
