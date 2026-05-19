export type ListingCategory = "house" | "car" | "otherService" | "service";

export interface BaseListing {
  id: string;
  title: string;
  image: string;
  images?: string[];
  price: number;
  location: string;
  rating: number;
  description?: string;
}

export const houses: (BaseListing & { category: "house" })[] = [
  { id: "house-1", title: "Luxury Apartment in Bole Atlas", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800", price: 45000, location: "Addis Ababa, Bole Atlas", rating: 4.9, category: "house", description: "Modern 3-bedroom apartment with high-end finishing. Features 24/7 security, backup generator, and breathtaking city views." },
  { id: "house-2", title: "Spacious Villa in Old Airport", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800", price: 85000, location: "Addis Ababa, Old Airport", rating: 4.8, category: "house", description: "Elegant 5-bedroom villa with a large private garden, servant quarters, and ample parking. Located in a secure diplomatic neighborhood." },
  { id: "house-3", title: "Modern Studio in Kazanchis", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800", price: 12000, location: "Addis Ababa, Kazanchis", rating: 4.7, category: "house", description: "Fully furnished studio apartment near the UNECA. Perfect for business travelers or young professionals." },
  { id: "house-4", title: "Family Home in CMC", image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800", price: 35000, location: "Addis Ababa, CMC", rating: 4.6, category: "house", description: "G+1 house in a quiet residential area. Features 4 bedrooms, modern kitchen, and a small backyard." },
  { id: "house-5", title: "Penthouse in Sarbet", image: "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&q=80&w=800", price: 65000, location: "Addis Ababa, Sarbet", rating: 5.0, category: "house", description: "Ultra-modern penthouse with panoramic views of the city. Private elevator access and luxury amenities." },
  { id: "house-6", title: "Apartment in Summit", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800", price: 18000, location: "Addis Ababa, Summit", rating: 4.5, category: "house", description: "Brand new 2-bedroom apartment in the Summit area. Secure parking and easy access to the light rail." },
  { id: "house-7", title: "G+2 House in Lebu", image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&q=80&w=800", price: 40000, location: "Addis Ababa, Lebu", rating: 4.7, category: "house", description: "Spacious G+2 house suitable for a large family or office space. Multiple balconies and secure fencing." },
  { id: "house-8", title: "Condominium in Ayat", image: "https://images.unsplash.com/photo-1460317442991-0ec239397144?auto=format&fit=crop&q=80&w=800", price: 9500, location: "Addis Ababa, Ayat", rating: 4.4, category: "house", description: "Well-maintained 2-bedroom condominium in the Ayat residential complex." },
];

export const cars: (BaseListing & { category: "car" })[] = [
  { id: "car-1", title: "2024 Toyota Land Cruiser V8", image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800", price: 12000, location: "Addis Ababa, Bole", rating: 5.0, category: "car", description: "Brand new 2024 Land Cruiser V8. Full options, zero mileage. Available for long-term rental or purchase." },
  { id: "car-2", title: "2022 Hyundai Tucson", image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800", price: 3500, location: "Addis Ababa, Sarbet", rating: 4.8, category: "car", description: "Excellent condition Hyundai Tucson. Fuel efficient and comfortable for city driving." },
  { id: "car-3", title: "Mercedes-Benz G-Wagon", image: "https://images.unsplash.com/photo-1520050206274-a1af446338cb?auto=format&fit=crop&q=80&w=800", price: 15000, location: "Addis Ababa, Bole Atlas", rating: 4.9, category: "car", description: "Luxury G-Wagon available for VIP transport and events. Professional driver included." },
  { id: "car-4", title: "2023 Suzuki Dzire", image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=800", price: 1800, location: "Addis Ababa, Gerji", rating: 4.6, category: "car", description: "Great for daily commute. Very low fuel consumption and easy to park." },
  { id: "car-5", title: "Toyota Hilux Pickup", image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800", price: 4500, location: "Addis Ababa, Kazanchis", rating: 4.7, category: "car", description: "Heavy-duty 4x4 pickup. Ideal for field work and transporting goods." },
  { id: "car-6", title: "2021 Volkswagen ID.4 (Electric)", image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800", price: 4000, location: "Addis Ababa, Old Airport", rating: 4.9, category: "car", description: "Experience the future with this all-electric SUV. Fast charging and zero emissions." },
];

export const services: (BaseListing & { category: "service" })[] = [
  { id: "service-1", title: "Expert Home Renovation", image: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?auto=format&fit=crop&q=80&w=800", price: 1500, location: "Addis Ababa, Bole", rating: 4.9, category: "service", description: "Professional painting, flooring, and interior design services for your home or office." },
  { id: "service-2", title: "Certified Master Plumber", image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&q=80&w=800", price: 500, location: "Addis Ababa, Sarbet", rating: 4.8, category: "service", description: "Available for emergency repairs, leak detection, and new installations." },
  { id: "service-3", title: "Gourmet Event Catering", image: "https://images.unsplash.com/photo-1555939594-58d7cb561821?auto=format&fit=crop&q=80&w=800", price: 2500, location: "Addis Ababa, Old Airport", rating: 5.0, category: "service", description: "Exquisite Ethiopian and International cuisine for weddings, corporate events, and parties." },
  { id: "service-4", title: "Professional Cleaning Service", image: "https://images.unsplash.com/photo-1581578731548-c64695ce6958?auto=format&fit=crop&q=80&w=800", price: 800, location: "Addis Ababa, Kazanchis", rating: 4.7, category: "service", description: "Deep cleaning for apartments, offices, and commercial spaces. Eco-friendly products used." },
  { id: "service-5", title: "Elite Security Personnel", image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=800", price: 3000, location: "Addis Ababa, Bole Atlas", rating: 4.9, category: "service", description: "Highly trained security guards for residential and commercial property protection." },
];

export function getListingPath(category: ListingCategory, id: string): string {
  const base = category === "house" ? "house-listings" : category === "car" ? "car-listings" : "service-listings";
  return `/${base}/${id}`;
}

export function getHouseById(id: string) {
  return houses.find((h) => h.id === id);
}

export function getCarById(id: string) {
  return cars.find((c) => c.id === id);
}

export function getOtherServiceById(id: string) {
  return otherServices.find((s) => s.id === id);
}

// Legacy support for services
export const services = otherServices;
export function getServiceById(id: string) {
  return getOtherServiceById(id);
}
