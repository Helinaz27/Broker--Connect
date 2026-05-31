import { commonEn } from "../messages/common";
import { authEn } from "../messages/auth";
import { listingsEn } from "../messages/listings";
import { pagesEn } from "../messages/pages";
import { dashboardEn } from "../messages/dashboard";
import { contactEn } from "../messages/contact";
import { chatEn } from "../messages/chat";
import { profileEn } from "../messages/profile";
import { filtersEn } from "../messages/filters";

export const en = {
  language: {
    label: "Language",
    en: "English",
    am: "አማርኛ",
  },
  header: {
    home: "Home",
    houses: "Houses",
    cars: "Cars",
    otherServices: "Other Services",
    aboutUs: "About Us",
    dashboard: "Dashboard",
    myProfile: "My Profile",
    settings: "Settings",
    signIn: "Sign in",
    logout: "Logout",
    loggingOut: "Logging out...",
    coins: "Coins",
    user: "User",
  },
  footer: {
    tagline:
      "Ethiopia's premier digital bridge for high-end real estate, premium vehicles, and vetted professional services. Built for the modern success.",
    marketplace: "Marketplace",
    platform: "Platform",
    support: "Support",
    houses: "Houses",
    cars: "Cars",
    otherServices: "Other Services",
    dashboard: "Dashboard",
    myProfile: "My Profile",
    favorites: "Favorites",
    settings: "Settings",
    helpCenter: "Help Center",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    contactUs: "Contact Us",
    copyright: "© 2026 Digital Broker. All rights reserved.",
  },
  home: {
    heroEyebrow: "Digital Broker",
    heroTitle: "Ethiopia's Marketplace for",
    heroTitleHighlight: "Homes, Cars & Services",
    heroSubtitle:
      "List, discover, and connect with verified sellers and brokers across Ethiopia — one trusted platform for real estate, vehicles, and professional services.",
    heroImageAlt:
      "Modern homes and city skyline representing Digital Broker listings",
    heroBrowseListings: "Browse Listings",
    heroLearnMore: "About Us",
    category: "Category",
    search: "Search",
    city: "City",
    minPrice: "Min Price",
    maxPrice: "Max Price",
    all: "All",
    searchPlaceholder: "Search…",
    cityPlaceholder: "e.g. Addis Ababa",
    maxPricePlaceholder: "Any",
    applyFilters: "Apply Filters",
    reset: "Reset",
    houses: "Houses",
    cars: "Cars",
    otherServices: "Other Services",
    viewAll: "View All",
    propertiesAvailable: "{count} properties available",
    propertyAvailable: "{count} property available",
    vehiclesAvailable: "{count} vehicles available",
    vehicleAvailable: "{count} vehicle available",
    servicesAvailable: "{count} services available",
    serviceAvailable: "{count} service available",
    loadingHouses: "Loading houses...",
    loadingCars: "Loading cars...",
    loadingServices: "Loading services...",
    failedHouses: "Failed to load houses.",
    failedCars: "Failed to load cars.",
    failedServices: "Failed to load services.",
    noHouses: "No houses match your filters.",
    noCars: "No cars match your filters.",
    noServices: "No services match your filters.",
    noListingsTitle: "No listings found",
    noListingsBody: "Try adjusting your filters to find what you are looking for.",
    testimonials: {
      eyebrow: "Testimonials",
      title: "What Our Customers Say",
      subtitle:
        "Real stories from buyers, sellers, and brokers who use Digital Broker every day.",
      "1": {
        quote:
          "I found my apartment in Bole within a week. The filters and direct chat with the owner made everything simple and transparent.",
        name: "Sara Bekele",
        role: "Home buyer, Addis Ababa",
      },
      "2": {
        quote:
          "Listing my car took minutes, and I started getting serious inquiries the same day. Best marketplace experience I've had in Ethiopia.",
        name: "Daniel Tesfaye",
        role: "Car seller, Hawassa",
      },
      "3": {
        quote:
          "As a service provider, verified profiles and in-app messaging help me build trust with clients before we even meet.",
        name: "Hanna Girma",
        role: "Professional services broker",
      },
    },
  },
  common: commonEn,
  auth: authEn,
  listings: listingsEn,
  pages: pagesEn,
  dashboard: dashboardEn,
  contact: contactEn,
  chat: chatEn,
  profile: profileEn,
  filters: filtersEn,
} as const;

type DeepString<T> = {
  [K in keyof T]: T[K] extends object ? DeepString<T[K]> : string;
};

export type TranslationDictionary = DeepString<typeof en>;
