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
        <div className="container mx-auto px-4 animate-fade-in">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-primary">
                <Heart className="h-6 w-6 fill-current animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                  Personal Vault
                </span>
              </div>
              <h1 className="text-4xl font-black text-foreground tracking-tight italic">
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
                <ListingCard key={listing.id} {...listing} rating={4.8} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-card/50 backdrop-blur-xl border border-border/50 rounded-[3rem] shadow-2xl shadow-black/[0.02] max-w-3xl mx-auto overflow-hidden relative">
              <div className="absolute top-0 right-0 h-64 w-64 bg-primary/5 blur-[100px] -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10">
                <div className="h-24 w-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-primary/10 transition-transform duration-500 hover:scale-110">
                  <Heart className="h-10 w-10 text-primary/40" />
                </div>
                <h2 className="text-3xl font-black text-foreground tracking-tight mb-4 italic">
                  Empty Vault.
                </h2>
                <p className="text-muted-foreground mb-10 max-w-md mx-auto font-medium">
                  Your favorites list is empty. Start exploring the marketplace
                  to save properties, vehicles, and services you like.
                </p>
                <Link href="/">
                  <Button
                    size="lg"
                    className="h-14 px-10 rounded-2xl text-base font-black shadow-[0_20px_40px_-10px_rgba(59,130,246,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(59,130,246,0.4)] transition-all duration-300"
                  >
                    Explore Marketplace
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Chat />
    </div>
  );
}
