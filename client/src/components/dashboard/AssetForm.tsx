// client/src/components/dashboard/AssetForm.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Plus,
  X,
  Upload,
  AlertTriangle,
  Coins,
  ShieldCheck,
} from "lucide-react";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useCreateListingMutation } from "@/store/apis/listingsApi";
import { toast } from "sonner";

// ─── form state shapes ────────────────────────────────────────────────────────
export interface HouseFormState {
  title: string;
  description: string;
  price: string;
  locationCity: string;
  locationPlaceName: string;
  locationSubCity: string;
  lat: string;
  lng: string;
  houseType: string;
  bedrooms: string;
  bathrooms: string;
  area_sqm: string;
  listingMode: "rent" | "sell";
  tanker: boolean;
  rentalPeriod: "daily" | "weekly" | "monthly" | "yearly";
  parking: string;
  durationDays: string;
  images: File[];
}

export interface CarFormState {
  title: string;
  description: string;
  price: string;
  locationCity: string;
  locationPlaceName: string;
  locationSubCity: string;
  lat: string;
  lng: string;
  brand: string;
  carModel: string;
  carType: "electric" | "fuel";
  condition: "used" | "new";
  listingMode: "rent" | "sell";
  rentalPeriod: "daily" | "weekly" | "monthly" | "yearly";
  durationDays: string;
  images: File[];
}

export interface ServiceFormState {
  title: string;
  description: string;
  price: string;
  locationCity: string;
  locationPlaceName: string;
  locationSubCity: string;
  lat: string;
  lng: string;
  serviceType: string;
  rentalPeriod: "daily" | "weekly" | "monthly" | "yearly";
  durationDays: string;
  images: File[];
}

interface AssetFormProps {
  activeTab: "house_post" | "car_post" | "service_post";
  houseForm: HouseFormState;
  setHouseForm: React.Dispatch<React.SetStateAction<HouseFormState>>;
  carForm: CarFormState;
  setCarForm: React.Dispatch<React.SetStateAction<CarFormState>>;
  serviceForm: ServiceFormState;
  setServiceForm: React.Dispatch<React.SetStateAction<ServiceFormState>>;
  onSuccess?: () => void;
}

// ─── guard banner ─────────────────────────────────────────────────────────────
function GuardBanner({
  icon: Icon,
  title,
  message,
  color,
}: {
  icon: React.ElementType;
  title: string;
  message: string;
  color: string;
}) {
  return (
    <div className={`flex items-start gap-4 p-5 rounded-2xl border ${color}`}>
      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-bold mb-0.5">{title}</p>
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export function AssetForm({
  activeTab,
  houseForm,
  setHouseForm,
  carForm,
  setCarForm,
  serviceForm,
  setServiceForm,
  onSuccess,
}: AssetFormProps) {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [createListing, { isLoading }] = useCreateListingMutation();

  const isHouse = activeTab === "house_post";
  const isCar = activeTab === "car_post";
  const isService = activeTab === "service_post";

  const currentForm = isHouse ? houseForm : isCar ? carForm : serviceForm;
  const setForm = isHouse
    ? (setHouseForm as React.Dispatch<React.SetStateAction<any>>)
    : isCar
      ? (setCarForm as React.Dispatch<React.SetStateAction<any>>)
      : (setServiceForm as React.Dispatch<React.SetStateAction<any>>);

  const handleChange = (key: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [key]: value }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      handleChange("images", [
        ...((currentForm as any).images || []),
        ...newImages,
      ]);
    }
  };

  const removeImage = (index: number) => {
    const updated = [...((currentForm as any).images || [])];
    updated.splice(index, 1);
    handleChange("images", updated);
  };

  // ── guards ──────────────────────────────────────────────────────────────────
  const isKycVerified = currentUser?.isKYCVerified ?? false;
  const coins = currentUser?.coins ?? 0;

  if (!isKycVerified) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in">
        <h1 className="text-3xl font-bold">
          {isHouse ? "Post House" : isCar ? "List Car" : "Offer Service"}
        </h1>
        <GuardBanner
          icon={ShieldCheck}
          title="KYC Verification Required"
          message="You must complete identity verification before posting a listing. Go to your profile and submit your KYC documents."
          color="border-amber-500/30 bg-amber-500/5 text-amber-600"
        />
      </div>
    );
  }

  if (coins <= 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in">
        <h1 className="text-3xl font-bold">
          {isHouse ? "Post House" : isCar ? "List Car" : "Offer Service"}
        </h1>
        <GuardBanner
          icon={Coins}
          title="Insufficient Coins"
          message="You need coins to post a listing. Purchase coins from the wallet section to continue."
          color="border-blue-500/30 bg-blue-500/5 text-blue-600"
        />
      </div>
    );
  }

  // ── submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const images = (currentForm as any).images as File[];
    if (!images || images.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }

    const location = {
      city: (currentForm as any).locationCity,
      placeName: (currentForm as any).locationPlaceName,
      ...((currentForm as any).locationSubCity && {
        subCity: (currentForm as any).locationSubCity,
      }),
      ...((currentForm as any).lat &&
        (currentForm as any).lng && {
          coordinates: {
            lat: parseFloat((currentForm as any).lat),
            lng: parseFloat((currentForm as any).lng),
          },
        }),
    };

    const base = {
      title: (currentForm as any).title,
      description: (currentForm as any).description,
      price: parseFloat((currentForm as any).price),
      location,
      durationDays: parseInt((currentForm as any).durationDays || "30"),
      images,
    };

    try {
      if (isHouse) {
        await createListing({
          ...base,
          listingType: "house",
          listingMode: houseForm.listingMode,
          houseType: houseForm.houseType,
          bedrooms: parseInt(houseForm.bedrooms),
          bathrooms: parseInt(houseForm.bathrooms),
          area_sqm: parseInt(houseForm.area_sqm),
          tanker: houseForm.tanker,
          parking: houseForm.parking ? parseInt(houseForm.parking) : undefined,
          ...(houseForm.listingMode === "rent" && {
            rentalPeriod: houseForm.rentalPeriod,
          }),
        }).unwrap();
      } else if (isCar) {
        await createListing({
          ...base,
          listingType: "car",
          listingMode: carForm.listingMode,
          carType: carForm.carType,
          condition: carForm.condition,
          brand: carForm.brand,
          carModel: carForm.carModel,
          ...(carForm.listingMode === "rent" && {
            rentalPeriod: carForm.rentalPeriod,
          }),
        }).unwrap();
      } else {
        await createListing({
          ...base,
          listingType: "service",
          serviceType: serviceForm.serviceType,
          rentalPeriod: serviceForm.rentalPeriod,
        }).unwrap();
      }

      toast.success("Listing published successfully!");
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to publish listing.");
    }
  };

  // ── styles ──────────────────────────────────────────────────────────────────
  const labelStyle =
    "text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1";
  const inputStyle =
    "w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary/10 outline-none transition-all";

  return (
    <div className="max-w-4xl mx-auto animate-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isHouse ? "Post House" : isCar ? "List Car" : "Offer Service"}
        </h1>
        <p className="text-muted-foreground font-medium">
          Complete the asset dossier for global marketplace publishing.
        </p>
        {/* Coin balance indicator */}
        <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold">
          <Coins className="h-3.5 w-3.5" />
          {coins} coins available
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-3xl p-8 shadow-soft space-y-8"
      >
        {/* Title, Price, Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-2">
            <label className={labelStyle}>Asset Title</label>
            <input
              type="text"
              value={(currentForm as any).title}
              onChange={(e) => handleChange("title", e.target.value)}
              className={inputStyle}
              placeholder="e.g. Modern Villa in Bole"
              required
            />
          </div>
          <div className="space-y-2">
            <label className={labelStyle}>Price (Br)</label>
            <input
              type="number"
              value={(currentForm as any).price}
              onChange={(e) => handleChange("price", e.target.value)}
              className={inputStyle}
              placeholder="0.00"
              required
            />
          </div>
          <div className="space-y-2">
            <label className={labelStyle}>Duration (days)</label>
            <input
              type="number"
              min={1}
              value={(currentForm as any).durationDays}
              onChange={(e) => handleChange("durationDays", e.target.value)}
              className={inputStyle}
              placeholder="30"
              required
            />
          </div>
        </div>

        {/* Listing Mode for house & car */}
        {!isService && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={labelStyle}>Listing Mode</label>
              <select
                className={inputStyle}
                value={(currentForm as any).listingMode}
                onChange={(e) => handleChange("listingMode", e.target.value)}
              >
                <option value="rent">For Rent</option>
                <option value="sell">For Sale</option>
              </select>
            </div>
            {(currentForm as any).listingMode === "rent" && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <label className={labelStyle}>Rental Period</label>
                <select
                  className={inputStyle}
                  value={(currentForm as any).rentalPeriod}
                  onChange={(e) => handleChange("rentalPeriod", e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <label className={labelStyle}>Detailed Description</label>
          <textarea
            value={(currentForm as any).description}
            onChange={(e) => handleChange("description", e.target.value)}
            className={`${inputStyle} h-32 resize-none`}
            placeholder="Provide comprehensive details about the asset..."
            required
          />
        </div>

        {/* Location */}
        <div className="space-y-4 pt-6 border-t border-border">
          <h3 className="text-sm font-bold text-foreground italic">
            Location Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={labelStyle}>City</label>
              <input
                type="text"
                value={(currentForm as any).locationCity}
                onChange={(e) => handleChange("locationCity", e.target.value)}
                className={inputStyle}
                placeholder="e.g. Addis Ababa"
                required
              />
            </div>
            <div className="space-y-2">
              <label className={labelStyle}>Place Name</label>
              <input
                type="text"
                value={(currentForm as any).locationPlaceName}
                onChange={(e) =>
                  handleChange("locationPlaceName", e.target.value)
                }
                className={inputStyle}
                placeholder="e.g. Bole Atlas"
                required
              />
            </div>
            <div className="space-y-2">
              <label className={labelStyle}>Sub City (Optional)</label>
              <input
                type="text"
                value={(currentForm as any).locationSubCity}
                onChange={(e) =>
                  handleChange("locationSubCity", e.target.value)
                }
                className={inputStyle}
                placeholder="e.g. Bole"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelStyle}>Latitude (Opt)</label>
                <input
                  type="text"
                  value={(currentForm as any).lat}
                  onChange={(e) => handleChange("lat", e.target.value)}
                  className={inputStyle}
                  placeholder="9.01"
                />
              </div>
              <div className="space-y-2">
                <label className={labelStyle}>Longitude (Opt)</label>
                <input
                  type="text"
                  value={(currentForm as any).lng}
                  onChange={(e) => handleChange("lng", e.target.value)}
                  className={inputStyle}
                  placeholder="38.75"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Type-specific fields */}
        <div className="pt-6 border-t border-border">
          <h3 className="text-sm font-bold text-foreground italic mb-6">
            Asset Specifics
          </h3>

          {isHouse && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
              <div className="space-y-2">
                <label className={labelStyle}>House Type</label>
                <select
                  className={inputStyle}
                  value={houseForm.houseType}
                  onChange={(e) => handleChange("houseType", e.target.value)}
                >
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="condominium">Condominium</option>
                  <option value="business">Business</option>
                  <option value="others">Others</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelStyle}>Bedrooms</label>
                <input
                  type="number"
                  min={0}
                  value={houseForm.bedrooms}
                  onChange={(e) => handleChange("bedrooms", e.target.value)}
                  className={inputStyle}
                />
              </div>
              <div className="space-y-2">
                <label className={labelStyle}>Bathrooms</label>
                <input
                  type="number"
                  min={0}
                  value={houseForm.bathrooms}
                  onChange={(e) => handleChange("bathrooms", e.target.value)}
                  className={inputStyle}
                />
              </div>
              <div className="space-y-2">
                <label className={labelStyle}>Area (sqm)</label>
                <input
                  type="number"
                  min={1}
                  value={houseForm.area_sqm}
                  onChange={(e) => handleChange("area_sqm", e.target.value)}
                  className={inputStyle}
                />
              </div>
              <div className="space-y-2">
                <label className={labelStyle}>Parking Slots</label>
                <input
                  type="number"
                  min={0}
                  value={houseForm.parking}
                  onChange={(e) => handleChange("parking", e.target.value)}
                  className={inputStyle}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center gap-4 h-full pt-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={houseForm.tanker}
                    onChange={(e) => handleChange("tanker", e.target.checked)}
                    className="h-5 w-5 rounded border-border text-primary focus:ring-primary/20"
                  />
                  <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-widest">
                    Water Tanker
                  </span>
                </label>
              </div>
            </div>
          )}

          {isCar && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
              <div className="space-y-2">
                <label className={labelStyle}>Brand</label>
                <input
                  type="text"
                  value={carForm.brand}
                  onChange={(e) => handleChange("brand", e.target.value)}
                  className={inputStyle}
                  placeholder="e.g. Toyota"
                />
              </div>
              <div className="space-y-2">
                <label className={labelStyle}>Model</label>
                <input
                  type="text"
                  value={carForm.carModel}
                  onChange={(e) => handleChange("carModel", e.target.value)}
                  className={inputStyle}
                  placeholder="e.g. Land Cruiser"
                />
              </div>
              <div className="space-y-2">
                <label className={labelStyle}>Car Type</label>
                <select
                  className={inputStyle}
                  value={carForm.carType}
                  onChange={(e) => handleChange("carType", e.target.value)}
                >
                  <option value="fuel">Fuel (ICE)</option>
                  <option value="electric">Electric (EV)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelStyle}>Condition</label>
                <select
                  className={inputStyle}
                  value={carForm.condition}
                  onChange={(e) => handleChange("condition", e.target.value)}
                >
                  <option value="new">Brand New</option>
                  <option value="used">Used</option>
                </select>
              </div>
            </div>
          )}

          {isService && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
              <div className="space-y-2">
                <label className={labelStyle}>Service Category</label>
                <select
                  className={inputStyle}
                  value={serviceForm.serviceType}
                  onChange={(e) => handleChange("serviceType", e.target.value)}
                >
                  <option value="plumber">Plumbing</option>
                  <option value="electrician">Electrical</option>
                  <option value="catering">Catering</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="security">Security</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelStyle}>Rental Period</label>
                <select
                  className={inputStyle}
                  value={serviceForm.rentalPeriod}
                  onChange={(e) => handleChange("rentalPeriod", e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Image Upload */}
        <div className="pt-6 border-t border-border space-y-4">
          <label className={labelStyle}>Visual Assets (Images)</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {((currentForm as any).images as File[])?.map(
              (img: File, index: number) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-border group"
                >
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`Preview ${index}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ),
            )}
            <label className="aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Upload
              </span>
            </label>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Plus className="h-4 w-4" />
          {isLoading ? "Publishing…" : "Publish Asset to Marketplace"}
        </Button>
      </form>
    </div>
  );
}
