"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Users, Zap, Shield } from "lucide-react";

export default function AboutUsPage() {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Find and list properties, vehicles, and services in seconds",
    },
    {
      icon: Shield,
      title: "Secure & Verified",
      description: "KYC verification ensures all users are trusted",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Connect with thousands of verified users",
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 md:pt-32 md:pb-48 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[120px] opacity-60 pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] opacity-60 pointer-events-none" />

        <div className="container relative mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-6xl md:text-7xl font-bold leading-[1.1] text-foreground tracking-tight mb-6">
              About <span className="text-primary">Broker Connect</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed font-medium max-w-2xl mb-8">
              Ethiopia's premier marketplace connecting buyers, sellers, and service providers. We're building trust, transparency, and opportunity in the digital economy.
            </p>
            <Link href="/">
              <Button size="lg" className="gap-2">
                Explore Marketplace
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              To create a safe, transparent, and efficient digital marketplace where individuals and businesses can confidently buy, sell, and exchange properties, vehicles, and professional services.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
            Why Choose Broker Connect?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="bg-card border-border">
                  <CardHeader>
                    <Icon className="h-8 w-8 text-primary mb-4" />
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of verified users trading with confidence
          </p>
          <Link href="/">
            <Button variant="secondary" size="lg" className="gap-2">
              Start Browsing
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
