import { useState } from "react";
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
    category: "maintenance",
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
    setServiceForm({ title: "", description: "", price: "", location: "", category: "maintenance", experience: "" });
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit form logic here
    resetForms();
    alert("Listing posted successfully!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <Header />

      <div className="flex-1 flex relative">
        {/* Sidebar */}
        <aside className={`${isSidebarCollapsed ? "w-20" : "w-64"} bg-card border-r border-border transition-all duration-300 flex flex-col sticky top-16 h-[calc(100vh-64px)] overflow-y-auto z-40`}>
          <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
            {!isSidebarCollapsed && <span className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Menu</span>}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
          
          <nav className="flex-1 p-3 space-y-2">
            {/* Dashboard */}
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeTab === "dashboard"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "hover:bg-muted text-foreground"
              }`}
              title="Dashboard"
            >
              <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
              {!isSidebarCollapsed && <span className="font-medium">Dashboard</span>}
            </button>

            {/* Categories */}
            {[
              { id: "houses", label: "Houses", icon: Home, postTab: "house_post" as DashboardTab, viewTab: "house_view" as DashboardTab },
              { id: "cars", label: "Cars", icon: Car, postTab: "car_post" as DashboardTab, viewTab: "car_view" as DashboardTab },
              { id: "services", label: "Services", icon: Wrench, postTab: "service_post" as DashboardTab, viewTab: "service_view" as DashboardTab }
            ].map((cat) => (
              <div key={cat.id} className="space-y-1">
                <button
                  onClick={() => toggleMenu(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted transition-all text-foreground ${
                    (activeTab === cat.postTab || activeTab === cat.viewTab) ? "bg-muted/50" : ""
                  }`}
                  title={cat.label}
                >
                  <div className="flex items-center gap-3">
                    <cat.icon className="h-5 w-5 flex-shrink-0" />
                    {!isSidebarCollapsed && <span className="font-medium">{cat.label}</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    expandedMenus.includes(cat.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                
                {!isSidebarCollapsed && expandedMenus.includes(cat.id) && (
                  <div className="ml-9 space-y-1 pr-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <button
                      onClick={() => setActiveTab(cat.postTab)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                        activeTab === cat.postTab
                          ? "text-primary font-bold bg-primary/5"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <PlusCircle className="h-4 w-4" />
                      Post a {cat.label.slice(0, -1)}
                    </button>
                    <button
                      onClick={() => setActiveTab(cat.viewTab)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                        activeTab === cat.viewTab
                          ? "text-primary font-bold bg-primary/5"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <List className="h-4 w-4" />
                      View All {cat.label}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 max-w-7xl mx-auto">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Overview</h1>
                <p className="text-muted-foreground">Manage your listings and track performance</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Home className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm font-medium mb-1">Active Listings</p>
                    <p className="text-3xl font-bold text-foreground">{stats.activeListings}</p>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm font-medium mb-1">Total Views</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalViews}</p>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm font-medium mb-1">Messages</p>
                    <p className="text-3xl font-bold text-foreground">{stats.messagesReceived}</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-card border border-border rounded-xl shadow-sm">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h2 className="text-xl font-bold">Recent Listings</h2>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("house_view")}>View All</Button>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left py-4 px-6 font-semibold text-sm">Listing</th>
                        <th className="text-left py-4 px-6 font-semibold text-sm">Price</th>
                        <th className="text-left py-4 px-6 font-semibold text-sm">Location</th>
                        <th className="text-left py-4 px-6 font-semibold text-sm">Status</th>
                        <th className="text-left py-4 px-6 font-semibold text-sm">Date</th>
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
                        <option value="maintenance">Maintenance</option>
                        <option value="cleaning">Cleaning</option>
                        <option value="catering">Catering</option>
                        <option value="it">IT & Software</option>
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