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
  { id: "house-1", title: "Modern Apartment in Bole", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=300&fit=crop", price: 15000, location: "Addis Ababa, Bole", rating: 4.8, category: "house", description: "Spacious 2-bedroom apartment with balcony. Secure compound, parking. Near Bole Road." },
  { id: "house-2", title: "Family Villa with Garden", image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=300&fit=crop", price: 25000, location: "Addis Ababa, Old Airport", rating: 4.9, category: "house", description: "3-bedroom villa with private garden. Ideal for families. Quiet neighborhood." },
  { id: "house-3", title: "Cozy Studio Near Meskel Square", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=300&fit=crop", price: 8000, location: "Addis Ababa, Nifas Silk-Lafto", rating: 4.6, category: "house", description: "Furnished studio, perfect for students or professionals. Close to transport." },
  { id: "house-4", title: "Penthouse with City View", image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500&h=300&fit=crop", price: 35000, location: "Addis Ababa, Kazanchis", rating: 4.9, category: "house", description: "Luxury penthouse with panoramic views. 24/7 security, gym access." },
  { id: "house-5", title: "2-Bedroom in Safe Compound", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop", price: 12000, location: "Addis Ababa, Bole", rating: 4.7, category: "house", description: "Gated compound, generator backup. Walking distance to shops and cafes." },
  { id: "house-6", title: "Executive Apartment with AC", image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500&h=300&fit=crop", price: 20000, location: "Addis Ababa, Summit", rating: 4.8, category: "house", description: "Fully furnished, AC in all rooms. Suitable for expats or business." },
  { id: "house-7", title: "Affordable 1-Bed in Kirkos", image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500&h=300&fit=crop", price: 5500, location: "Addis Ababa, Kirkos", rating: 4.4, category: "house", description: "Clean 1-bedroom, shared compound. Near minibus routes." },
  { id: "house-8", title: "Furnished Apartment Near Edna Mall", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=300&fit=crop", price: 18000, location: "Addis Ababa, Bole", rating: 4.8, category: "house", description: "Walking distance to Edna Mall. WiFi, cable TV, modern kitchen." },
  { id: "house-9", title: "House for Rent in Mekelle", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&h=300&fit=crop", price: 9000, location: "Mekelle, Tigray", rating: 4.5, category: "house", description: "3-bedroom house with yard. Quiet area, good for family." },
  { id: "house-10", title: "Villa in Bahir Dar", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&h=300&fit=crop", price: 11000, location: "Bahir Dar, Amhara", rating: 4.7, category: "house", description: "Near Lake Tana. Spacious villa with garden. Long-term welcome." },
];

export const cars: (BaseListing & { category: "car" })[] = [
  { id: "car-1", title: "2022 Toyota Camry – Sedan", image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&h=300&fit=crop", price: 1500, location: "Addis Ababa, Bole", rating: 4.9, category: "car", description: "Well maintained, full service history. Available for daily or monthly hire." },
  { id: "car-2", title: "2020 Hyundai Tucson – SUV", image: "https://images.unsplash.com/photo-1567818735868-e71b99932e29?w=500&h=300&fit=crop", price: 2000, location: "Addis Ababa, Kazanchis", rating: 4.8, category: "car", description: "7-seater option. Good for family trips or out-of-town." },
  { id: "car-3", title: "2021 Honda Civic – Sedan", image: "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500&h=300&fit=crop", price: 1800, location: "Addis Ababa, Summit", rating: 4.7, category: "car", description: "Fuel efficient, AC. Ideal for city and short trips." },
  { id: "car-4", title: "2023 Chevrolet Trailblazer – SUV", image: "https://images.unsplash.com/photo-1605559424843-9e4c3feb3a81?w=500&h=300&fit=crop", price: 2500, location: "Addis Ababa, Nifas Silk-Lafto", rating: 4.9, category: "car", description: "New model, low mileage. Perfect for road trips." },
  { id: "car-5", title: "2019 Toyota Hiace – Minibus", image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&h=300&fit=crop", price: 2200, location: "Addis Ababa, Old Airport", rating: 4.6, category: "car", description: "14-seater. For group travel, events, or tours." },
  { id: "car-6", title: "2022 Kia Sportage – SUV", image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=500&h=300&fit=crop", price: 1900, location: "Addis Ababa, Bole", rating: 4.8, category: "car", description: "Compact SUV, easy parking. Daily or weekly hire." },
  { id: "car-7", title: "Toyota Land Cruiser – 4x4", image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500&h=300&fit=crop", price: 3500, location: "Addis Ababa, Bole", rating: 4.9, category: "car", description: "For rough roads and long trips. Driver available on request." },
  { id: "car-8", title: "2018 Nissan X-Trail – SUV", image: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=500&h=300&fit=crop", price: 1700, location: "Dire Dawa", rating: 4.5, category: "car", description: "Available in Dire Dawa. Good condition, AC." },
  { id: "car-9", title: "2020 Toyota Corolla – Sedan", image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&h=300&fit=crop", price: 1400, location: "Addis Ababa, CMC", rating: 4.7, category: "car", description: "Economical sedan. Perfect for city use." },
  { id: "car-10", title: "Hyundai Starex – Van", image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&h=300&fit=crop", price: 2000, location: "Addis Ababa, Kazanchis", rating: 4.6, category: "car", description: "9-seater van for family or group. Airport pickup available." },
];

export const otherServices: (BaseListing & { category: "otherService" })[] = [
  // Plumber
  { id: "service-1", title: "Professional Plumber – Repairs & Installation", image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&h=300&fit=crop", price: 400, location: "Addis Ababa, Kazanchis", rating: 4.8, category: "otherService", description: "Pipe repair, taps, toilets, water heaters. Same-day service in Addis." },
  { id: "service-2", title: "Plumber – Emergency Leak & Blockage", image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=500&h=300&fit=crop", price: 450, location: "Addis Ababa, Kirkos", rating: 4.6, category: "otherService", description: "Leak repair, blockage clearing. Quick response in Addis." },
  { id: "service-3", title: "Licensed Plumber – Bole", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&h=300&fit=crop", price: 420, location: "Addis Ababa, Bole", rating: 4.9, category: "otherService", description: "Bathroom and kitchen installations. Water heater setup and repair." },
  { id: "service-4", title: "Plumber – Installation & Maintenance", image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&h=300&fit=crop", price: 380, location: "Addis Ababa, Nifas Silk-Lafto", rating: 4.7, category: "otherService", description: "New plumbing, pipe replacement. Regular maintenance contracts." },
  // Electrician
  { id: "service-5", title: "Licensed Electrician – Addis Ababa", image: "https://images.unsplash.com/photo-1621905167918-48416bd8575a?w=500&h=300&fit=crop", price: 500, location: "Addis Ababa, Bole", rating: 4.9, category: "otherService", description: "Wiring, repairs, installations. Residential and commercial. Certified." },
  { id: "service-6", title: "Electrician – Wiring & Generator Setup", image: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=500&h=300&fit=crop", price: 550, location: "Addis Ababa, Bole", rating: 4.8, category: "otherService", description: "Home and office. Generator installation and repair." },
  { id: "service-7", title: "Professional Electrician – Kazanchis", image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&h=300&fit=crop", price: 480, location: "Addis Ababa, Kazanchis", rating: 4.7, category: "otherService", description: "Electrical panels, lighting, socket installation. Same-day call-out." },
  { id: "service-8", title: "Electrician – Home & Office", image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&h=300&fit=crop", price: 520, location: "Addis Ababa, Summit", rating: 4.8, category: "otherService", description: "Full rewiring, fault finding. Certified and insured." },
  // Catering
  { id: "service-9", title: "Catering for Events – Ethiopian & International", image: "https://images.unsplash.com/photo-1555939594-58d7cb561821?w=500&h=300&fit=crop", price: 1000, location: "Addis Ababa, Nifas Silk-Lafto", rating: 4.9, category: "otherService", description: "Weddings, meetings, parties. Per person or full service." },
  { id: "service-10", title: "Wedding & Event Catering", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=300&fit=crop", price: 1200, location: "Addis Ababa, Bole", rating: 4.9, category: "otherService", description: "Full wedding menus. Traditional Ethiopian and international options." },
  { id: "service-11", title: "Corporate Catering – Addis Ababa", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&h=300&fit=crop", price: 850, location: "Addis Ababa, Kazanchis", rating: 4.8, category: "otherService", description: "Meetings, conferences, office events. Punctual delivery." },
  { id: "service-12", title: "Ethiopian Catering – Traditional & Modern", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=300&fit=crop", price: 900, location: "Addis Ababa, Old Airport", rating: 4.8, category: "otherService", description: "Injera, tibs, kitfo and more. For any gathering size." },
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
