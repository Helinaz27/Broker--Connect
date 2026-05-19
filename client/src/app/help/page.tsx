"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Home,
  Car,
  Wrench,
  MessageCircle,
  Shield,
  FileText,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const helpSections = [
  {
    title: "Getting started",
    items: [
      { q: "How do I create an account?", a: "Click “Login” in the header, then “Create account.” Enter your email, choose a password, and confirm. You can then login and start browsing or posting listings." },
      { q: "What can I list on Digital Broker?", a: "You can list houses (for rent or sale), cars (for rent or hire), and other services (plumber, electrician, catering). All listings are for the Ethiopian market, with locations such as Addis Ababa and other cities." },
    ],
  },
  {
    title: "Listings",
    items: [
      { q: "How do I post a house, car, or service?", a: "Login and go to your Dashboard. Use the sidebar to choose Houses, Cars, or Services, then “Create Listing.” Fill in the title, description, price, location, and any category-specific details. Add photos and submit." },
      { q: "How do I edit or remove a listing?", a: "In the Dashboard, open the relevant section (e.g. “Manage All” under Houses). Use the edit or delete actions next to each listing to update or remove it." },
      { q: "What should I include in a good listing?", a: "Use a clear title, an accurate price in Birr, and a specific location (e.g. Addis Ababa, Bole). Add a detailed description and several photos. For cars, include make, model, and year; for services, include your experience and what you offer." },
    ],
  },
  {
    title: "Searching and contacting",
    items: [
      { q: "How do I search for listings?", a: "Use the search bar on the home page or the filters (location, price range, and type: Houses, Cars, or Services). You can also browse by category from the main navigation." },
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
  { href: "/house-listings", icon: Home, label: "Browse Houses" },
  { href: "/car-listings", icon: Car, label: "Browse Cars" },
  { href: "/service-listings", icon: Wrench, label: "Browse Services" },
  { href: "/dashboard", icon: MessageCircle, label: "Dashboard & messages" },
  { href: "/terms", icon: FileText, label: "Terms of Service" },
  { href: "/privacy", icon: Shield, label: "Privacy Policy" },
];

export default function HelpPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container px-6 py-12 md:py-20 max-w-4xl mx-auto animate-fade-in">
        <div className="mb-12">
          <Link
            href="/"
            className="text-sm font-bold text-primary uppercase tracking-widest hover:opacity-80 transition-opacity"
          >
            ← Back to marketplace
          </Link>
        </div>
        
        <div className="space-y-4 mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight italic">
            Help Center.
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl">
            Find answers about using Digital Broker to list or discover houses, cars, and professional services in Ethiopia.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-4 p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:bg-muted/50 hover:border-primary/20 transition-all duration-300 shadow-sm group"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <link.icon className="h-5 w-5" />
              </div>
              <span className="font-bold text-sm text-foreground tracking-tight">{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="space-y-16">
          {helpSections.map((section) => (
            <section key={section.title} className="space-y-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary border-b border-border pb-4">
                {section.title}
              </h2>
              <ul className="grid gap-10">
                {section.items.map((item) => (
                  <li key={item.q} className="space-y-3">
                    <h3 className="text-xl font-bold text-foreground tracking-tight italic">
                      {item.q}
                    </h3>
                    <p className="text-muted-foreground font-medium leading-relaxed max-w-2xl">
                      {item.a}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-24 p-10 rounded-[2.5rem] bg-card border border-border shadow-glass text-center space-y-6">
          <h3 className="text-2xl font-black text-foreground tracking-tight italic">
            Still need assistance?
          </h3>
          <p className="text-muted-foreground font-medium max-w-md mx-auto">
            Our support team is ready to help you with any platform inquiries or listing assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button className="h-12 px-8 rounded-xl bg-primary font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button variant="outline" className="h-12 px-8 rounded-xl border-border font-bold uppercase tracking-widest text-xs" asChild>
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
