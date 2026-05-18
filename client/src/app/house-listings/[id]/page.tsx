"use client";

import { useParams, useRouter } from "next/navigation";
import Chat from "@/components/Chat";
import { Button } from "@/components/ui/button";
import { getHouseById } from "@/data/listings";
import { MapPin, ArrowLeft, Star } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function HouseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const house = id ? getHouseById(id) : null;

  if (!house) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container px-4 py-16 text-center">
          <p className="text-muted-foreground mb-4">House not found.</p>
          <Button variant="outline" onClick={() => router.back()}>Go back</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-8 md:py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <Link href="/house-listings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to houses
          </Link>
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-glass">
            <div className="aspect-[16/10] bg-muted relative">
              <img src={house.image} alt={house.title} className="w-full h-full object-cover" />
              <span className="absolute top-4 left-4 bg-background/90 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/20">House</span>
            </div>
            <div className="p-8 md:p-12">
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1.5 font-medium">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> {house.rating}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="h-4 w-4" /> {house.location}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-4">{house.title}</h1>
              <p className="text-3xl font-bold text-primary mb-8">
                {house.price.toLocaleString()} <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Br</span>
              </p>
              <div className="h-px bg-border/50 w-full mb-8" />
              <div className="space-y-6 mb-10">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Description</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  {house.description || "No description provided for this house."}
                </p>
              </div>
              <Button asChild className="h-14 px-10 rounded-2xl bg-primary text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                <a href={`mailto:contact@digitalbroker.et?subject=Inquiry: ${encodeURIComponent(house.title)}`}>
                  Contact Agent
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Chat />
      <Footer />
    </div>
  );
}
