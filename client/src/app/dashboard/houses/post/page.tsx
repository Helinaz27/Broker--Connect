// app/dashboard/houses/post/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AssetForm,
  type HouseFormState,
} from "@/components/dashboard/AssetForm";

const defaultHouseForm: HouseFormState = {
  title: "",
  description: "",
  price: "",
  locationCity: "",
  locationPlaceName: "",
  locationSubCity: "",
  lat: "",
  lng: "",
  houseType: "apartment",
  bedrooms: "",
  bathrooms: "",
  area_sqm: "",
  listingMode: "rent",
  tanker: false,
  rentalPeriod: "monthly",
  parking: "",
  durationDays: "30",
  images: [],
};

// Stub defaults for required AssetForm props (unused on this page)
const stubCarForm = {
  title: "",
  description: "",
  price: "",
  locationCity: "",
  locationPlaceName: "",
  locationSubCity: "",
  lat: "",
  lng: "",
  brand: "",
  carModel: "",
  carType: "fuel" as const,
  condition: "used" as const,
  listingMode: "rent" as const,
  rentalPeriod: "monthly" as const,
  durationDays: "30",
  images: [],
};
const stubServiceForm = {
  title: "",
  description: "",
  price: "",
  locationCity: "",
  locationPlaceName: "",
  locationSubCity: "",
  lat: "",
  lng: "",
  serviceType: "plumber",
  rentalPeriod: "monthly" as const,
  durationDays: "30",
  images: [],
};

export default function HousePostPage() {
  const router = useRouter();
  const [houseForm, setHouseForm] = useState<HouseFormState>(defaultHouseForm);

  return (
    <div className="animate-in">
      {/* Mobile header */}
      <div className="md:hidden flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="font-bold text-lg">Broker Console</h1>
      </div>

      <AssetForm
        activeTab="house_post"
        houseForm={houseForm}
        setHouseForm={setHouseForm}
        carForm={stubCarForm}
        setCarForm={() => {}}
        serviceForm={stubServiceForm}
        setServiceForm={() => {}}
        onSuccess={() => router.push("/dashboard/houses/manage")}
      />
    </div>
  );
}
