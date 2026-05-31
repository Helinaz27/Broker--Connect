// src/app/page.tsx
"use client";

import ListingCard from "@/components/ListingCard";
import Chat from "@/components/Chat";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useCallback } from "react";
import { useSearchListingsQuery } from "@/store/apis/listingsApi";
import type { ListingQueryParams } from "@/store/apis/listingsApi";
import { useLanguage } from "@/i18n/LanguageProvider";

const DEFAULT_FILTERS = {
  search: "",
  city: "",
  minPrice: undefined as number | undefined,
  maxPrice: undefined as number | undefined,
  category: "all" as "all" | "house" | "car" | "service",
};

const filtersEqual = (a: typeof DEFAULT_FILTERS, b: typeof DEFAULT_FILTERS) =>
  a.search === b.search &&
  a.city === b.city &&
  a.minPrice === b.minPrice &&
  a.maxPrice === b.maxPrice &&
  a.category === b.category;

export default function Index() {
  const { t } = useLanguage();
  const [draft, setDraft] = useState(DEFAULT_FILTERS);
  const [applied, setApplied] = useState(DEFAULT_FILTERS);

  const update = useCallback(
    (patch: Partial<typeof DEFAULT_FILTERS>) =>
      setDraft((prev) => ({ ...prev, ...patch })),
    [],
  );

  const applyFilters = useCallback(
    (filters = draft) => {
      setApplied({ ...filters });
    },
    [draft],
  );

  const handleReset = () => {
    setDraft(DEFAULT_FILTERS);
    setApplied(DEFAULT_FILTERS);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  const showApply = !filtersEqual(draft, applied);
  const showReset = !filtersEqual(applied, DEFAULT_FILTERS);

  const sharedParams: Omit<ListingQueryParams, "listingType"> = {
    limit: 8,
    page: 1,
    ...(applied.search && { search: applied.search }),
    ...(applied.city && { city: applied.city }),
    ...(applied.minPrice !== undefined && { minPrice: applied.minPrice }),
    ...(applied.maxPrice !== undefined && { maxPrice: applied.maxPrice }),
  };

  const showHouses = applied.category === "all" || applied.category === "house";
  const showCars = applied.category === "all" || applied.category === "car";
  const showServices =
    applied.category === "all" || applied.category === "service";

  const {
    data: housesData,
    isLoading: housesLoading,
    isError: housesError,
  } = useSearchListingsQuery(
    { ...sharedParams, listingType: "house" },
    { skip: !showHouses },
  );

  const {
    data: carsData,
    isLoading: carsLoading,
    isError: carsError,
  } = useSearchListingsQuery(
    { ...sharedParams, listingType: "car" },
    { skip: !showCars },
  );

  const {
    data: servicesData,
    isLoading: servicesLoading,
    isError: servicesError,
  } = useSearchListingsQuery(
    { ...sharedParams, listingType: "service" },
    { skip: !showServices },
  );

  const houses = housesData?.data?.listings ?? [];
  const cars = carsData?.data?.listings ?? [];
  const services = servicesData?.data?.listings ?? [];

  const houseTotal = housesData?.data?.pagination?.total ?? 0;
  const carTotal = carsData?.data?.pagination?.total ?? 0;
  const serviceTotal = servicesData?.data?.pagination?.total ?? 0;

  const allEmpty =
    !housesLoading &&
    !carsLoading &&
    !servicesLoading &&
    houses.length === 0 &&
    cars.length === 0 &&
    services.length === 0;

  const toCard = (
    l: (typeof houses)[number],
    category: "house" | "car" | "service",
  ) => ({
    id: l.id,
    title: l.title,
    price: l.price,
    location: l.location?.fullAddress ?? l.location?.city ?? "",
    image: l.images?.[0] ?? "/placeholder.jpg",
    category,
    listingMode: l.listingMode,
  });

  return (
    <main className="min-h-screen bg-background">
      <section className="relative py-8 md:py-12 bg-gradient-to-b from-primary/5 to-background overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
              {t("home.heroTitle")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {t("home.heroSubtitle")}
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("home.category")}
                </label>
                <select
                  value={draft.category}
                  onChange={(e) => update({ category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                >
                  <option value="all">{t("home.all")}</option>
                  <option value="house">{t("home.houses")}</option>
                  <option value="car">{t("home.cars")}</option>
                  <option value="service">{t("home.otherServices")}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("home.search")}
                </label>
                <input
                  type="text"
                  placeholder={t("home.searchPlaceholder")}
                  value={draft.search}
                  onChange={(e) => update({ search: e.target.value })}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("home.city")}
                </label>
                <input
                  type="text"
                  placeholder={t("home.cityPlaceholder")}
                  value={draft.city}
                  onChange={(e) => update({ city: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("home.minPrice")}
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={draft.minPrice ?? ""}
                  onChange={(e) =>
                    update({
                      minPrice: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("home.maxPrice")}
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder={t("home.maxPricePlaceholder")}
                  value={draft.maxPrice ?? ""}
                  onChange={(e) =>
                    update({
                      maxPrice: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                />
              </div>

              <div className="flex flex-col gap-2 justify-end">
                {showApply && (
                  <Button
                    size="sm"
                    onClick={() => applyFilters()}
                    className="w-full"
                  >
                    {t("home.applyFilters")}
                  </Button>
                )}
                {showReset && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="w-full"
                  >
                    {t("home.reset")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 container mx-auto px-6">
        {showHouses && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  {t("home.houses")}
                </h2>
                {!housesLoading && !housesError && (
                  <p className="text-muted-foreground mt-1">
                    {houseTotal === 1
                      ? t("home.propertyAvailable", { count: houseTotal })
                      : t("home.propertiesAvailable", { count: houseTotal })}
                  </p>
                )}
              </div>
              <Link href="/house-listings">
                <Button variant="outline" size="sm">
                  {t("home.viewAll")}
                </Button>
              </Link>
            </div>

            {housesLoading ? (
              <div className="flex items-center gap-2 py-12 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">{t("home.loadingHouses")}</span>
              </div>
            ) : housesError ? (
              <p className="text-sm text-muted-foreground py-12">
                {t("home.failedHouses")}
              </p>
            ) : houses.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12">
                {t("home.noHouses")}
              </p>
            ) : (
              <div className="overflow-x-auto pb-4 -mx-6 px-6">
                <div className="flex gap-6" style={{ minWidth: "min-content" }}>
                  {houses.map((listing) => (
                    <div key={listing.id} className="flex-shrink-0 w-80">
                      <ListingCard {...toCard(listing, "house")} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {showCars && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  {t("home.cars")}
                </h2>
                {!carsLoading && !carsError && (
                  <p className="text-muted-foreground mt-1">
                    {carTotal === 1
                      ? t("home.vehicleAvailable", { count: carTotal })
                      : t("home.vehiclesAvailable", { count: carTotal })}
                  </p>
                )}
              </div>
              <Link href="/car-listings">
                <Button variant="outline" size="sm">
                  {t("home.viewAll")}
                </Button>
              </Link>
            </div>

            {carsLoading ? (
              <div className="flex items-center gap-2 py-12 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">{t("home.loadingCars")}</span>
              </div>
            ) : carsError ? (
              <p className="text-sm text-muted-foreground py-12">
                {t("home.failedCars")}
              </p>
            ) : cars.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12">
                {t("home.noCars")}
              </p>
            ) : (
              <div className="overflow-x-auto pb-4 -mx-6 px-6">
                <div className="flex gap-6" style={{ minWidth: "min-content" }}>
                  {cars.map((listing) => (
                    <div key={listing.id} className="flex-shrink-0 w-80">
                      <ListingCard {...toCard(listing, "car")} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {showServices && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  {t("home.otherServices")}
                </h2>
                {!servicesLoading && !servicesError && (
                  <p className="text-muted-foreground mt-1">
                    {serviceTotal === 1
                      ? t("home.serviceAvailable", { count: serviceTotal })
                      : t("home.servicesAvailable", { count: serviceTotal })}
                  </p>
                )}
              </div>
              <Link href="/service-listings">
                <Button variant="outline" size="sm">
                  {t("home.viewAll")}
                </Button>
              </Link>
            </div>

            {servicesLoading ? (
              <div className="flex items-center gap-2 py-12 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">{t("home.loadingServices")}</span>
              </div>
            ) : servicesError ? (
              <p className="text-sm text-muted-foreground py-12">
                {t("home.failedServices")}
              </p>
            ) : services.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12">
                {t("home.noServices")}
              </p>
            ) : (
              <div className="overflow-x-auto pb-4 -mx-6 px-6">
                <div className="flex gap-6" style={{ minWidth: "min-content" }}>
                  {services.map((listing) => (
                    <div key={listing.id} className="flex-shrink-0 w-80">
                      <ListingCard {...toCard(listing, "service")} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {allEmpty && (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-dashed border-border rounded-[2rem]">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
              <ArrowRight className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {t("home.noListingsTitle")}
            </h3>
            <p className="text-muted-foreground max-w-xs">
              {t("home.noListingsBody")}
            </p>
          </div>
        )}
      </section>

      <Chat />
    </main>
  );
}
