// app/dashboard/page.tsx
"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { Home, BarChart3, Clock, PlusCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { ActivityTable } from "@/components/dashboard/ActivityTable";
import { useGetMyListingsQuery } from "@/store/apis/listingsApi";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const router = useRouter();
  const [dashboardFilter, setDashboardFilter] = useState<
    "all" | "rent" | "sell"
  >("all");

  const { data: myListingsData } = useGetMyListingsQuery();
  const myListings = (myListingsData?.data?.listings ?? []).map((l) => ({
    id: l.id,
    title: l.title,
    price: l.price,
    location: l.location?.fullAddress ?? l.location?.city ?? "—",
    image: l.images?.[0],
    status: l.status as "active" | "occupied" | "inactive",
    type: (l.listingMode ?? "sell") as "rent" | "sell",
    category: l.listingType as "house" | "car" | "service",
    createdAt: l.createdAt,
  }));

  const stats = [
    {
      label: "Active Assets",
      value: String(myListings.filter((l) => l.status === "active").length),
      icon: Home,
      trend: `${myListings.length} total`,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Houses",
      value: String(myListings.filter((l) => l.category === "house").length),
      icon: BarChart3,
      trend: "listed",
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Cars & Services",
      value: String(
        myListings.filter(
          (l) => l.category === "car" || l.category === "service",
        ).length,
      ),
      icon: Clock,
      trend: "listed",
      color: "bg-emerald-500/10 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-10 animate-in">
      {/* Mobile header */}
      <div className="md:hidden flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-xl"
          // mobile open is handled by layout; this just shows the label
          onClick={() => {}}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="font-bold text-lg">Broker Console</h1>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Performance Overview
          </h1>
          <p className="text-muted-foreground font-medium">
            Welcome back, {currentUser?.firstName ?? "—"}. Here's your portfolio
            activity.
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/houses/post")}
          className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold uppercase tracking-widest text-xs gap-3 transition-all hover:scale-[1.02] text-white"
        >
          <PlusCircle className="h-4 w-4" /> New Asset Post
        </Button>
      </div>

      <StatsGrid stats={stats} />
      <ActivityTable
        listings={myListings}
        filter={dashboardFilter}
        setFilter={setDashboardFilter}
      />
    </div>
  );
}
