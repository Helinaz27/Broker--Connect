"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import ListingsTable from "@/components/ListingsTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function MyListingsPage() {
  const [listingType, setListingType] = useState<"all" | "house" | "car" | "otherService">("all");
  
  // Mock data - replace with actual user listings
  const allListings = [
    {
      id: "1",
      title: "Modern Apartment in Bole",
      location: "Addis Ababa, Bole",
      price: 15000,
      mode: "rent" as const,
      status: "active" as const,
      createdAt: "2024-05-10",
      views: 245,
    },
  ];

  const isAdmin = false;

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <DashboardSidebar isAdmin={isAdmin} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  My Listings
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage all your listings in one place
                </p>
              </div>
              <Link href="/dashboard/listings/create">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Listing
                </Button>
              </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={listingType} onValueChange={(value: any) => setListingType(value)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Listings</SelectItem>
                  <SelectItem value="house">Houses</SelectItem>
                  <SelectItem value="car">Cars</SelectItem>
                  <SelectItem value="otherService">Services</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Listings Table */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>
                  Listings ({allListings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ListingsTable
                  listings={allListings}
                  category="house"
                  showMode={true}
                  onView={(id) => console.log("View:", id)}
                  onEdit={(id) => console.log("Edit:", id)}
                  onDelete={(id) => console.log("Delete:", id)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
