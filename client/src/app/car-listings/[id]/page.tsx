"use client";

import { useState } from "react";

import { useParams, useRouter } from "next/navigation";
import Chat from "@/components/Chat";
import { Button } from "@/components/ui/button";
import { getCarById } from "@/data/listings";
import { MapPin, ArrowLeft, Star, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const car = id ? getCarById(id) : null;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!car) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container px-4 py-16 text-center">
          <p className="text-muted-foreground mb-4">Car not found.</p>
          <Button variant="outline" onClick={() => router.back()}>
            Go back
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const images = car.images && car.images.length > 0 
    ? car.images 
    : [car.image, car.image, car.image, car.image];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-8 md:py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <Link href="/car-listings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to cars
          </Link>
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-glass">
            <div className="aspect-[16/10] bg-muted relative">
              <img src={car.image} alt={car.title} className="w-full h-full object-cover" />
              <span className="absolute top-4 left-4 bg-background/90 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/20">Car</span>
            </div>
            <div className="p-8 md:p-12">
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1.5 font-medium">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> {car.rating}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="h-4 w-4" /> {car.location}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-4">{car.title}</h1>
              <p className="text-3xl font-bold text-primary mb-8">
                {car.price.toLocaleString()} <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Br</span>
              </p>
              <div className="h-px bg-border/50 w-full mb-8" />
              <div className="space-y-6 mb-10">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Description</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  {car.description || "No description provided for this car."}
                </p>
              </div>
              <Button asChild className="h-14 px-10 rounded-2xl bg-primary text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                <a href={`mailto:contact@digitalbroker.et?subject=Inquiry: ${encodeURIComponent(car.title)}`}>
                  Contact Agent
                </a>
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="mt-12 bg-card border border-border rounded-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {car.title}
            </h2>
            {car.description && (
              <p className="text-muted-foreground leading-relaxed text-lg">
                {car.description}
              </p>
            )}
          </div>
        </div>
      </main>
      <Chat />
      <Footer />
    </div>
  );
}
