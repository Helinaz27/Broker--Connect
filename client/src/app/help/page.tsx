"use client";

import Link from "next/link";
import {
  Home,
  Car,
  Wrench,
  MessageCircle,
  Shield,
  FileText,
} from "lucide-react";

const helpSections = [
  {
    title: "Getting started",
    items: [
      { q: "How do I create an account?", a: "Click “Login” in the header, then “Create account.” Enter your email, choose a password, and confirm. You can then login and start browsing or posting listings." },
      { q: "What can I list on Digital Broker?", a: "You can list house (for rent or sale), cars (for rent or hire), and other services (plumber, electrician, catering). All listings are for the Ethiopian market, with locations such as Addis Ababa and other cities." },
    ],
  },
  {
    title: "Listings",
    items: [
      { q: "How do I post a house, car, or service?", a: "Login and go to your Dashboard. Use the sidebar to choose house, cars, or other services, then “Create Listing.” Fill in the title, description, price, location, and any category-specific details. Add photos and submit." },
      { q: "How do I edit or remove a listing?", a: "In the Dashboard, open the relevant section (e.g. “Manage All” under house). Use the edit or delete actions next to each listing to update or remove it." },
      { q: "What should I include in a good listing?", a: "Use a clear title, an accurate price in Birr, and a specific location (e.g. Addis Ababa, Bole). Add a detailed description and several photos. For cars, include make, model, and year; for other services, include your experience and what you offer." },
    ],
  },
  {
    title: "Searching and contacting",
    items: [
      { q: "How do I search for listings?", a: "Use the search bar on the home page or the filters (location, price range, and type: house, cars, or other services). You can also browse by category from the main navigation." },
      { q: "How do I contact a seller or service provider?", a: "Open a listing and click “View details” or the contact option. You can send a message through the platform. Always confirm details and payment terms directly with the other party." },
      { q: "How do I save listings I like?", a: "Click the heart icon on any listing card to add it to your Favorites. You can view all saved listings from the “Favorites” link in the header." },
    ],
  },
  {
    title: "Safety and trust",
    items: [
      { q: "How does Digital Broker keep the marketplace safe?", a: "We require accounts for listing and messaging, and we may remove content or accounts that violate our Terms of Service or the law. We encourage users to report suspicious or inappropriate behavior." },
      { q: "Who handles payments?", a: "Payments for rentals, vehicle hire, or other services are agreed and made between users. Digital Broker does not process these payments unless we explicitly offer a payment feature. Always agree on payment method and terms before committing." },
      { q: "Where can I read the legal terms?", a: "Our Terms of Service and Privacy Policy explain your rights and our practices. You can find them in the footer (Terms, Privacy) or from your account and registration flows." },
    ],
  },
];

const quickLinks = [
  { href: "/house-listings", icon: Home, label: "Browse house" },
  { href: "/car-listings", icon: Car, label: "Browse cars" },
  { href: "/service-listings", icon: Wrench, label: "Browse other services" },
  { href: "/dashboard", icon: MessageCircle, label: "Dashboard & messages" },
  { href: "/terms", icon: FileText, label: "Terms of Service" },
  { href: "/privacy", icon: Shield, label: "Privacy Policy" },
];

export default function HelpPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 container px-4 py-12 md:py-16 max-w-3xl">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </Link>
        </div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-2">
          Help Center
        </h1>
        <p className="text-muted-foreground mb-10">
          Find answers about using Digital Broker to list or find house, cars, and other services in Ethiopia.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
            >
              <link.icon className="h-5 w-5 text-primary shrink-0" />
              <span className="font-medium text-foreground">{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="space-y-10">
          {helpSections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                {section.title}
              </h2>
              <ul className="space-y-6">
                {section.items.map((item) => (
                  <li key={item.q}>
                    <h3 className="font-medium text-foreground mb-1.5">
                      {item.q}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.a}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-lg bg-muted/50 border border-border">
          <h3 className="font-semibold text-foreground mb-2">
            Still need help?
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Contact us at support@digitalbroker.example.com or use the in-app
            chat for general inquiries.
          </p>
          <Link
            href="/"
            className="text-primary font-medium text-sm hover:underline"
          >
            Return to home
          </Link>
        </div>
      </main>
    </div>
  );
}
