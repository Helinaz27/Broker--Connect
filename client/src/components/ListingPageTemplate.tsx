"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import ListingCard from "@/components/ListingCard";
import FilterSection from "@/components/FilterSection";
import Chat from "@/components/Chat";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageProvider";

interface Listing {
  id: string;
  title: string;
  image: string;
  price: number;
  location: string;
  category: "house" | "car" | "service";
  rating?: number;
}

interface ListingPageProps {
  title: string;
  category: "house" | "car" | "service";
  listings: Listing[];
  postLabel: string;
}

export default function ListingPage({
  title,
  category,
  listings,
  postLabel,
}: ListingPageProps) {
  const { t } = useLanguage();
  const [filters, setFilters] = useState({
    priceRange: [0, 100000] as [number, number],
    location: "",
    search: "",
    type: category as "all" | "house" | "car" | "service",
  });

  const filteredListings = listings.filter((item) => {
    const priceMatch =
      item.price >= filters.priceRange[0] &&
      item.price <= filters.priceRange[1];
    const locationMatch =
      !filters.location ||
      item.location.toLowerCase().includes(filters.location.toLowerCase());
    const searchMatch =
      !filters.search ||
      item.title.toLowerCase().includes(filters.search.toLowerCase());
    return priceMatch && locationMatch && searchMatch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 py-8 md:py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mb-16">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-widest">
                <div className="h-0.5 w-6 bg-primary" />
                {t("common.marketplace")}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                {title}
              </h1>
              <p className="text-muted-foreground font-medium">
                {t("filters.discoverPremium", {
                  count: filteredListings.length,
                  title: title.toLowerCase(),
                })}
              </p>
            </div>
            <Button
              size="lg"
              className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold uppercase tracking-widest text-xs gap-3 transition-all hover:scale-[1.02] text-white"
              asChild
            >
              <Link href="/dashboard">
                <Plus className="h-5 w-5" />
                {postLabel}
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <aside className="lg:col-span-1">
              <div className="sticky top-24">
                <FilterSection
                  filters={filters}
                  onFilterChange={setFilters}
                  variant="sidebar"
                />
              </div>
            </aside>

            <div className="lg:col-span-3">
              {filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredListings.map((item) => (
                    <ListingCard key={item.id} {...item} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-dashed border-border rounded-[2rem]">
                  <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
                    <FilterSection.Icon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {t("common.noListingsFound")}
                  </h3>
                  <p className="text-muted-foreground max-w-xs">
                    {t("filters.tryAdjustFilters")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Chat />
    </div>
  );
}

ListingPage.Icon = FilterSection;
