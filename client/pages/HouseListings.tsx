import Header from "@/components/Header";
import ListingCard from "@/components/ListingCard";
import FilterSection from "@/components/FilterSection";
import Chat from "@/components/Chat";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List } from "lucide-react";
import { useState } from "react";

const mockHouses = [
  {
    id: "house-1",
    title: "Beautiful Modern Apartment in Downtown",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=300&fit=crop",
    price: 15000,
    location: "Addis Ababa, Bole",
    rating: 4.8,
  },
  {
    id: "house-2",
    title: "Spacious Family Villa with Garden",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=300&fit=crop",
    price: 25000,
    location: "Addis Ababa, Old Airport",
    rating: 4.9,
  },
  {
    id: "house-3",
    title: "Cozy Studio Apartment Near Metro",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=300&fit=crop",
    price: 8000,
    location: "Addis Ababa, Nifas Silk",
    rating: 4.6,
  },
  {
    id: "house-4",
    title: "Luxury Penthouse with City View",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500&h=300&fit=crop",
    price: 35000,
    location: "Addis Ababa, Kazanchis",
    rating: 4.9,
  },
  {
    id: "house-5",
    title: "Modern 2-Bedroom in Safe Compound",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    price: 12000,
    location: "Addis Ababa, Bole",
    rating: 4.7,
  },
  {
    id: "house-6",
    title: "Executive Apartment with AC",
    image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500&h=300&fit=crop",
    price: 20000,
    location: "Addis Ababa, Summit",
    rating: 4.8,
  },
];

export default function HouseListings() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState({
    priceRange: [0, 100000] as [number, number],
    location: "",
  });

  const filteredHouses = mockHouses.filter((house) => {
    const priceMatch =
      house.price >= filters.priceRange[0] && house.price <= filters.priceRange[1];
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
              <h1 className="text-3xl md:text-4xl font-bold mb-2">House Rentals</h1>
              <p className="text-muted-foreground">
                {filteredHouses.length} properties available
              </p>
            </div>
            <Button size="lg" className="gap-2 w-fit">
              <Plus className="h-5 w-5" />
              Post a House
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
          {filteredHouses.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {filteredHouses.map((house) => (
                <ListingCard
                  key={house.id}
                  {...house}
                  category="house"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground text-lg">
                No properties found matching your filters.
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
