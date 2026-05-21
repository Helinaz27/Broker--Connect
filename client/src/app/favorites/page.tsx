"use client";

import ListingCard from "@/components/ListingCard";
import Chat from "@/components/Chat";
import { useFavorites } from "@/lib/FavoritesContext";
import { Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Favorites() {
  const { favorites } = useFavorites();

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent_50%)]" />

      <main className="flex-grow py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-primary">
                <Heart className="h-6 w-6 fill-current animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                  Personal Vault
                </span>
              </div>
              <h1 className="text-4xl font-black text-foreground tracking-tight">
                Saved Selections.
              </h1>
              <p className="text-muted-foreground font-medium">
                Curated listings and services you've bookmarked for later.
              </p>
            </div>
            <Link href="/">
              <Button
                variant="outline"
                className="rounded-xl border-border/60 font-bold text-xs h-11 px-6 hover:bg-muted/50 transition-all"
              >
                Continue Browsing
              </Button>
            </Link>
          </div>

          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {favorites.map((listing) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  title={listing.title}
                  image={listing.image}
                  price={listing.price}
                  location={listing.location}
                  category={listing.category as any}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Heart className="h-16 w-16 text-muted-foreground/20 mb-4" />
              <p className="text-lg text-muted-foreground mb-4">
                No favorites yet!
              </p>
              <Link href="/">
                <Button>Start Exploring</Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Chat />
    </div>
  );
}
