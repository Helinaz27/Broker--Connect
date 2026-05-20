"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetListingByIdQuery } from "@/store/apis/listingsApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Chat from "@/components/Chat";
import ContactSection from "@/components/ContactSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Zap,
  Fuel,
  Car,
  Gauge,
} from "lucide-react";
import Link from "next/link";

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isAuthenticated = useSelector((s: RootState) => s.user.isAuthenticated);

  const { data, isLoading, isError } = useGetListingByIdQuery(id, {
    skip: !id,
  });

  const car = data?.data?.listing;
  const hasContactAccess = isAuthenticated;

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  if (isError || !car) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 container px-4 py-16 text-center">
          <p className="text-muted-foreground mb-4">Car not found.</p>
          <Button variant="outline" onClick={() => router.back()}>
            Go back
          </Button>
        </main>
      </div>
    );
  }

  const images =
    car.images && car.images.length > 0 ? car.images : ["/placeholder.jpg"];

  const nextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const fullAddress =
    car.location?.fullAddress ??
    [car.location?.placeName, car.location?.subCity, car.location?.city]
      .filter(Boolean)
      .join(", ");

  const hasSpecs =
    car.carType !== undefined ||
    car.condition !== undefined ||
    car.brand !== undefined ||
    car.carModel !== undefined;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-8 md:py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <Link
            href="/car-listings"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4" /> Back to cars
          </Link>

          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-glass">
            <div className="aspect-[16/10] bg-muted relative overflow-hidden">
              <img
                src={images[currentImageIndex]}
                alt={car.title}
                className="w-full h-full object-cover transition-opacity duration-300"
              />

              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-background/90 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/20">
                  Car
                </span>
                {car.listingMode && (
                  <Badge
                    variant="outline"
                    className={
                      car.listingMode === "rent"
                        ? "bg-blue-500/90 text-white border-0 text-[10px] uppercase tracking-widest"
                        : "bg-green-500/90 text-white border-0 text-[10px] uppercase tracking-widest"
                    }
                  >
                    {car.listingMode}
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
                      alt={`${car.title} image ${i + 1}`}
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
                {car.condition && (
                  <span className="capitalize text-xs bg-muted px-2 py-1 rounded-md">
                    {car.condition}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
                {car.title}
              </h1>

              <p className="text-3xl font-bold text-primary mb-6">
                {car.price.toLocaleString()}{" "}
                <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  Br{car.rentalPeriod ? ` / ${car.rentalPeriod}` : ""}
                </span>
              </p>

              {hasSpecs && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                  {car.brand && (
                    <div className="flex flex-col items-center gap-1.5 bg-muted/50 rounded-xl px-3 py-4 border border-border">
                      <Car className="h-5 w-5 text-primary" />
                      <span className="text-base font-bold text-foreground capitalize">
                        {car.brand}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Brand
                      </span>
                    </div>
                  )}
                  {car.carModel && (
                    <div className="flex flex-col items-center gap-1.5 bg-muted/50 rounded-xl px-3 py-4 border border-border">
                      <Gauge className="h-5 w-5 text-primary" />
                      <span className="text-base font-bold text-foreground capitalize">
                        {car.carModel}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Model
                      </span>
                    </div>
                  )}
                  {car.carType && (
                    <div className="flex flex-col items-center gap-1.5 bg-muted/50 rounded-xl px-3 py-4 border border-border">
                      {car.carType === "electric" ? (
                        <Zap className="h-5 w-5 text-primary" />
                      ) : (
                        <Fuel className="h-5 w-5 text-primary" />
                      )}
                      <span className="text-base font-bold text-foreground capitalize">
                        {car.carType}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Fuel Type
                      </span>
                    </div>
                  )}
                  {car.condition && (
                    <div className="flex flex-col items-center gap-1.5 bg-muted/50 rounded-xl px-3 py-4 border border-border">
                      <Car className="h-5 w-5 text-primary" />
                      <span className="text-base font-bold text-foreground capitalize">
                        {car.condition}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Condition
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
                  {car.description || "No description provided for this car."}
                </p>
              </div>

              <ContactSection
                listingId={car.id}
                listingTitle={car.title}
                coinCost={car.contactCoinLimit}
                hasContactAccess={hasContactAccess}
                ownerPhone={car.owner?.phone}
                ownerEmail={car.owner?.email}
                isAuthenticated={isAuthenticated}
              />
            </div>
          </div>
        </div>
      </main>
      <Chat />
    </div>
  );
}
