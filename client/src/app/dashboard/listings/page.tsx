//dashboard/listings/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Plus } from "lucide-react";
import HouseListings from "@/components/houseListings/HouseListings";
import CarListings from "@/components/carListings/CarListings";
import ServiceListings from "@/components/serviceListings/ServiceListings";
import { useGetMyListingsQuery } from "@/store/apis/listingsApi";
import type { ListingType } from "@/store/apis/listingsApi";
import { useLanguage } from "@/i18n/LanguageProvider";

type FilterType = "all" | ListingType;

export default function MyListingsPage() {
  const { t } = useLanguage();
  const [listingType, setListingType] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const { data: totalsData } = useGetMyListingsQuery();
  const total = totalsData?.data?.pagination?.total ?? 0;

  const queryParams = { ...(search ? { search } : {}) };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {t("dashboard.myListings")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("dashboard.manageAllListings")}
          </p>
        </div>
        <Link href="/dashboard/listings/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t("common.createListing")}
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          value={listingType}
          onValueChange={(value: FilterType) => setListingType(value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={t("common.filterByType")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.allListings")}</SelectItem>
            <SelectItem value="house">{t("common.houses")}</SelectItem>
            <SelectItem value="car">{t("common.cars")}</SelectItem>
            <SelectItem value="service">{t("common.services")}</SelectItem>
          </SelectContent>
        </Select>

        <input
          type="text"
          placeholder={t("common.searchListings")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
        />
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>{t("common.listingsCount", { count: total })}</CardTitle>
        </CardHeader>
        <CardContent>
          {(listingType === "all" || listingType === "house") && (
            <section className="mb-8">
              {listingType === "all" && (
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  {t("common.houses")}
                </h2>
              )}
              <HouseListings queryParams={queryParams} />
            </section>
          )}
          {(listingType === "all" || listingType === "car") && (
            <section className="mb-8">
              {listingType === "all" && (
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  {t("common.cars")}
                </h2>
              )}
              <CarListings queryParams={queryParams} />
            </section>
          )}
          {(listingType === "all" || listingType === "service") && (
            <section>
              {listingType === "all" && (
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  {t("common.services")}
                </h2>
              )}
              <ServiceListings queryParams={queryParams} />
            </section>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
