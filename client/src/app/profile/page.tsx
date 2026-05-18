"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { houses } from "@/data/listings";

export default function ProfilePage() {
  // Mock user data - replace with actual from Redux
  const user = {
    name: "John Doe",
    email: "john@example.com",
    joinedAt: "January 2024",
    coins: 1250,
    listings: houses.slice(0, 5), // Mock user's unlocked listings
  };

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
              My Profile
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your account and view your unlocked listings
            </p>
          </div>
          <Link href="/settings">
            <Button variant="outline" size="lg" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Profile Info Card */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border sticky top-24">
              <CardHeader>
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/50 rounded-xl flex items-center justify-center text-3xl font-bold text-white mb-4">
                  {user.name.charAt(0)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Name
                  </p>
                  <p className="text-lg font-semibold text-foreground mt-1">
                    {user.name}
                  </p>
                </div>
                <div className="border-t border-border pt-6">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Email
                  </p>
                  <p className="text-sm font-semibold text-foreground break-all mt-1">
                    {user.email}
                  </p>
                </div>
                <div className="border-t border-border pt-6">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Member Since
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-1">
                    {user.joinedAt}
                  </p>
                </div>
                <div className="border-t border-border pt-6 bg-primary/5 -mx-6 px-6 py-6 rounded-b-lg">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Available Coins
                  </p>
                  <p className="text-3xl font-bold text-primary mt-2">
                    {user.coins.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Unlocked Listings Table */}
          <div className="lg:col-span-3">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-2xl">My Unlocked Listings</CardTitle>
                <CardDescription>
                  {user.listings.length} listings posted on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user.listings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-semibold text-foreground">
                            Title
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">
                            Price
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">
                            Location
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {user.listings.map((listing) => (
                          <tr
                            key={listing.id}
                            className="border-b border-border hover:bg-muted/50 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={listing.image}
                                  alt={listing.title}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                                <div className="line-clamp-1 font-medium text-foreground">
                                  {listing.title}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-foreground font-semibold">
                              ${listing.price.toLocaleString()}
                            </td>
                            <td className="py-4 px-4 text-muted-foreground">
                              {listing.location.split(",")[0]}
                            </td>
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400">
                                Active
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title="View details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  title="Delete listing"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">
                      You haven't posted any listings yet
                    </p>
                    <Link href="/dashboard">
                      <Button className="mt-4">Post Your First Listing</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4">
              <Link href="/settings">
                <Button variant="outline">Account Settings</Button>
              </Link>
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
