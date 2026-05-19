// client/src/app/dashboard/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Home,
  Menu,
  Car,
  Wrench,
  BarChart3,
  Clock,
  PlusCircle,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { ActivityTable } from "@/components/dashboard/ActivityTable";
import { InventoryTable } from "@/components/dashboard/InventoryTable";
import {
  AssetForm,
  type HouseFormState,
  type CarFormState,
  type ServiceFormState,
} from "@/components/dashboard/AssetForm";
import Chat from "@/components/Chat";
import { useGetMyListingsQuery } from "@/store/apis/listingsApi";

type DashboardTab =
  | "dashboard"
  | "house_post"
  | "house_view"
  | "car_post"
  | "car_view"
  | "service_post"
  | "service_view"
  | "admin_kyc"
  | "admin_users";

// ─── default form states ──────────────────────────────────────────────────────
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

export default function Dashboard() {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  const [activeTab, setActiveTab] = useState<DashboardTab>("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [dashboardFilter, setDashboardFilter] = useState<
    "all" | "rent" | "sell"
  >("all");

  const [houseForm, setHouseForm] = useState<HouseFormState>(defaultHouseForm);
  const [carForm, setCarForm] = useState<CarFormState>(defaultCarForm);
  const [serviceForm, setServiceForm] =
    useState<ServiceFormState>(defaultServiceForm);

  // Real listings for activity/inventory tables
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

  const menuItems = [
    {
      id: "houses",
      label: "Houses",
      icon: Home,
      post: "house_post",
      view: "house_view",
      color: "text-primary",
    },
    {
      id: "cars",
      label: "Cars",
      icon: Car,
      post: "car_post",
      view: "car_view",
      color: "text-blue-500",
    },
    {
      id: "services",
      label: "Services",
      icon: Wrench,
      post: "service_post",
      view: "service_view",
      color: "text-emerald-500",
    },
  ] as any[];

  const adminItems = [
    {
      id: "admin_kyc",
      label: "KYC Audits",
      icon: ShieldCheck,
      color: "bg-amber-500/10 text-amber-600",
    },
    {
      id: "admin_users",
      label: "User Directory",
      icon: Users,
      color: "bg-primary/10 text-primary",
    },
  ] as any[];

  const toggleMenu = (menu: string) => {
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
      setExpandedMenus([menu]);
      return;
    }
    setExpandedMenus((prev) =>
      prev.includes(menu) ? prev.filter((m) => m !== menu) : [...prev, menu],
    );
  };

  // Called by AssetForm after a successful publish — reset form + go to view tab
  const handleSuccess = () => {
    setHouseForm(defaultHouseForm);
    setCarForm(defaultCarForm);
    setServiceForm(defaultServiceForm);
    if (activeTab === "house_post") setActiveTab("house_view");
    else if (activeTab === "car_post") setActiveTab("car_view");
    else setActiveTab("service_view");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsMobileSidebarOpen(false);
          }}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          isMobileSidebarOpen={isMobileSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          expandedMenus={expandedMenus}
          toggleMenu={toggleMenu}
          menuItems={menuItems}
          adminItems={adminItems}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar relative bg-muted/30">
          <div className="max-w-7xl mx-auto space-y-8 md:space-y-10">
            {/* Mobile toggle */}
            <div className="md:hidden flex items-center gap-4 mb-6">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="font-bold text-lg">Broker Console</h1>
            </div>

            {/* Dashboard overview */}
            {activeTab === "dashboard" && (
              <div className="space-y-10 animate-in">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">
                      Performance Overview
                    </h1>
                    <p className="text-muted-foreground font-medium">
                      Welcome back, {currentUser?.firstName ?? "—"}. Here's your
                      portfolio activity.
                    </p>
                  </div>
                  <Button
                    onClick={() => setActiveTab("house_post")}
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
            )}

            {/* Inventory views */}
            {(activeTab === "house_view" ||
              activeTab === "car_view" ||
              activeTab === "service_view") && (
              <InventoryTable
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                listings={myListings}
              />
            )}

            {/* Create forms */}
            {(activeTab === "house_post" ||
              activeTab === "car_post" ||
              activeTab === "service_post") && (
              <AssetForm
                activeTab={activeTab}
                houseForm={houseForm}
                setHouseForm={setHouseForm}
                carForm={carForm}
                setCarForm={setCarForm}
                serviceForm={serviceForm}
                setServiceForm={setServiceForm}
                onSuccess={handleSuccess}
              />
            )}

            {/* KYC admin panel */}
            {activeTab === "admin_kyc" && (
              <div className="space-y-8 animate-in">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                  KYC Verification
                </h1>
                <div className="grid gap-4">
                  {[
                    {
                      name: "Abebe Kebede",
                      date: "2026-05-15",
                      status: "pending",
                    },
                    {
                      name: "Sara Tekle",
                      date: "2026-05-14",
                      status: "reviewed",
                    },
                  ].map((f, i) => (
                    <div
                      key={i}
                      className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {f.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{f.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Submitted on {f.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${
                            f.status === "pending"
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-green-500/10 text-green-600"
                          }`}
                        >
                          {f.status}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg font-bold text-xs h-9"
                        >
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <Chat />
    </div>
  );
}
