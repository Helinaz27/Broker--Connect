"use client";

import ListingCard from "@/components/ListingCard";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageProvider";

interface Listing {
  id: string;
  title: string;
  image?: string;
  images?: string[];
  price: number;
  location: string;
  category: "house" | "car" | "otherService" | "service";
  listingMode?: "rent" | "sell";
}

interface ListingsGridProps {
  listings: Listing[];
  emptyMessage?: string;
  className?: string;
}

export default function ListingsGrid({
  listings,
  emptyMessage,
  className,
}: ListingsGridProps) {
  const { t } = useLanguage();
  const message = emptyMessage ?? t("common.noListingsFound");
  if (listings.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground text-center">{message}</p>
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
          category={listing.category}
          listingMode={listing.listingMode}
        />
      ))}
    </div>
  );
}
