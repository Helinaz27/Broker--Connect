// client/src/components/ListingsGrid.tsx
"use client";

import ListingCard from "@/components/ListingCard";
import { cn } from "@/lib/utils";

interface Listing {
  id: string;
  title: string;
  /** Primary image URL. If omitted, falls back to images[0] or placeholder. */
  image?: string;
  /** Full images array from the API. */
  images?: string[];
  price: number;
  location: string;
  rating?: number;
  description?: string;
  category: "house" | "car" | "otherService" | "service";
}

interface ListingsGridProps {
  listings: Listing[];
  emptyMessage?: string;
  className?: string;
}

export default function ListingsGrid({
  listings,
  emptyMessage = "No listings found",
  className,
}: ListingsGridProps) {
  if (listings.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground text-center">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
        className,
      )}
    >
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          id={listing.id}
          title={listing.title}
          image={listing.image ?? listing.images?.[0] ?? "/placeholder.jpg"}
          price={listing.price}
          location={listing.location}
          rating={listing.rating}
          category={listing.category}
        />
      ))}
    </div>
  );
}
