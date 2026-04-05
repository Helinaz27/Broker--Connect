"use client";

import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Chat from "@/components/Chat";
import { Button } from "@/components/ui/button";
import { getHouseById } from "@/data/listings";
import { MapPin, ArrowLeft, Star } from "lucide-react";
import Link from "next/link";

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
          <p className="text-muted-foreground mb-4">Property not found.</p>
          <Button variant="outline" onClick={() => router.back()}>Go back</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/house-listings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to properties
          </Link>
          <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
            <div className="aspect-[16/10] bg-muted relative">
              <img src={house.image} alt={house.title} className="w-full h-full object-cover" />
              <span className="absolute top-3 left-3 bg-background/90 text-xs font-medium uppercase tracking-wider px-2 py-1 rounded">Property</span>
            </div>
            <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
                <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-500 text-amber-500" /> {house.rating}</span>
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {house.location}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">{house.title}</h1>
              <p className="text-2xl font-semibold text-primary mb-6">{house.price.toLocaleString()} Birr <span className="text-sm font-normal text-muted-foreground">/ month</span></p>
              {house.description && (
                <p className="text-muted-foreground leading-relaxed mb-8">{house.description}</p>
              )}
              <Button asChild className="w-full sm:w-auto">
                <a href={`mailto:contact@digitalbroker.example.com?subject=Inquiry: ${encodeURIComponent(house.title)}`}>Contact landlord</a>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <Chat />
    </div>
  );
}
