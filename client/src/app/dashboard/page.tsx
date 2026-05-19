"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Home,
  Car,
  Wrench,
  BarChart3,
  Clock,
  Menu,
  PlusCircle,
  Edit,
  ShieldCheck,
  Users,
  Search,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
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
  { id: "1", title: "Beautiful Modern Apartment in Downtown", price: 15000, location: "Addis Ababa, Bole", status: "active", type: "rent", createdAt: "2026-01-15", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800" },
  { id: "2", title: "Spacious Family Villa with Garden", price: 25000, location: "Addis Ababa, Old Airport", status: "occupied", type: "sell", createdAt: "2026-01-10", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800" },
  { id: "3", title: "Professional Electrician Services", price: 500, location: "Addis Ababa, Bole", status: "active", type: "rent", createdAt: "2026-01-20", image: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?auto=format&fit=crop&q=80&w=800" },
  { id: "4", title: "2024 Toyota Land Cruiser V8", price: 12000000, location: "Addis Ababa, Sarbet", status: "active", type: "sell", createdAt: "2026-02-01", image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800" },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [dashboardFilter, setDashboardFilter] = useState<"all" | "rent" | "sell">("all");

  const stats = [
    { label: "Active Listings", value: "12", icon: Home, color: "text-blue-500", bg: "bg-blue-500/10", trend: "+12%" },
    { label: "Market Reach", value: "1,284", icon: BarChart3, color: "text-indigo-500", bg: "bg-indigo-500/10", trend: "+24%" },
    { label: "Asset Inquiries", value: "38", icon: Clock, color: "text-violet-500", bg: "bg-violet-500/10", trend: "5 New" }
  ];

  const menuItems = [
    { id: "houses", label: "Houses", icon: Home, post: "house_post", view: "house_view", color: "text-primary" },
    { id: "cars", label: "Cars", icon: Car, post: "car_post", view: "car_view", color: "text-blue-500" },
    { id: "services", label: "Services", icon: Wrench, post: "service_post", view: "service_view", color: "text-emerald-500" }
  ];

  const adminItems = [
    { id: "admin_kyc", label: "KYC Audits", icon: ShieldCheck, color: "bg-amber-500/10 text-amber-600" },
    { id: "admin_users", label: "User Directory", icon: Users, color: "bg-primary/10 text-primary" }
  ];

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

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-background">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab as DashboardTab);
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

      <main className="flex-1 p-6 md:p-12 overflow-y-auto custom-scrollbar bg-muted/30">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-10 w-10 rounded-xl"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="font-bold text-lg italic">Broker Console.</h1>
            </div>
          </div>

          {activeTab === "dashboard" && (
            <div className="space-y-12 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-black text-foreground tracking-tight italic">Broker Portfolio Analytics.</h1>
                  <p className="text-muted-foreground font-medium mt-1">Real-time metrics for your Broker Connect portfolio.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="rounded-xl border-border/60 font-bold text-xs px-5 h-11 transition-all" asChild>
                    <Link href="/help">Export Report</Link>
                  </Button>
                  <Button className="rounded-xl font-black text-xs px-6 h-11 shadow-lg shadow-primary/20 transition-all" asChild onClick={() => setActiveTab("house_post")}>
                    <div className="flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      New Post
                    </div>
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map((stat, i) => (
                  <div key={i} className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 blur-[60px] translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
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
            <div className="space-y-12 animate-fade-in">
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
            <div className="space-y-12 animate-fade-in">
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="text-4xl font-black text-foreground tracking-tight italic">User Management.</h1>
                  <p className="text-muted-foreground font-medium mt-1">Global registry of Broker Connect users.</p>
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

          {/* Placeholder for other tabs */}
          {activeTab.includes("_view") && (
            <div className="space-y-12 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-black text-foreground tracking-tight italic">
                    {activeTab === "house_view" ? "House" : activeTab === "car_view" ? "Car" : "Service"} Portfolio.
                  </h1>
                  <p className="text-muted-foreground font-medium mt-1">Manage and analyze your {activeTab.split("_")[0]} listings.</p>
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
                </div>
              </div>

              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-[2.5rem] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border/40">
                        <th className="text-left py-5 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Listing</th>
                        <th className="text-left py-5 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</th>
                        <th className="text-left py-5 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Price</th>
                        <th className="text-left py-5 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Location</th>
                        <th className="text-left py-5 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                        <th className="text-right py-5 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</th>
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
                            <td className="py-6 px-8 font-black text-sm">{listing.price.toLocaleString()} Br</td>
                            <td className="py-6 px-8 text-muted-foreground text-xs font-semibold">{listing.location}</td>
                            <td className="py-6 px-8">
                              <div className="flex items-center gap-2">
                                <div className={`h-1.5 w-1.5 rounded-full ${listing.status === "active" ? "bg-green-500" : "bg-slate-400"}`} />
                                <span className="text-[11px] font-black uppercase tracking-wider">{listing.status}</span>
                              </div>
                            </td>
                            <td className="py-6 px-8 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-destructive/10 hover:text-destructive">
                                  <Clock className="h-4 w-4" />
                                </Button>
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

          {activeTab.includes("_post") && (
             <div className="space-y-12 animate-fade-in">
                <h1 className="text-4xl font-black text-foreground tracking-tight italic">Coming Soon.</h1>
                <p className="text-muted-foreground font-medium mt-1">Asset posting features are being optimized for the new brand identity.</p>
             </div>
          )}
        </div>
      </main>
      <Chat />
    </div>
  );
}
