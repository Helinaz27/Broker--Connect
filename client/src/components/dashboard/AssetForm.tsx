"use client";

import { Button } from "@/components/ui/button";
import {
  Plus,
  X,
  Upload,
  Coins,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useCreateListingMutation } from "@/store/apis/listingsApi";
import { useSearchPlatformFeesQuery } from "@/store/apis/platformFeeApi";
import { useInitiateChapaMutation } from "@/store/apis/paymentApi";
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
  // FIX: must be a concrete string, never undefined
  listingMode: "rent" | "sell";
  tanker: boolean;
  rentalPeriod: "daily" | "weekly" | "monthly" | "yearly";
  parking: string;
  durationDays: string;
  contactCoinLimit: string;
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
  // FIX: must be a concrete string, never undefined
  listingMode: "rent" | "sell";
  rentalPeriod: "daily" | "weekly" | "monthly" | "yearly";
  durationDays: string;
  contactCoinLimit: string;
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
  // FIX: must be a concrete string, never undefined
  rentalPeriod: "daily" | "weekly" | "monthly" | "yearly";
  durationDays: string;
  contactCoinLimit: string;
  images: File[];
}

// ─── Default initial values (export so the parent can use them) ───────────────
// All select-bound fields MUST have a concrete default so React never
// switches a select from uncontrolled → controlled, which freezes the UI.

export const defaultHouseForm: HouseFormState = {
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
  listingMode: "rent", // concrete default
  tanker: false,
  rentalPeriod: "monthly", // concrete default
  parking: "",
  durationDays: "",
  contactCoinLimit: "",
  images: [],
};

export const defaultCarForm: CarFormState = {
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
  carType: "fuel", // concrete default
  condition: "used", // concrete default
  listingMode: "rent", // concrete default
  rentalPeriod: "daily", // concrete default
  durationDays: "",
  contactCoinLimit: "",
  images: [],
};

export const defaultServiceForm: ServiceFormState = {
  title: "",
  description: "",
  price: "",
  locationCity: "",
  locationPlaceName: "",
  locationSubCity: "",
  lat: "",
  lng: "",
  serviceType: "plumber", // concrete default
  rentalPeriod: "monthly", // concrete default
  durationDays: "",
  contactCoinLimit: "",
  images: [],
};

// ─── Buy Coins Modal ──────────────────────────────────────────────────────────

function BuyCoinsModal({ onClose }: { onClose: () => void }) {
  const [coinsRequested, setCoinsRequested] = useState(100);
  const [initiateChapa, { isLoading }] = useInitiateChapaMutation();

  const packages = [
    { coins: 50, label: "Starter" },
    { coins: 100, label: "Basic" },
    { coins: 250, label: "Popular" },
    { coins: 500, label: "Pro" },
  ];

  const COIN_PRICE_IN_BIRR = 1;
  const totalBirr = coinsRequested * COIN_PRICE_IN_BIRR;

  const handleBuy = async () => {
    if (coinsRequested < 1) {
      toast.error("Please enter a valid coin amount.");
      return;
    }
    try {
      const result = await initiateChapa({ coinsRequested }).unwrap();
      if (result.data?.checkout_url) {
        window.location.href = result.data.checkout_url;
      }
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to initiate payment.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Coins className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Buy Coins</h2>
              <p className="text-xs text-muted-foreground">
                Paid via Chapa · ETB
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {packages.map((pkg) => (
            <button
              key={pkg.coins}
              onClick={() => setCoinsRequested(pkg.coins)}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl border text-xs font-bold transition-all ${
                coinsRequested === pkg.coins
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              <span className="text-base font-extrabold">{pkg.coins}</span>
              <span className="uppercase tracking-widest text-[9px]">
                {pkg.label}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Custom Amount
          </label>
          <input
            type="number"
            min={1}
            value={coinsRequested}
            onChange={(e) =>
              setCoinsRequested(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary/10 outline-none transition-all"
            placeholder="Enter coin amount"
          />
        </div>

        <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              You Pay
            </p>
            <p className="text-2xl font-extrabold text-foreground">
              {totalBirr.toLocaleString()}{" "}
              <span className="text-sm font-bold text-muted-foreground">
                ETB
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              You Get
            </p>
            <p className="text-2xl font-extrabold text-primary">
              {coinsRequested.toLocaleString()}{" "}
              <span className="text-sm font-bold">coins</span>
            </p>
          </div>
        </div>

        <Button
          onClick={handleBuy}
          disabled={isLoading || coinsRequested < 1}
          className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-xs gap-2 disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting…
            </>
          ) : (
            <>
              <Coins className="h-4 w-4" />
              Proceed to Payment
            </>
          )}
        </Button>

        <p className="text-center text-[10px] text-muted-foreground">
          Powered by Chapa · Secure payment gateway
        </p>
      </div>
    </div>
  );
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

// ─── coin cost preview panel ──────────────────────────────────────────────────

function CoinCostPreview({
  estimatedCost,
  userCoins,
  durationDays,
  isFeeLoading,
  isFeeError,
  noFeeFound,
  onBuyCoins,
}: {
  estimatedCost: number | null;
  userCoins: number;
  durationDays: number;
  isFeeLoading: boolean;
  isFeeError: boolean;
  noFeeFound: boolean;
  onBuyCoins: () => void;
}) {
  if (isFeeLoading) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-muted/20">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Calculating posting cost…
        </span>
      </div>
    );
  }

  if (isFeeError || noFeeFound) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-2xl border border-destructive/30 bg-destructive/5">
        <AlertCircle className="h-4 w-4 mt-0.5 text-destructive flex-shrink-0" />
        <p className="text-sm text-destructive">
          No active posting fee configured for this listing type. Please contact
          admin.
        </p>
      </div>
    );
  }

  if (estimatedCost === null) return null;

  const hasEnough = userCoins >= estimatedCost;
  const shortfall = estimatedCost - userCoins;

  return (
    <div
      className={`rounded-2xl border p-5 space-y-4 transition-colors ${
        hasEnough
          ? "border-green-500/30 bg-green-500/5"
          : "border-destructive/30 bg-destructive/5"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Estimated Posting Cost
          </p>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-bold tabular-nums ${
                hasEnough ? "text-green-600" : "text-destructive"
              }`}
            >
              {estimatedCost.toLocaleString()}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              coins
            </span>
            <span className="text-xs text-muted-foreground">
              · {durationDays} day{durationDays !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${
            hasEnough
              ? "bg-green-500/10 text-green-700"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          <Coins className="h-3.5 w-3.5" />
          {userCoins.toLocaleString()} available
        </div>
      </div>

      {hasEnough ? (
        <p className="text-xs text-green-700 font-medium">
          ✓ You have sufficient coins. After publishing,{" "}
          <strong>{estimatedCost.toLocaleString()} coins</strong> will be
          deducted from your balance.
        </p>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-xs text-destructive font-medium flex-1">
            You need <strong>{shortfall.toLocaleString()} more coins</strong> to
            publish this listing.
          </p>
          {/* Opens the Buy Coins modal instead of routing to a dead page */}
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="gap-2 shrink-0"
            onClick={onBuyCoins}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Buy Coins
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

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

// ─── Main component ───────────────────────────────────────────────────────────

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
  const [showBuyCoins, setShowBuyCoins] = useState(false);

  // "Other" free-text values for dropdowns that support it
  const [houseTypeOther, setHouseTypeOther] = useState("");
  const [serviceTypeOther, setServiceTypeOther] = useState("");

  const isHouse = activeTab === "house_post";
  const isCar = activeTab === "car_post";
  const isService = activeTab === "service_post";

  // FIX: use typed setters — no more cast to any, which was hiding the real state
  const currentForm = isHouse ? houseForm : isCar ? carForm : serviceForm;

  // Typed per-form change handlers avoid the "cast to any" pattern
  // that was silently allowing undefined values through
  const handleHouseChange = <K extends keyof HouseFormState>(
    key: K,
    value: HouseFormState[K],
  ) => setHouseForm((prev) => ({ ...prev, [key]: value }));

  const handleCarChange = <K extends keyof CarFormState>(
    key: K,
    value: CarFormState[K],
  ) => setCarForm((prev) => ({ ...prev, [key]: value }));

  const handleServiceChange = <K extends keyof ServiceFormState>(
    key: K,
    value: ServiceFormState[K],
  ) => setServiceForm((prev) => ({ ...prev, [key]: value }));

  // Generic shim used by shared fields (title, price, location, etc.)
  const handleChange = (key: string, value: any) => {
    if (isHouse) handleHouseChange(key as keyof HouseFormState, value);
    else if (isCar) handleCarChange(key as keyof CarFormState, value);
    else handleServiceChange(key as keyof ServiceFormState, value);
  };

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

  // ── Fee lookup ──────────────────────────────────────────────────────────────
  const feeCategory = isHouse ? "house" : isCar ? "car" : "service";
  const feeListingMode = isService
    ? undefined
    : (currentForm as HouseFormState | CarFormState).listingMode;

  const {
    data: feeData,
    isLoading: isFeeLoading,
    isError: isFeeError,
  } = useSearchPlatformFeesQuery(
    {
      feeType: "posting_fee",
      category: feeCategory,
      ...(feeListingMode ? { listingMode: feeListingMode } : {}),
      isActive: true,
    },
    { skip: !currentUser },
  );

  const { estimatedCost, noFeeFound } = useMemo(() => {
    const fees = feeData?.data?.platformFees;
    if (!fees || fees.length === 0)
      return { estimatedCost: null, noFeeFound: true };

    const fee = fees[0];
    const dDays = parseInt((currentForm as any).durationDays || "0");
    if (!dDays || !fee.durationDays || !fee.coinAmount)
      return { estimatedCost: null, noFeeFound: false };

    const cost = Math.ceil((dDays * fee.coinAmount) / fee.durationDays);
    return { estimatedCost: cost, noFeeFound: false };
  }, [feeData, (currentForm as any).durationDays]);

  // ── Guards ──────────────────────────────────────────────────────────────────
  const isKycVerified = currentUser?.isKYCVerified ?? false;
  const coins = currentUser?.coins ?? 0;
  const pageTitle = isHouse
    ? "Post House"
    : isCar
      ? "List Car"
      : "Offer Service";

  if (!isKycVerified) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in">
        <h1 className="text-3xl font-bold">{pageTitle}</h1>
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
      <>
        {showBuyCoins && (
          <BuyCoinsModal onClose={() => setShowBuyCoins(false)} />
        )}
        <div className="max-w-4xl mx-auto space-y-6 animate-in">
          <h1 className="text-3xl font-bold">{pageTitle}</h1>
          <GuardBanner
            icon={Coins}
            title="Insufficient Coins"
            message="You need coins to post a listing. Purchase coins to continue."
            color="border-blue-500/30 bg-blue-500/5 text-blue-600"
          />
          <Button
            onClick={() => setShowBuyCoins(true)}
            className="gap-2 h-12 rounded-xl font-bold uppercase tracking-widest text-xs"
          >
            <Coins className="h-4 w-4" />
            Buy Coins
          </Button>
        </div>
      </>
    );
  }

  const canPublish =
    !isFeeLoading &&
    !isFeeError &&
    !noFeeFound &&
    estimatedCost !== null &&
    coins >= estimatedCost;

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const images = (currentForm as any).images as File[];
    if (!images || images.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }

    // Validate "other" free-text fields
    if (isHouse && houseForm.houseType === "others" && !houseTypeOther.trim()) {
      toast.error("Please specify your house type.");
      return;
    }
    if (
      isService &&
      serviceForm.serviceType === "other" &&
      !serviceTypeOther.trim()
    ) {
      toast.error("Please specify your service category.");
      return;
    }

    // Resolve actual values — replace sentinel with the custom text
    const resolvedHouseType =
      isHouse && houseForm.houseType === "others"
        ? houseTypeOther.trim()
        : houseForm.houseType;
    const resolvedServiceType =
      isService && serviceForm.serviceType === "other"
        ? serviceTypeOther.trim()
        : serviceForm.serviceType;

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

    // contactCoinLimit: only send if user entered a value
    const rawCCL = (currentForm as any).contactCoinLimit;
    const parsedCCL = rawCCL ? parseInt(rawCCL) : undefined;

    const base = {
      title: (currentForm as any).title,
      description: (currentForm as any).description,
      price: parseFloat((currentForm as any).price),
      location,
      durationDays: parseInt((currentForm as any).durationDays || "30"),
      images,
      // Backend handles the "must be >= platform fee" logic already,
      // so we just forward whatever the user typed (or omit it).
      ...(parsedCCL !== undefined ? { contactCoinLimit: parsedCCL } : {}),
    };

    try {
      if (isHouse) {
        await createListing({
          ...base,
          listingType: "house",
          listingMode: houseForm.listingMode,
          houseType: resolvedHouseType,
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
          serviceType: resolvedServiceType,
          rentalPeriod: serviceForm.rentalPeriod,
        }).unwrap();
      }

      toast.success("Listing published successfully!");
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to publish listing.");
    }
  };

  // ── Styles ──────────────────────────────────────────────────────────────────
  const labelStyle =
    "text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1";
  const inputStyle =
    "w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary/10 outline-none transition-all";

  const durationDaysNum = parseInt((currentForm as any).durationDays || "0");

  return (
    <>
      {showBuyCoins && <BuyCoinsModal onClose={() => setShowBuyCoins(false)} />}

      <div className="max-w-4xl mx-auto animate-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{pageTitle}</h1>
          <p className="text-muted-foreground font-medium">
            Complete the asset dossier for global marketplace publishing.
          </p>
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

          {/* Listing Mode — house & car only */}
          {!isService && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelStyle}>Listing Mode</label>
                {/* FIX: value always bound to a concrete string from state */}
                <select
                  className={inputStyle}
                  value={isHouse ? houseForm.listingMode : carForm.listingMode}
                  onChange={(e) =>
                    isHouse
                      ? handleHouseChange(
                          "listingMode",
                          e.target.value as "rent" | "sell",
                        )
                      : handleCarChange(
                          "listingMode",
                          e.target.value as "rent" | "sell",
                        )
                  }
                >
                  <option value="rent">For Rent</option>
                  <option value="sell">For Sale</option>
                </select>
              </div>

              {/* Rental Period — only when mode is rent */}
              {((isHouse && houseForm.listingMode === "rent") ||
                (isCar && carForm.listingMode === "rent")) && (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <label className={labelStyle}>Rental Period</label>
                  <select
                    className={inputStyle}
                    value={
                      isHouse ? houseForm.rentalPeriod : carForm.rentalPeriod
                    }
                    onChange={(e) =>
                      isHouse
                        ? handleHouseChange(
                            "rentalPeriod",
                            e.target.value as HouseFormState["rentalPeriod"],
                          )
                        : handleCarChange(
                            "rentalPeriod",
                            e.target.value as CarFormState["rentalPeriod"],
                          )
                    }
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
                    onChange={(e) =>
                      handleHouseChange("houseType", e.target.value)
                    }
                  >
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="condominium">Condominium</option>
                    <option value="business">Business</option>
                    <option value="others">Others</option>
                  </select>
                  {houseForm.houseType === "others" && (
                    <input
                      type="text"
                      value={houseTypeOther}
                      onChange={(e) => setHouseTypeOther(e.target.value)}
                      className={`${inputStyle} mt-2 animate-in fade-in duration-200`}
                      placeholder="Please specify house type…"
                      required
                      autoFocus
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <label className={labelStyle}>Bedrooms</label>
                  <input
                    type="number"
                    min={0}
                    value={houseForm.bedrooms}
                    onChange={(e) =>
                      handleHouseChange("bedrooms", e.target.value)
                    }
                    className={inputStyle}
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelStyle}>Bathrooms</label>
                  <input
                    type="number"
                    min={0}
                    value={houseForm.bathrooms}
                    onChange={(e) =>
                      handleHouseChange("bathrooms", e.target.value)
                    }
                    className={inputStyle}
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelStyle}>Area (sqm)</label>
                  <input
                    type="number"
                    min={1}
                    value={houseForm.area_sqm}
                    onChange={(e) =>
                      handleHouseChange("area_sqm", e.target.value)
                    }
                    className={inputStyle}
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelStyle}>Parking Slots</label>
                  <input
                    type="number"
                    min={0}
                    value={houseForm.parking}
                    onChange={(e) =>
                      handleHouseChange("parking", e.target.value)
                    }
                    className={inputStyle}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center gap-4 h-full pt-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={houseForm.tanker}
                      onChange={(e) =>
                        handleHouseChange("tanker", e.target.checked)
                      }
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
                    onChange={(e) => handleCarChange("brand", e.target.value)}
                    className={inputStyle}
                    placeholder="e.g. Toyota"
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelStyle}>Model</label>
                  <input
                    type="text"
                    value={carForm.carModel}
                    onChange={(e) =>
                      handleCarChange("carModel", e.target.value)
                    }
                    className={inputStyle}
                    placeholder="e.g. Land Cruiser"
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelStyle}>Car Type</label>
                  <select
                    className={inputStyle}
                    value={carForm.carType}
                    onChange={(e) =>
                      handleCarChange(
                        "carType",
                        e.target.value as CarFormState["carType"],
                      )
                    }
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
                    onChange={(e) =>
                      handleCarChange(
                        "condition",
                        e.target.value as CarFormState["condition"],
                      )
                    }
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
                    onChange={(e) =>
                      handleServiceChange("serviceType", e.target.value)
                    }
                  >
                    <option value="plumber">Plumbing</option>
                    <option value="electrician">Electrical</option>
                    <option value="catering">Catering</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="security">Security</option>
                    <option value="other">Other</option>
                  </select>
                  {serviceForm.serviceType === "other" && (
                    <input
                      type="text"
                      value={serviceTypeOther}
                      onChange={(e) => setServiceTypeOther(e.target.value)}
                      className={`${inputStyle} mt-2 animate-in fade-in duration-200`}
                      placeholder="Please specify service category…"
                      required
                      autoFocus
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <label className={labelStyle}>Rental Period</label>
                  <select
                    className={inputStyle}
                    value={serviceForm.rentalPeriod}
                    onChange={(e) =>
                      handleServiceChange(
                        "rentalPeriod",
                        e.target.value as ServiceFormState["rentalPeriod"],
                      )
                    }
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

          {/* Contact Coin Limit — all types, optional */}
          <div className="pt-6 border-t border-border space-y-3">
            <div>
              <h3 className="text-sm font-bold text-foreground italic">
                Contact Access Settings
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                By default, the platform sets a minimum coin cost for users to
                unlock your contact details. You can raise it above the default
                to reduce unwanted contacts — but you cannot set it below the
                platform minimum.
              </p>
            </div>
            <div className="space-y-2">
              <label className={labelStyle}>
                Contact Coin Limit{" "}
                <span className="normal-case tracking-normal font-normal text-muted-foreground">
                  (optional — leave blank to use platform default)
                </span>
              </label>
              <input
                type="number"
                min={0}
                value={(currentForm as any).contactCoinLimit}
                onChange={(e) =>
                  handleChange("contactCoinLimit", e.target.value)
                }
                className={inputStyle}
                placeholder="e.g. 20"
              />
              <p className="text-[10px] text-muted-foreground ml-1">
                If you enter a value lower than the platform fee, the platform
                default is used automatically.
              </p>
            </div>
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

          {/* Coin cost preview */}
          {durationDaysNum > 0 && (
            <div className="pt-2">
              <CoinCostPreview
                estimatedCost={estimatedCost}
                userCoins={coins}
                durationDays={durationDaysNum}
                isFeeLoading={isFeeLoading}
                isFeeError={isFeeError}
                noFeeFound={noFeeFound}
                onBuyCoins={() => setShowBuyCoins(true)}
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !canPublish}
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing…
              </>
            ) : !canPublish &&
              estimatedCost !== null &&
              coins < estimatedCost ? (
              <>
                <ShoppingCart className="h-4 w-4" />
                Insufficient Coins — Buy to Publish
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Publish Asset to Marketplace
              </>
            )}
          </Button>
        </form>
      </div>
    </>
  );
}
