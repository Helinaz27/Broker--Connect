"use client";

import { useParams, useRouter } from "next/navigation";
import Chat from "@/components/Chat";
import { Button } from "@/components/ui/button";
import { getHouseById } from "@/data/listings";
import { MapPin, ArrowLeft, Star, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function HouseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const house = id ? getHouseById(id) : null;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!house) {
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

  // Use multiple images if available, otherwise repeat single image
  const images = house.images && house.images.length > 0 
    ? house.images 
    : [house.image, house.image, house.image, house.image];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link
            href="/house-listings"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to houses
          </Link>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Image Gallery */}
            <div className="md:col-span-2">
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative bg-muted rounded-lg overflow-hidden aspect-video group">
                  <img
                    src={images[currentImageIndex]}
                    alt={house.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-background/90 text-xs font-medium uppercase tracking-wider px-2 py-1 rounded">
                    House
                  </span>

                  {/* Navigation Buttons */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  {images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-background/80 text-xs font-medium px-2 py-1 rounded">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                          idx === currentImageIndex
                            ? "border-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${house.title} - ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Details Sidebar */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                    <span className="font-semibold text-foreground">
                      {house.rating}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{house.location}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Price</p>
                  <p className="text-3xl font-bold text-primary">
                    {house.price.toLocaleString()}
                    <span className="text-base font-normal text-muted-foreground">
                      {" "}
                      Birr/mo
                    </span>
                  </p>
                </div>

                <Button asChild className="w-full">
                  <a
                    href={`mailto:contact@digitalbroker.example.com?subject=Inquiry: ${encodeURIComponent(
                      house.title
                    )}`}
                  >
                    Contact Landlord
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-12 bg-card border border-border rounded-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {house.title}
            </h2>
            {house.description && (
              <p className="text-muted-foreground leading-relaxed text-lg">
                {house.description}
              </p>
            )}
          </div>
        </div>
      </main>
      <Chat />
    </div>
  );
}
