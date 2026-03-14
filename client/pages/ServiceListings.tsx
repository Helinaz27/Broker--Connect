import Header from "@/components/Header";
import ListingCard from "@/components/ListingCard";
import FilterSection from "@/components/FilterSection";
import Chat from "@/components/Chat";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List } from "lucide-react";
import { useState } from "react";

const mockServices = [
  {
    id: "service-1",
    title: "Professional Electrician Services",
    image: "https://images.unsplash.com/photo-1621905167918-48416bd8575a?w=500&h=300&fit=crop",
    price: 500,
    location: "Addis Ababa, Bole",
    rating: 4.9,
  },
  {
    id: "service-2",
    title: "Plumbing Repair & Installation",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&h=300&fit=crop",
    price: 400,
    location: "Addis Ababa, Kazanchis",
    rating: 4.8,
  },
  {
    id: "service-3",
    title: "House Cleaning & Maintenance",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07f650?w=500&h=300&fit=crop",
    price: 300,
    location: "Addis Ababa, Summit",
    rating: 4.7,
  },
  {
    id: "service-4",
    title: "Professional Catering Service",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561821?w=500&h=300&fit=crop",
    price: 1000,
    location: "Addis Ababa, Nifas Silk",
    rating: 4.9,
  },
  {
    id: "service-5",
    title: "Garden & Landscaping Design",
    image: "https://images.unsplash.com/photo-1585924302261-fed7ffd14dcd?w=500&h=300&fit=crop",
    price: 2000,
    location: "Addis Ababa, Old Airport",
    rating: 4.6,
  },
  {
    id: "service-6",
    title: "Home Appliance Repair",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&h=300&fit=crop",
    price: 350,
    location: "Addis Ababa, Bole",
    rating: 4.8,
  },
];

export default function ServiceListings() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState({
    priceRange: [0, 100000] as [number, number],
    location: "",
  });

  const filteredServices = mockServices.filter((service) => {
    const priceMatch =
      service.price >= filters.priceRange[0] && service.price <= filters.priceRange[1];
    return priceMatch;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="container">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Services</h1>
              <p className="text-muted-foreground">
                {filteredServices.length} services available
              </p>
            </div>
            <Button size="lg" className="gap-2 w-fit">
              <Plus className="h-5 w-5" />
              Offer a Service
            </Button>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <FilterSection
              filters={filters}
              onFilterChange={setFilters}
              variant="horizontal"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-border"
              }`}
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-border"
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>

          {/* Listings */}
          {filteredServices.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {filteredServices.map((service) => (
                <ListingCard
                  key={service.id}
                  {...service}
                  category="service"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground text-lg">
                No services found matching your filters.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Chat Component */}
      <Chat />
    </div>
  );
}
