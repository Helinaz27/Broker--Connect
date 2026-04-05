"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
} from "lucide-react";

type DashboardTab = "dashboard" | "house_post" | "house_view" | "car_post" | "car_view" | "service_post" | "service_view";

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  status: "active" | "occupied" | "inactive";
  createdAt: string;
}

const mockListings: Listing[] = [
  {
    id: "1",
    title: "Beautiful Modern Apartment in Downtown",
    price: 15000,
    location: "Addis Ababa, Bole",
    status: "active",
    createdAt: "2026-01-15",
  },
  {
    id: "2",
    title: "Spacious Family Villa with Garden",
    price: 25000,
    location: "Addis Ababa, Old Airport",
    status: "occupied",
    createdAt: "2026-01-10",
  },
  {
    id: "3",
    title: "Professional Electrician Services",
    price: 500,
    location: "Addis Ababa, Bole",
    status: "active",
    createdAt: "2026-01-20",
  },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  
  const [houseForm, setHouseForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    type: "apartment",
    bedrooms: "",
    bathrooms: "",
    area: "",
  });

  const [carForm, setCarForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    make: "",
    model: "",
    year: "",
    fuelType: "petrol",
    transmission: "manual",
  });

  const [serviceForm, setServiceForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    category: "plumber",
    experience: "",
  });

  const stats = {
    activeListings: 8,
    totalViews: 324,
    messagesReceived: 42,
  };

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
    // Submit form logic here
    resetForms();
    alert("Listing posted successfully!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent_50%)]" />
      <Header />

      <div className="flex-1 flex relative z-10">
        {/* Sidebar */}
        <aside className={`${isSidebarCollapsed ? "w-20" : "w-72"} bg-card/50 backdrop-blur-xl border-r border-border/50 transition-all duration-500 flex flex-col sticky top-16 h-[calc(100vh-64px)] overflow-y-auto z-40 group/sidebar`}>
          <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
            {!isSidebarCollapsed && (
              <span className="text-sm font-semibold text-foreground">Dashboard</span>
            )}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2.5 hover:bg-primary/10 hover:text-primary rounded-xl transition-all duration-300"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {/* Dashboard */}
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                activeTab === "dashboard"
                  ? "bg-primary text-primary-foreground shadow-[0_10px_20px_-5px_rgba(59,130,246,0.4)]"
                  : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
              }`}
              title="Dashboard"
            >
              <LayoutDashboard className={`h-5 w-5 flex-shrink-0 transition-transform duration-500 ${activeTab === "dashboard" ? "scale-110" : ""}`} />
              {!isSidebarCollapsed && <span className="font-bold text-sm tracking-tight">Overview</span>}
            </button>

            <div className="h-px bg-border/40 my-6 mx-2" />

            {/* Categories */}
            {[
              { id: "houses", label: "Properties", icon: Home, postTab: "house_post" as DashboardTab, viewTab: "house_view" as DashboardTab, color: "text-blue-500" },
              { id: "cars", label: "Vehicles", icon: Car, postTab: "car_post" as DashboardTab, viewTab: "car_view" as DashboardTab, color: "text-indigo-500" },
              { id: "services", label: "Services", icon: Wrench, postTab: "service_post" as DashboardTab, viewTab: "service_view" as DashboardTab, color: "text-violet-500" }
            ].map((cat) => (
              <div key={cat.id} className="space-y-1">
                <button
                  onClick={() => toggleMenu(cat.id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl hover:bg-muted/50 transition-all duration-300 text-muted-foreground hover:text-foreground group/item ${
                    (activeTab === cat.postTab || activeTab === cat.viewTab) ? "bg-muted/30 text-foreground" : ""
                  }`}
                  title={cat.label}
                >
                  <div className="flex items-center gap-3.5">
                    <cat.icon className={`h-5 w-5 flex-shrink-0 transition-colors ${ (activeTab === cat.postTab || activeTab === cat.viewTab) ? cat.color : "group-hover/item:text-primary" }`} />
                    {!isSidebarCollapsed && <span className="font-bold text-sm tracking-tight">{cat.label}</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-500 ${expandedMenus.includes(cat.id) ? "rotate-180" : "-rotate-90 opacity-40"}`} />
                  )}
                </button>
                
                {!isSidebarCollapsed && expandedMenus.includes(cat.id) && (
                  <div className="ml-12 space-y-1 pr-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <button
                      onClick={() => setActiveTab(cat.postTab)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] rounded-xl transition-all ${
                        activeTab === cat.postTab
                          ? "text-primary font-black bg-primary/5"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                      }`}
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      Create Listing
                    </button>
                    <button
                      onClick={() => setActiveTab(cat.viewTab)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] rounded-xl transition-all ${
                        activeTab === cat.viewTab
                          ? "text-primary font-black bg-primary/5"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                      }`}
                    >
                      <List className="h-3.5 w-3.5" />
                      Manage All
                    </button>
                  </div>
                )}
              </div>
            ))}
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
                <div className="p-8 border-b border-border/40 flex items-center justify-between bg-card/30">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <h2 className="text-xl font-black tracking-tight italic">Recent Portfolio Activity</h2>
                  </div>
                  <Button variant="ghost" className="text-primary font-black text-xs hover:bg-primary/5 px-4 rounded-xl" onClick={() => setActiveTab("house_view")}>
                    Analyze All <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border/40">
                        <th className="text-left py-5 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Listing Portfolio</th>
                        <th className="text-left py-5 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Valuation</th>
                        <th className="text-left py-5 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">District</th>
                        <th className="text-left py-5 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                        <th className="text-left py-5 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {mockListings.map((listing) => (
                        <tr key={listing.id} className="hover:bg-primary/[0.02] transition-colors group">
                          <td className="py-6 px-8">
                            <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{listing.title}</span>
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

          {/* Posting Tabs */}
          {(activeTab === "house_post" || activeTab === "car_post" || activeTab === "service_post") && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                  {activeTab === "house_post" && "Post a House"}
                  {activeTab === "car_post" && "Post a Car"}
                  {activeTab === "service_post" && "Offer a Service"}
                </h1>
                <p className="text-muted-foreground">Fill in the details to list your property or service</p>
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
                    {activeTab === "service_view" && "Your Services"}
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

      <Footer />
      {/* Chat Component */}
      <Chat />
    </div>
  );
}
