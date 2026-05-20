// client/src/app/house-listings/[id]/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetListingByIdQuery } from "@/store/apis/listingsApi";
import Chat from "@/components/Chat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Bed,
  Bath,
  SquareCode,
  Car,
  Droplets,
} from "lucide-react";
import Link from "next/link";

export default function HouseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data, isLoading, isError } = useGetListingByIdQuery(id, {
    skip: !id,
  });

  const house = data?.data?.listing;

  // ── Loading ──────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  // ── Error / not found ────────────────────────
  if (isError || !house) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 container px-4 py-16 text-center">
          <p className="text-muted-foreground mb-4">House not found.</p>
          <Button variant="outline" onClick={() => router.back()}>
            Go back
          </Button>
        </main>
      </div>
    );
  }

  const images =
    house.images && house.images.length > 0
      ? house.images
      : ["/placeholder.jpg"];

  const nextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % images.length);

  const prevImage = () =>
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const fullAddress =
    house.location?.fullAddress ??
    [house.location?.placeName, house.location?.subCity, house.location?.city]
      .filter(Boolean)
      .join(", ");

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-8 md:py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <Link
            href="/house-listings"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4" /> Back to houses
          </Link>

          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-glass">
            {/* ── Image carousel ── */}
            <div className="aspect-[16/10] bg-muted relative overflow-hidden">
              <img
                src={images[currentImageIndex]}
                alt={house.title}
                className="w-full h-full object-cover transition-opacity duration-300"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-background/90 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/20">
                  House
                </span>
                {house.listingMode && (
                  <Badge
                    variant="outline"
                    className={
                      house.listingMode === "rent"
                        ? "bg-blue-500/90 text-white border-0 text-[10px] uppercase tracking-widest"
                        : "bg-green-500/90 text-white border-0 text-[10px] uppercase tracking-widest"
                    }
                  >
                    {house.listingMode}
                  </Badge>
                )}
              </div>

              {/* Carousel controls */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-1.5 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-1.5 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          i === currentImageIndex
                            ? "w-4 bg-white"
                            : "w-1.5 bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* ── Details ── */}
            <div className="p-8 md:p-12">
              {/* Location */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="h-4 w-4" /> {fullAddress}
                </span>
                {house.houseType && (
                  <span className="capitalize text-xs bg-muted px-2 py-1 rounded-md">
                    {house.houseType}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
                {house.title}
              </h1>

              <p className="text-3xl font-bold text-primary mb-4">
                {house.price.toLocaleString()}{" "}
                <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  Br{house.rentalPeriod ? ` / ${house.rentalPeriod}` : ""}
                </span>
              </p>

              {/* House specs */}
              <div className="flex flex-wrap gap-4 mb-8 text-sm text-muted-foreground">
                {house.bedrooms !== undefined && (
                  <span className="flex items-center gap-1.5">
                    <Bed className="h-4 w-4" /> {house.bedrooms} bed
                    {house.bedrooms !== 1 ? "s" : ""}
                  </span>
                )}
                {house.bathrooms !== undefined && (
                  <span className="flex items-center gap-1.5">
                    <Bath className="h-4 w-4" /> {house.bathrooms} bath
                    {house.bathrooms !== 1 ? "s" : ""}
                  </span>
                )}
                {house.area_sqm !== undefined && (
                  <span className="flex items-center gap-1.5">
                    <SquareCode className="h-4 w-4" /> {house.area_sqm} m²
                  </span>
                )}
                {house.parking !== undefined && house.parking > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Car className="h-4 w-4" /> {house.parking} parking
                  </span>
                )}
                {house.tanker !== undefined && (
                  <span className="flex items-center gap-1.5">
                    <Droplets className="h-4 w-4" />
                    {house.tanker ? "Tanker included" : "No tanker"}
                  </span>
                )}
              </div>

              <div className="h-px bg-border/50 w-full mb-8" />

              {/* Description */}
              <div className="space-y-3 mb-10">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                  Description
                </h3>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  {house.description ||
                    "No description provided for this house."}
                </p>
              </div>

              <Button
                asChild
                className="h-14 px-10 rounded-2xl bg-primary text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
              >
                <a
                  href={`mailto:${house.owner?.email ?? "contact@digitalbroker.et"}?subject=Inquiry: ${encodeURIComponent(house.title)}`}
                >
                  Contact Agent
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Chat />
    </div>
  );
}
