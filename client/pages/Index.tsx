import Header from "@/components/Header";
import ListingCard from "@/components/ListingCard";
import FilterSection from "@/components/FilterSection";
import Chat from "@/components/Chat";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

// Mock data
const mockHouseListings = [
  {
    id: "house-1",
    title: "Beautiful Modern Apartment in Downtown",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=300&fit=crop",
    price: 15000,
    location: "Addis Ababa, Bole",
    category: "house" as const,
  },
  {
    id: "house-2",
    title: "Spacious Family Villa with Garden",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=300&fit=crop",
    price: 25000,
    location: "Addis Ababa, Old Airport",
    category: "house" as const,
  },
  {
    id: "house-3",
    title: "Cozy Studio Apartment Near Metro",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=300&fit=crop",
    price: 8000,
    location: "Addis Ababa, Nifas Silk",
    category: "house" as const,
  },
  {
    id: "house-4",
    title: "Luxury Penthouse with City View",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500&h=300&fit=crop",
    price: 35000,
    location: "Addis Ababa, Kazanchis",
    category: "house" as const,
  },
];

const mockCarListings = [
  {
    id: "car-1",
    title: "2022 Toyota Camry - Sedan",
    image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&h=300&fit=crop",
    price: 1500,
    location: "Addis Ababa, Bole",
    category: "car" as const,
  },
  {
    id: "car-2",
    title: "2020 Hyundai Tucson - SUV",
    image: "https://images.unsplash.com/photo-1567818735868-e71b99932e29?w=500&h=300&fit=crop",
    price: 2000,
    location: "Addis Ababa, Kazanchis",
    category: "car" as const,
  },
  {
    id: "car-3",
    title: "2021 Honda Civic - Sedan",
    image: "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500&h=300&fit=crop",
    price: 1800,
    location: "Addis Ababa, Summit",
    category: "car" as const,
  },
  {
    id: "car-4",
    title: "2023 Chevrolet Trailblazer - SUV",
    image: "https://images.unsplash.com/photo-1605559424843-9e4c3feb3a81?w=500&h=300&fit=crop",
    price: 2500,
    location: "Addis Ababa, Nifas Silk",
    category: "car" as const,
  },
];

const mockServiceListings = [
  {
    id: "service-1",
    title: "Professional Electrician Services",
    image: "https://images.unsplash.com/photo-1621905167918-48416bd8575a?w=500&h=300&fit=crop",
    price: 500,
    location: "Addis Ababa, Bole",
    category: "service" as const,
  },
  {
    id: "service-2",
    title: "Plumbing Repair & Installation",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&h=300&fit=crop",
    price: 400,
    location: "Addis Ababa, Kazanchis",
    category: "service" as const,
  },
  {
    id: "service-3",
    title: "House Cleaning & Maintenance",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&h=300&fit=crop",
    price: 300,
    location: "Addis Ababa, Summit",
    category: "service" as const,
  },
  {
    id: "service-4",
    title: "Professional Catering Service",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561821?w=500&h=300&fit=crop",
    price: 1000,
    location: "Addis Ababa, Nifas Silk",
    category: "service" as const,
  },
];

export default function Index() {
  const [filters, setFilters] = useState({
    priceRange: [0, 100000] as [number, number],
    location: "",
    search: "",
    type: "all" as "all" | "house" | "car" | "service",
  });

  const filterBySearch = (items: any[]) => {
    return items.filter((item) => {
      const priceMatch =
        item.price >= filters.priceRange[0] && item.price <= filters.priceRange[1];
      const searchMatch = !filters.search || item.title.toLowerCase().includes(filters.search.toLowerCase());
      const locationMatch = !filters.location || item.location.toLowerCase().includes(filters.location.toLowerCase());
      return priceMatch && searchMatch && locationMatch;
    });
  };

  const filteredHouses = filterBySearch(
    filters.type === "all" || filters.type === "house" ? mockHouseListings : []
  );

  const filteredCars = filterBySearch(
    filters.type === "all" || filters.type === "car" ? mockCarListings : []
  );

  const filteredServices = filterBySearch(
    filters.type === "all" || filters.type === "service" ? mockServiceListings : []
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12 md:py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight text-foreground">
                Your Trusted Digital Marketplace
              </h1>
              <p className="text-lg text-muted-foreground">
                Connect with verified renters, sellers, and service providers. Safe, secure, and transparent transactions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Post a Service
                </Button>
              </div>

              <div className="pt-4 max-w-2xl">
                <FilterSection
                  filters={filters}
                  onFilterChange={setFilters}
                  variant="horizontal"
                />
              </div>
            </div>

            {/* Illustration */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-3xl opacity-10 blur-2xl" />
                <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Home className="h-24 w-24 mx-auto text-primary/30 mb-4" />
                    <p className="text-muted-foreground">Marketplace Illustration</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Illustration */}
      <section className="py-16 border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">House Rentals</h2>
              <p className="text-muted-foreground">Find your perfect home</p>
            </div>
            <Link to="/houses" className="flex items-center gap-1 text-primary hover:gap-2 transition-all">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredHouses.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        </div>
      </section>

      {/* Car Rentals Section */}
      <section className="py-16 border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Car Rentals</h2>
              <p className="text-muted-foreground">Drive your way, your choice</p>
            </div>
            <Link to="/cars" className="flex items-center gap-1 text-primary hover:gap-2 transition-all">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCars.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Services</h2>
              <p className="text-muted-foreground">Find trusted professionals</p>
            </div>
            <Link to="/services" className="flex items-center gap-1 text-primary hover:gap-2 transition-all">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredServices.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Chat Component */}
      <Chat />
    </div>
  );
}
