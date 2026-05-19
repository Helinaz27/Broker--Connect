"use client";

import { useState } from "react";
import Link from "next/link";
import Chat from "@/components/Chat";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Home,
  Car,
  Wrench,
  BarChart3,
  Clock,
  X,
  Trash2,
  Eye,
  ChevronDown,
  ChevronRight,
  Menu,
  PlusCircle,
  List,
  Edit,
  ShieldCheck,
  Users,
  Search,
  Filter,
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
    setExpandedMenus(prev => 
      prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]
    );
  };

  const resetForms = () => {
    setHouseForm({ title: "", description: "", price: "", location: "", type: "apartment", bedrooms: "", bathrooms: "", area: "" });
    setCarForm({ title: "", description: "", price: "", location: "", make: "", model: "", year: "", fuelType: "petrol", transmission: "manual" });
    setServiceForm({ title: "", description: "", price: "", location: "", category: "plumber", experience: "" });
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
                )}
              </div>
            ))}

            <div className="h-px bg-border/40 my-6 mx-2" />

            {/* Admin Section */}
            {!isSidebarCollapsed && (
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 ml-4">Administration</p>
            )}
            
            <button
              onClick={() => setActiveTab("admin_kyc")}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                activeTab === "admin_kyc"
                  ? "bg-amber-500 text-white shadow-[0_10px_20px_-5px_rgba(245,158,11,0.4)]"
                  : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
              }`}
              title="KYC Forms"
            >
              <ShieldCheck className={`h-5 w-5 flex-shrink-0 ${activeTab === "admin_kyc" ? "scale-110" : ""}`} />
              {!isSidebarCollapsed && <span className="font-bold text-sm tracking-tight">KYC Verification</span>}
            </button>

            <button
              onClick={() => setActiveTab("admin_users")}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                activeTab === "admin_users"
                  ? "bg-slate-800 text-white shadow-[0_10px_20px_-5px_rgba(30,41,59,0.4)]"
                  : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
              }`}
              title="User Management"
            >
              <Users className={`h-5 w-5 flex-shrink-0 ${activeTab === "admin_users" ? "scale-110" : ""}`} />
              {!isSidebarCollapsed && <span className="font-bold text-sm tracking-tight">Users Management</span>}
            </button>
          </nav>
          
          {/* User info at bottom */}
          {!isSidebarCollapsed && (
            <div className="mt-auto p-6 border-t border-border/40">
              <div className="bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-2xl p-4 border border-primary/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold text-foreground/80 tracking-tight">System Online</span>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 md:p-12 overflow-x-hidden">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-12 max-w-7xl mx-auto animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-black text-foreground tracking-tight italic">Performance Hub.</h1>
                  <p className="text-muted-foreground font-medium mt-1">Real-time metrics for your DigitalBroker portfolio.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="rounded-xl border-border/60 font-bold text-xs px-5 h-11 transition-all" asChild>
                    <Link href="/help">Export Report</Link>
                  </Button>
                  <Button className="rounded-xl font-black text-xs px-6 h-11 shadow-lg shadow-primary/20 transition-all" asChild>
                    <Link href="/house-listings">Browse listings</Link>
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { label: "Active Listings", value: stats.activeListings, icon: Home, color: "text-blue-500", bg: "bg-blue-500/10", trend: "+12%" },
                  { label: "Total Reach", value: stats.totalViews.toLocaleString(), icon: BarChart3, color: "text-indigo-500", bg: "bg-indigo-500/10", trend: "+24%" },
                  { label: "Inbox Messages", value: stats.messagesReceived, icon: Clock, color: "text-violet-500", bg: "bg-violet-500/10", trend: "5 New" }
                ].map((stat, i) => (
                  <div key={i} className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500 relative overflow-hidden">
                    <div className={`absolute top-0 right-0 h-32 w-32 ${stat.bg} blur-[60px] translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                    
                    <div className="flex items-start justify-between relative z-10">
                      <div className={`p-4 ${stat.bg} rounded-2xl transition-transform duration-500 group-hover:scale-110`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">
                        {stat.trend}
                      </span>
                    </div>
                    
                    <div className="mt-8 relative z-10">
                      <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                      <p className="text-4xl font-black text-foreground tracking-tighter">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity Table */}
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-[2.5rem] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <div className="p-8 border-b border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card/30">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <h2 className="text-xl font-black tracking-tight italic">Recent Portfolio Activity</h2>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50">
                      {(["all", "rent", "sell"] as const).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setDashboardFilter(filter)}
                          className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                            dashboardFilter === filter 
                              ? "bg-card text-primary shadow-sm" 
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                    <Button variant="ghost" className="text-primary font-black text-xs hover:bg-primary/5 px-4 rounded-xl" onClick={() => setActiveTab("house_view")}>
                      Analyze All <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border/40">
                        <th className="text-left py-5 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Listing Portfolio</th>
                        <th className="text-left py-5 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</th>
                        <th className="text-left py-5 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Valuation</th>
                        <th className="text-left py-5 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">District</th>
                        <th className="text-left py-5 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                        <th className="text-left py-5 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {mockListings
                        .filter(l => dashboardFilter === "all" || l.type === dashboardFilter)
                        .map((listing) => (
                        <tr key={listing.id} className="hover:bg-primary/[0.02] transition-colors group">
                          <td className="py-6 px-8">
                            <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{listing.title}</span>
                          </td>
                          <td className="py-6 px-8">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                              listing.type === "rent" ? "bg-blue-500/10 text-blue-600" : "bg-emerald-500/10 text-emerald-600"
                            }`}>
                              {listing.type}
                            </span>
                          </td>
                          <td className="py-6 px-8">
                            <span className="font-black text-sm tracking-tight">{listing.price.toLocaleString()} <span className="text-[10px] text-muted-foreground uppercase">Br</span></span>
                          </td>
                          <td className="py-6 px-8 text-muted-foreground text-xs font-semibold">{listing.location}</td>
                          <td className="py-6 px-8">
                            <div className="flex items-center gap-2">
                              <div className={`h-1.5 w-1.5 rounded-full ${
                                listing.status === "active" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : 
                                listing.status === "occupied" ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" : "bg-slate-400"
                              }`} />
                              <span className="text-[11px] font-black uppercase tracking-wider">
                                {listing.status}
                              </span>
                            </div>
                          </td>
                          <td className="py-6 px-8 text-muted-foreground text-[11px] font-bold">{listing.createdAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Admin KYC Tab */}
          {activeTab === "admin_kyc" && (
            <div className="space-y-12 max-w-7xl mx-auto animate-fade-in">
              <div>
                <h1 className="text-4xl font-black text-foreground tracking-tight italic">KYC Verification Hub.</h1>
                <p className="text-muted-foreground font-medium mt-1">Review and approve user identity documents.</p>
              </div>

              <div className="grid gap-6">
                {[
                  { name: "Abebe Kebede", date: "2026-05-15", status: "pending", type: "National ID" },
                  { name: "Sara Tekle", date: "2026-05-14", status: "reviewed", type: "Passport" },
                  { name: "Dawit Haile", date: "2026-05-12", status: "pending", type: "Driver's License" },
                ].map((form, i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {form.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{form.name}</p>
                        <p className="text-xs text-muted-foreground">{form.type} • Submitted on {form.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        form.status === "pending" ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "bg-green-500/10 text-green-600 border border-green-500/20"
                      }`}>
                        {form.status}
                      </span>
                      <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs h-9">
                        Review Form
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Users Tab */}
          {activeTab === "admin_users" && (
            <div className="space-y-12 max-w-7xl mx-auto animate-fade-in">
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="text-4xl font-black text-foreground tracking-tight italic">User Management.</h1>
                  <p className="text-muted-foreground font-medium mt-1">Global registry of DigitalBroker users.</p>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">User</th>
                      <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Role</th>
                      <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Joined</th>
                      <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { name: "Helina Zeleke", email: "helina.zeleke@example.com", role: "Admin", date: "Jan 15, 2026" },
                      { name: "John Doe", email: "john@example.com", role: "Broker", date: "Feb 10, 2026" },
                      { name: "Marta Alemu", email: "marta@example.com", role: "User", date: "Mar 05, 2026" },
                    ].map((user, i) => (
                      <tr key={i} className="hover:bg-muted/10 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-bold text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                            user.role === "Admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs font-medium text-muted-foreground">{user.date}</td>
                        <td className="py-4 px-6">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Posting Tabs */}
          {(activeTab === "house_post" || activeTab === "car_post" || activeTab === "service_post") && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                  {activeTab === "house_post" && "Post a house"}
                  {activeTab === "car_post" && "Post a car"}
                  {activeTab === "service_post" && "Offer a service"}
                </h1>
                <p className="text-muted-foreground">Fill in the details to list your house, car or other services</p>
              </div>

              <form
                onSubmit={handlePostSubmit}
                className="bg-card border border-border rounded-xl p-8 shadow-sm space-y-8"
              >
                {/* Common Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Title</label>
                    <input
                      type="text"
                      value={activeTab === "house_post" ? houseForm.title : activeTab === "car_post" ? carForm.title : serviceForm.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (activeTab === "house_post") setHouseForm(prev => ({ ...prev, title: val }));
                        else if (activeTab === "car_post") setCarForm(prev => ({ ...prev, title: val }));
                        else setServiceForm(prev => ({ ...prev, title: val }));
                      }}
                      placeholder="Enter a catchy title"
                      className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Location</label>
                    <input
                      type="text"
                      value={activeTab === "house_post" ? houseForm.location : activeTab === "car_post" ? carForm.location : serviceForm.location}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (activeTab === "house_post") setHouseForm(prev => ({ ...prev, location: val }));
                        else if (activeTab === "car_post") setCarForm(prev => ({ ...prev, location: val }));
                        else setServiceForm(prev => ({ ...prev, location: val }));
                      }}
                      placeholder="e.g. Addis Ababa, Bole"
                      className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Description</label>
                  <textarea
                    value={activeTab === "house_post" ? houseForm.description : activeTab === "car_post" ? carForm.description : serviceForm.description}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (activeTab === "house_post") setHouseForm(prev => ({ ...prev, description: val }));
                      else if (activeTab === "car_post") setCarForm(prev => ({ ...prev, description: val }));
                      else setServiceForm(prev => ({ ...prev, description: val }));
                    }}
                    placeholder="Describe your listing in detail..."
                    className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all h-32 resize-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Price (Birr)</label>
                  <input
                    type="number"
                    value={activeTab === "house_post" ? houseForm.price : activeTab === "car_post" ? carForm.price : serviceForm.price}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (activeTab === "house_post") setHouseForm(prev => ({ ...prev, price: val }));
                      else if (activeTab === "car_post") setCarForm(prev => ({ ...prev, price: val }));
                      else setServiceForm(prev => ({ ...prev, price: val }));
                    }}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    required
                  />
                </div>

                {/* Specific Fields: Houses */}
                {activeTab === "house_post" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Property Type</label>
                      <select 
                        value={houseForm.type}
                        onChange={(e) => setHouseForm(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      >
                        <option value="apartment">Apartment</option>
                        <option value="villa">Villa</option>
                        <option value="studio">Studio</option>
                        <option value="office">Office</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Bedrooms</label>
                      <input 
                        type="number" 
                        value={houseForm.bedrooms}
                        onChange={(e) => setHouseForm(prev => ({ ...prev, bedrooms: e.target.value }))}
                        placeholder="0" 
                        className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Area (sqm)</label>
                      <input 
                        type="number" 
                        value={houseForm.area}
                        onChange={(e) => setHouseForm(prev => ({ ...prev, area: e.target.value }))}
                        placeholder="0" 
                        className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                      />
                    </div>
                  </div>
                )}

                {/* Specific Fields: Cars */}
                {activeTab === "car_post" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Make</label>
                      <input 
                        type="text" 
                        value={carForm.make}
                        onChange={(e) => setCarForm(prev => ({ ...prev, make: e.target.value }))}
                        placeholder="e.g. Toyota" 
                        className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Model</label>
                      <input 
                        type="text" 
                        value={carForm.model}
                        onChange={(e) => setCarForm(prev => ({ ...prev, model: e.target.value }))}
                        placeholder="e.g. Camry" 
                        className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Year</label>
                      <input 
                        type="number" 
                        value={carForm.year}
                        onChange={(e) => setCarForm(prev => ({ ...prev, year: e.target.value }))}
                        placeholder="2024" 
                        className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                      />
                    </div>
                  </div>
                )}

                {/* Specific Fields: Services */}
                {activeTab === "service_post" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Service Category</label>
                      <select 
                        value={serviceForm.category}
                        onChange={(e) => setServiceForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      >
                        <option value="plumber">Plumber</option>
                        <option value="electrician">Electrician</option>
                        <option value="catering">Catering</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Years of Experience</label>
                      <input 
                        type="number" 
                        value={serviceForm.experience}
                        onChange={(e) => setServiceForm(prev => ({ ...prev, experience: e.target.value }))}
                        placeholder="0" 
                        className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                      />
                    </div>
                  </div>
                )}

                {/* Images */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Images</label>
                  <div className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-all group">
                    <PlusCircle className="h-10 w-10 mx-auto text-muted-foreground group-hover:text-primary mb-3" />
                    <p className="text-muted-foreground font-medium">Click to upload or drag & drop</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                    <input type="file" multiple accept="image/*" className="hidden" />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" size="lg" className="flex-1 h-12 text-base font-bold">
                    Submit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={resetForms}
                    className="h-12 text-base font-medium px-8"
                  >
                    Clear
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* View Listings Tabs */}
          {(activeTab === "house_view" || activeTab === "car_view" || activeTab === "service_view") && (
            <div className="max-w-7xl mx-auto">
              <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {activeTab === "house_view" && "Your Houses"}
                    {activeTab === "car_view" && "Your Cars"}
                    {activeTab === "service_view" && "Your other services"}
                  </h1>
                  <p className="text-muted-foreground">Manage and update your active listings</p>
                </div>
                <Button onClick={() => {
                  if (activeTab === "house_view") setActiveTab("house_post");
                  else if (activeTab === "car_view") setActiveTab("car_post");
                  else if (activeTab === "service_view") setActiveTab("service_post");
                }} className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add New
                </Button>
              </div>

              <div className="bg-card border border-border rounded-xl shadow-sm">
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="text-left py-4 px-6 font-semibold text-sm">Name</th>
                        <th className="text-left py-4 px-6 font-semibold text-sm">Price</th>
                        <th className="text-left py-4 px-6 font-semibold text-sm">Location</th>
                        <th className="text-left py-4 px-6 font-semibold text-sm">Status</th>
                        <th className="text-left py-4 px-6 font-semibold text-sm">Date Posted</th>
                        <th className="text-right py-4 px-6 font-semibold text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {mockListings.map((listing) => (
                        <tr key={listing.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-4 px-6 font-medium">{listing.title}</td>
                          <td className="py-4 px-6 text-primary font-semibold">{listing.price.toLocaleString()} Br</td>
                          <td className="py-4 px-6 text-muted-foreground">{listing.location}</td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                listing.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : listing.status === "occupied"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-muted-foreground text-sm">{listing.createdAt}</td>
                          <td className="py-4 px-6">
                            <div className="flex justify-end gap-1">
                              <button 
                                className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-primary"
                                title="Update"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <Chat />
    </div>
  );
}
