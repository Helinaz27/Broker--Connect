"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Home,
  Car,
  Wrench,
  BarChart3,
  Clock,
  PlusCircle,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { ActivityTable } from "@/components/dashboard/ActivityTable";
import { InventoryTable } from "@/components/dashboard/InventoryTable";
import { AssetForm } from "@/components/dashboard/AssetForm";
import Chat from "@/components/Chat";

type DashboardTab = "dashboard" | "house_post" | "house_view" | "car_post" | "car_view" | "service_post" | "service_view" | "admin_kyc" | "admin_users";

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  image?: string;
  status: "active" | "occupied" | "inactive";
  type: "rent" | "sell";
  category: "house" | "car" | "service";
  createdAt: string;
}

const mockListings: Listing[] = [
  { id: "1", title: "Beautiful Modern Apartment in Downtown", price: 15000, location: "Addis Ababa, Bole", status: "active", type: "rent", category: "house", createdAt: "2026-01-15", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800" },
  { id: "2", title: "Spacious Family Villa with Garden", price: 25000, location: "Addis Ababa, Old Airport", status: "occupied", type: "sell", category: "house", createdAt: "2026-01-10", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800" },
  { id: "3", title: "Professional Electrician Services", price: 500, location: "Addis Ababa, Bole", status: "active", type: "rent", category: "service", createdAt: "2026-01-20", image: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?auto=format&fit=crop&q=80&w=800" },
  { id: "4", title: "2024 Toyota Land Cruiser V8", price: 12000000, location: "Addis Ababa, Sarbet", status: "active", type: "sell", category: "car", createdAt: "2026-02-01", image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800" },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [dashboardFilter, setDashboardFilter] = useState<"all" | "rent" | "sell">("all");
  
  const [houseForm, setHouseForm] = useState({ 
    title: "", 
    description: "", 
    price: "", 
    locationCity: "", 
    locationPlaceName: "", 
    locationSubCity: "", 
    lat: "", 
    lng: "",
    type: "apartment" as any, 
    bedrooms: "", 
    bathrooms: "", 
    area_sqm: "", 
    listingMode: "rent" as "rent" | "sell",
    tanker: false,
    rentalPeriod: "monthly" as "daily" | "weekly" | "monthly" | "yearly",
    parking: "",
    images: [] as File[]
  });
  const [carForm, setCarForm] = useState({ 
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
    year: "", 
    carType: "fuel" as "electric" | "fuel", 
    condition: "used" as "used" | "new", 
    listingMode: "rent" as "rent" | "sell",
    images: [] as File[]
  });
  const [serviceForm, setServiceForm] = useState({ 
    title: "", 
    description: "", 
    price: "", 
    locationCity: "", 
    locationPlaceName: "", 
    locationSubCity: "", 
    lat: "", 
    lng: "",
    serviceType: "plumber", 
    experience: "",
    images: [] as File[]
  });

  const stats = [
    { label: "Active Assets", value: "12", icon: Home, trend: "+2", color: "bg-primary/10 text-primary" },
    { label: "Total Reach", value: "1,284", icon: BarChart3, trend: "+14%", color: "bg-blue-500/10 text-blue-600" },
    { label: "Client Inquiries", value: "38", icon: Clock, trend: "+5", color: "bg-emerald-500/10 text-emerald-600" }
  ];

  const menuItems = [
    { id: "houses", label: "Houses", icon: Home, post: "house_post", view: "house_view", color: "text-primary" },
    { id: "cars", label: "Cars", icon: Car, post: "car_post", view: "car_view", color: "text-blue-500" },
    { id: "services", label: "Services", icon: Wrench, post: "service_post", view: "service_view", color: "text-emerald-500" }
  ] as any[];

  const adminItems = [
    { id: "admin_kyc", label: "KYC Audits", icon: ShieldCheck, color: "bg-amber-500/10 text-amber-600" },
    { id: "admin_users", label: "User Directory", icon: Users, color: "bg-primary/10 text-primary" }
  ] as any[];

  const toggleMenu = (menu: string) => {
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
      setExpandedMenus([menu]);
      return;
    }
    setExpandedMenus(prev => prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]);
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHouseForm({ 
      title: "", description: "", price: "", locationCity: "", locationPlaceName: "", locationSubCity: "", 
      lat: "", lng: "", type: "apartment", bedrooms: "", bathrooms: "", area_sqm: "", listingMode: "rent", 
      tanker: false, rentalPeriod: "monthly", parking: "", images: [] 
    });
    setCarForm({ 
      title: "", description: "", price: "", locationCity: "", locationPlaceName: "", locationSubCity: "", 
      lat: "", lng: "", brand: "", carModel: "", year: "", carType: "fuel", condition: "used", listingMode: "rent", images: [] 
    });
    setServiceForm({ 
      title: "", description: "", price: "", locationCity: "", locationPlaceName: "", locationSubCity: "", 
      lat: "", lng: "", serviceType: "plumber", experience: "", images: [] 
    });
    alert("Listing published successfully!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
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
            {/* Mobile Sidebar Toggle */}
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

            {activeTab === "dashboard" && (
              <div className="space-y-10 animate-in">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Performance Overview</h1>
                    <p className="text-muted-foreground font-medium">Welcome back, Helina. Here's your portfolio activity.</p>
                  </div>
                  <Button onClick={() => setActiveTab("house_post")} className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold uppercase tracking-widest text-xs gap-3 transition-all hover:scale-[1.02] text-white">
                    <PlusCircle className="h-4 w-4" /> New Asset Post
                  </Button>
                </div>
                <StatsGrid stats={stats} />
                <ActivityTable listings={mockListings} filter={dashboardFilter} setFilter={setDashboardFilter} />
              </div>
            )}

            {(activeTab === "house_view" || activeTab === "car_view" || activeTab === "service_view") && (
              <InventoryTable activeTab={activeTab} setActiveTab={setActiveTab} listings={mockListings} />
            )}

            {(activeTab === "house_post" || activeTab === "car_post" || activeTab === "service_post") && (
              <AssetForm 
                activeTab={activeTab} 
                houseForm={houseForm} setHouseForm={setHouseForm} 
                carForm={carForm} setCarForm={setCarForm} 
                serviceForm={serviceForm} setServiceForm={setServiceForm} 
                onSubmit={handlePostSubmit} 
              />
            )}

            {activeTab === "admin_kyc" && (
              <div className="space-y-8 animate-in">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">KYC Verification</h1>
                <div className="grid gap-4">
                  {[{ name: "Abebe Kebede", date: "2026-05-15", status: "pending" }, { name: "Sara Tekle", date: "2026-05-14", status: "reviewed" }].map((f, i) => (
                    <div key={i} className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{f.name[0]}</div>
                        <div><p className="font-bold text-sm">{f.name}</p><p className="text-xs text-muted-foreground">Submitted on {f.date}</p></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${f.status === "pending" ? "bg-amber-500/10 text-amber-600" : "bg-green-500/10 text-green-600"}`}>{f.status}</span>
                        <Button variant="outline" size="sm" className="rounded-lg font-bold text-xs h-9">Review</Button>
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
