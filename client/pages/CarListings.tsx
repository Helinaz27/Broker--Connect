import Header from "@/components/Header";
import ListingCard from "@/components/ListingCard";
import FilterSection from "@/components/FilterSection";
import Chat from "@/components/Chat";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List } from "lucide-react";
import { useState } from "react";

const mockCars = [
  {
    id: "car-1",
    title: "2022 Toyota Camry - Sedan",
    image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&h=300&fit=crop",
    price: 1500,
    location: "Addis Ababa, Bole",
    rating: 4.9,
  },
  {
    id: "car-2",
    title: "2020 Hyundai Tucson - SUV",
    image: "https://images.unsplash.com/photo-1567818735868-e71b99932e29?w=500&h=300&fit=crop",
    price: 2000,
    location: "Addis Ababa, Kazanchis",
    rating: 4.8,
  },
  {
    id: "car-3",
    title: "2021 Honda Civic - Sedan",
    image: "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500&h=300&fit=crop",
    price: 1800,
    location: "Addis Ababa, Summit",
    rating: 4.7,
  },
  {
    id: "car-4",
    title: "2023 Chevrolet Trailblazer - SUV",
    image: "https://images.unsplash.com/photo-1605559424843-9e4c3feb3a81?w=500&h=300&fit=crop",
    price: 2500,
    location: "Addis Ababa, Nifas Silk",
    rating: 4.9,
  },
  {
    id: "car-5",
    title: "2019 Mazda CX-5 - SUV",
    image: "https://images.unsplash.com/photo-1533473359331-35a7a5e31636?w=500&h=300&fit=crop",
    price: 1600,
    location: "Addis Ababa, Old Airport",
    rating: 4.6,
  },
  {
    id: "car-6",
    title: "2022 Kia Sportage - Compact SUV",
    image: "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500&h=300&fit=crop",
    price: 1900,
    location: "Addis Ababa, Bole",
    rating: 4.8,
  },
];

export default function CarListings() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState({
    priceRange: [0, 100000] as [number, number],
    location: "",
  });

  const filteredCars = mockCars.filter((car) => {
    const priceMatch =
      car.price >= filters.priceRange[0] && car.price <= filters.priceRange[1];
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
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Car Rentals</h1>
              <p className="text-muted-foreground">
                {filteredCars.length} vehicles available
              </p>
            </div>
            <Button size="lg" className="gap-2 w-fit">
              <Plus className="h-5 w-5" />
              Post a Car
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
          {filteredCars.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {filteredCars.map((car) => (
                <ListingCard
                  key={car.id}
                  {...car}
                  category="car"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground text-lg">
                No vehicles found matching your filters.
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
