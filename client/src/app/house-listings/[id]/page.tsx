"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetListingByIdQuery } from "@/store/apis/listingsApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import ContactSection from "@/components/ContactSection";
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

  const isAuthenticated = useSelector((s: RootState) => s.user.isAuthenticated);

  const { data, isLoading, isError } = useGetListingByIdQuery(id, {
    skip: !id,
  });

  const house = data?.data?.listing;
  const hasContactAccess = (data as any)?.data?.hasContactAccess ?? false;

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

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

  const hasSpecs =
    house.bedrooms !== undefined ||
    house.bathrooms !== undefined ||
    house.area_sqm !== undefined ||
    (house.parking !== undefined && house.parking > 0) ||
    house.tanker !== undefined;

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
            <div className="aspect-[16/10] bg-muted relative overflow-hidden">
              <img
                src={images[currentImageIndex]}
                alt={house.title}
                className="w-full h-full object-cover transition-opacity duration-300"
              />

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

            {images.length > 1 && (
              <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-muted/30 border-b border-border scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                      i === currentImageIndex
                        ? "border-primary opacity-100"
                        : "border-transparent opacity-50 hover:opacity-80"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${house.title} image ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="p-8 md:p-12">
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

              <p className="text-3xl font-bold text-primary mb-6">
                {house.price.toLocaleString()}{" "}
                <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  Br{house.rentalPeriod ? ` / ${house.rentalPeriod}` : ""}
                </span>
              </p>

              {hasSpecs && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
                  {house.bedrooms !== undefined && (
                    <div className="flex flex-col items-center gap-1.5 bg-muted/50 rounded-xl px-3 py-4 border border-border">
                      <Bed className="h-5 w-5 text-primary" />
                      <span className="text-base font-bold text-foreground">
                        {house.bedrooms}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Bedroom{house.bedrooms !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                  {house.bathrooms !== undefined && (
                    <div className="flex flex-col items-center gap-1.5 bg-muted/50 rounded-xl px-3 py-4 border border-border">
                      <Bath className="h-5 w-5 text-primary" />
                      <span className="text-base font-bold text-foreground">
                        {house.bathrooms}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Bathroom{house.bathrooms !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                  {house.area_sqm !== undefined && (
                    <div className="flex flex-col items-center gap-1.5 bg-muted/50 rounded-xl px-3 py-4 border border-border">
                      <SquareCode className="h-5 w-5 text-primary" />
                      <span className="text-base font-bold text-foreground">
                        {house.area_sqm}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        m²
                      </span>
                    </div>
                  )}
                  {house.parking !== undefined && house.parking > 0 && (
                    <div className="flex flex-col items-center gap-1.5 bg-muted/50 rounded-xl px-3 py-4 border border-border">
                      <Car className="h-5 w-5 text-primary" />
                      <span className="text-base font-bold text-foreground">
                        {house.parking}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Parking
                      </span>
                    </div>
                  )}
                  {house.tanker !== undefined && (
                    <div className="flex flex-col items-center gap-1.5 bg-muted/50 rounded-xl px-3 py-4 border border-border">
                      <Droplets className="h-5 w-5 text-primary" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Tanker
                      </span>
                      <span className="text-thin text-sm text-muted-foreground">
                        {house.tanker ? "included" : "not included"}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="h-px bg-border/50 w-full mb-8" />

              <div className="space-y-3 mb-10">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                  Description
                </h3>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  {house.description ||
                    "No description provided for this house."}
                </p>
              </div>

              <ContactSection
                listingId={house.id}
                listingTitle={house.title}
                coinCost={house.contactCoinLimit}
                hasContactAccess={hasContactAccess}
                ownerPhone={house.owner?.phone}
                ownerId={house.owner?.id}
                ownerEmail={house.owner?.email}
                isAuthenticated={isAuthenticated}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
