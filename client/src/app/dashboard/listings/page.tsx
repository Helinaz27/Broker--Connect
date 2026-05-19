// client/src/app/dashboard/listings/page.tsx
"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
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

type FilterType = "all" | ListingType;

export default function MyListingsPage() {
  const [listingType, setListingType] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const isAdmin = false;

  // Total count — uses get-my-listings with no type filter so the badge is always accurate
  const { data: totalsData } = useGetMyListingsQuery();
  const total = totalsData?.data?.pagination?.total ?? 0;

  const queryParams = {
    ...(search ? { search } : {}),
  };

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <DashboardSidebar isAdmin={isAdmin} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  My Listings
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage all your listings in one place
                </p>
              </div>
              <Link href="/dashboard/listings/create">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Listing
                </Button>
              </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                value={listingType}
                onValueChange={(value: FilterType) => setListingType(value)}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Listings</SelectItem>
                  <SelectItem value="house">Houses</SelectItem>
                  <SelectItem value="car">Cars</SelectItem>
                  <SelectItem value="service">Services</SelectItem>
                </SelectContent>
              </Select>

              <input
                type="text"
                placeholder="Search listings…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
              />
            </div>

            {/* Listings Table — renders the relevant component based on selected type */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Listings ({total})</CardTitle>
              </CardHeader>
              <CardContent>
                {(listingType === "all" || listingType === "house") && (
                  <section className="mb-8">
                    {listingType === "all" && (
                      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                        Houses
                      </h2>
                    )}
                    <HouseListings queryParams={queryParams} />
                  </section>
                )}

                {(listingType === "all" || listingType === "car") && (
                  <section className="mb-8">
                    {listingType === "all" && (
                      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                        Cars
                      </h2>
                    )}
                    <CarListings queryParams={queryParams} />
                  </section>
                )}

                {(listingType === "all" || listingType === "service") && (
                  <section>
                    {listingType === "all" && (
                      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                        Services
                      </h2>
                    )}
                    <ServiceListings queryParams={queryParams} />
                  </section>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
