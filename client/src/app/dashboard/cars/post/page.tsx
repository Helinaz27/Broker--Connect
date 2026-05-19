// app/dashboard/cars/post/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssetForm, type CarFormState } from "@/components/dashboard/AssetForm";

const defaultCarForm: CarFormState = {
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
  carType: "fuel",
  condition: "used",
  listingMode: "rent",
  rentalPeriod: "monthly",
  durationDays: "30",
  images: [],
};

const stubHouseForm = {
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
  listingMode: "rent" as const,
  tanker: false,
  rentalPeriod: "monthly" as const,
  parking: "",
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

export default function CarPostPage() {
  const router = useRouter();
  const [carForm, setCarForm] = useState<CarFormState>(defaultCarForm);

  return (
    <div className="animate-in">
      <div className="md:hidden flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="font-bold text-lg">Broker Console</h1>
      </div>

      <AssetForm
        activeTab="car_post"
        houseForm={stubHouseForm}
        setHouseForm={() => {}}
        carForm={carForm}
        setCarForm={setCarForm}
        serviceForm={stubServiceForm}
        setServiceForm={() => {}}
        onSuccess={() => router.push("/dashboard/cars/manage")}
      />
    </div>
  );
}
