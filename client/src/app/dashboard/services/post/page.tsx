// app/dashboard/services/post/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AssetForm,
  type ServiceFormState,
} from "@/components/dashboard/AssetForm";

const defaultServiceForm: ServiceFormState = {
  title: "",
  description: "",
  price: "",
  locationCity: "",
  locationPlaceName: "",
  locationSubCity: "",
  lat: "",
  lng: "",
  serviceType: "plumber",
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

export default function ServicePostPage() {
  const router = useRouter();
  const [serviceForm, setServiceForm] =
    useState<ServiceFormState>(defaultServiceForm);

  return (
    <div className="animate-in">
      <div className="md:hidden flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="font-bold text-lg">Broker Console</h1>
      </div>

      <AssetForm
        activeTab="service_post"
        houseForm={stubHouseForm}
        setHouseForm={() => {}}
        carForm={stubCarForm}
        setCarForm={() => {}}
        serviceForm={serviceForm}
        setServiceForm={setServiceForm}
        onSuccess={() => router.push("/dashboard/services/manage")}
      />
    </div>
  );
}
