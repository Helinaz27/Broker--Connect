// app/dashboard/cars/manage/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InventoryTable } from "@/components/dashboard/InventoryTable";
import { useGetMyListingsQuery } from "@/store/apis/listingsApi";

export default function CarManagePage() {
  const router = useRouter();
  const { data: myListingsData } = useGetMyListingsQuery();

  const listings = (myListingsData?.data?.listings ?? [])
    .filter((l) => l.listingType === "car")
    .map((l) => ({
      id: l.id,
      title: l.title,
      price: l.price,
      location: l.location?.fullAddress ?? l.location?.city ?? "—",
      image: l.images?.[0],
      status: l.status as "active" | "occupied" | "inactive",
      category: "car" as const,
    }));

  return (
    <div className="animate-in">
      <div className="md:hidden flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="font-bold text-lg">Broker Console</h1>
      </div>

      <InventoryTable
        activeTab="car_view"
        setActiveTab={() => router.push("/dashboard/cars/post")}
        listings={listings}
      />
    </div>
  );
}
