"use client";

import { useState, useCallback } from "react";
import { useSearchListingsQuery } from "@/store/apis/listingsApi";
import type { ListingQueryParams } from "@/store/apis/listingsApi";
import ListingsGrid from "@/components/ListingsGrid";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

const DEFAULT_FILTERS = {
  search: "",
  city: "",
  minPrice: undefined as number | undefined,
  maxPrice: undefined as number | undefined,
  listingMode: "all" as "all" | "rent" | "sell",
  carType: "",
  condition: "",
  brand: "",
  page: 1,
  limit: 20,
};

export default function CarListingsPage() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const queryParams: ListingQueryParams = {
    listingType: "car",
    page: filters.page,
    limit: filters.limit,
    ...(filters.search && { search: filters.search }),
    ...(filters.city && { city: filters.city }),
    ...(filters.minPrice !== undefined && { minPrice: filters.minPrice }),
    ...(filters.maxPrice !== undefined && { maxPrice: filters.maxPrice }),
    ...(filters.listingMode !== "all" && { listingMode: filters.listingMode }),
    ...(filters.carType && { carType: filters.carType as "electric" | "fuel" }),
    ...(filters.condition && {
      condition: filters.condition as "used" | "new",
    }),
    ...(filters.brand && { brand: filters.brand }),
  };

  const { data, isLoading, isFetching, isError, refetch } =
    useSearchListingsQuery(queryParams);

  const listings = data?.data?.listings ?? [];
  const pagination = data?.data?.pagination;

  const update = useCallback(
    (patch: Partial<typeof DEFAULT_FILTERS>) =>
      setFilters((prev) => ({ ...prev, ...patch, page: 1 })),
    [],
  );

  const handleReset = () => setFilters(DEFAULT_FILTERS);

  const gridItems = listings.map((l) => ({
    id: l.id,
    title: l.title,
    price: l.price,
    location: l.location?.fullAddress ?? l.location?.city ?? "—",
    image: l.images?.[0] ?? "/placeholder.jpg",
    images: l.images,
    category: "car" as const,
    listingMode: l.listingMode,
    carType: l.carType,
    condition: l.condition,
    brand: l.brand,
    carModel: l.carModel,
    rentalPeriod: l.rentalPeriod,
    status: l.status,
  }));

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6">
        <div className="mb-12">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              {t("common.back")}
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            {t("header.cars")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {pagination
              ? pagination.total === 1
                ? t("listings.carAvailable", { count: pagination.total })
                : t("listings.carsAvailable", { count: pagination.total })
              : t("listings.browseCars")}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            <div className="space-y-1 xl:col-span-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("common.search")}
              </label>
              <input
                type="text"
                placeholder={t("common.searchPlaceholder")}
                value={filters.search}
                onChange={(e) => update({ search: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("common.city")}
              </label>
              <input
                type="text"
                placeholder={t("common.cityPlaceholder")}
                value={filters.city}
                onChange={(e) => update({ city: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("common.type")}
              </label>
              <select
                value={filters.listingMode}
                onChange={(e) => update({ listingMode: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
              >
                <option value="all">{t("common.all")}</option>
                <option value="rent">{t("common.rent")}</option>
                <option value="sell">{t("common.sell")}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("common.carType")}
              </label>
              <select
                value={filters.carType}
                onChange={(e) => update({ carType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
              >
                <option value="">{t("common.allTypes")}</option>
                <option value="electric">{t("common.electric")}</option>
                <option value="fuel">{t("common.fuel")}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("common.condition")}
              </label>
              <select
                value={filters.condition}
                onChange={(e) => update({ condition: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
              >
                <option value="">{t("common.all")}</option>
                <option value="new">{t("common.newCondition")}</option>
                <option value="used">{t("common.usedCondition")}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("common.brand")}
              </label>
              <input
                type="text"
                placeholder={t("listings.brandPlaceholder")}
                value={filters.brand}
                onChange={(e) => update({ brand: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 max-w-sm">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("common.minPrice")}
              </label>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={filters.minPrice ?? ""}
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

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("common.maxPrice")}
              </label>
              <input
                type="number"
                min={0}
                placeholder={t("common.any")}
                value={filters.maxPrice ?? ""}
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
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" size="sm" onClick={handleReset}>
              {t("common.resetFilters")}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">{t("listings.loadingListings")}</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-4 py-24 text-muted-foreground">
            <p className="text-sm">{t("listings.failedListings")}</p>
            <Button variant="outline" size="sm" onClick={refetch}>
              {t("common.tryAgain")}
            </Button>
          </div>
        ) : (
          <>
            {isFetching && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Loader2 className="h-3 w-3 animate-spin" />
                {t("common.updating")}
              </div>
            )}

            <ListingsGrid
              listings={gridItems}
              emptyMessage={t("listings.noCarsFound")}
            />

            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page <= 1}
                  onClick={() =>
                    setFilters((p) => ({ ...p, page: p.page - 1 }))
                  }
                >
                  {t("common.previous")}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {t("common.pageOf", {
                    page: pagination.page,
                    total: pagination.pages,
                  })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page >= pagination.pages}
                  onClick={() =>
                    setFilters((p) => ({ ...p, page: p.page + 1 }))
                  }
                >
                  {t("common.next")}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
