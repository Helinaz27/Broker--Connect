// client/src/components/carListings/CarListings.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  useSearchMyListingsQuery,
  useUpdateListingStatusMutation,
  type Listing,
  type ListingQueryParams,
} from "@/store/apis/listingsApi";
import ListingsTable from "@/components/ListingsTable";

interface CarListingsProps {
  queryParams?: ListingQueryParams;
}

export default function CarListings({ queryParams }: CarListingsProps) {
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useSearchMyListingsQuery({
    ...queryParams,
    listingType: "car",
  });

  const [updateStatus] = useUpdateListingStatusMutation();

  const listings = data?.data?.listings ?? [];

  const toTableRow = (l: Listing) => ({
    id: l.id,
    title: l.title,
    price: l.price,
    location: l.location?.fullAddress ?? l.location?.city ?? "—",
    mode: l.listingMode,
    status: l.status as any,
    createdAt: l.createdAt,
  });

  const handleView = (id: string) => router.push(`/car-listings/${id}`);
  const handleEdit = (id: string) =>
    router.push(`/dashboard/listings/${id}/edit`);
  const handleToggleStatus = async (id: string) => {
    const listing = listings.find((l) => l.id === id);
    if (!listing) return;
    const next = listing.status === "active" ? "inactive" : "active";
    await updateStatus({ id, status: next });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        Loading car listings…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-sm text-muted-foreground">
        <p>Failed to load car listings.</p>
        <button
          onClick={refetch}
          className="underline underline-offset-4 hover:text-foreground transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <ListingsTable
      listings={listings.map(toTableRow)}
      category="car"
      showMode
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleToggleStatus}
    />
  );
}
