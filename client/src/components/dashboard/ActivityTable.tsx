// client/src/components/dashboard/ActivityTable.tsx
"use client";

import { Home, Car, Wrench, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { getListingPath } from "@/data/listings";

interface Listing {
  id: string;
  title: string;
  image?: string;
  price: number;
  location: string;
  status: "active" | "occupied" | "inactive";
  type: "rent" | "sell";
  category: "house" | "car" | "service";
  createdAt: string;
}

interface ActivityTableProps {
  listings: Listing[];
  filter: "all" | "rent" | "sell";
  setFilter: (filter: "all" | "rent" | "sell") => void;
}

export function ActivityTable({
  listings,
  filter,
  setFilter,
}: ActivityTableProps) {
  const filteredListings = listings.filter(
    (l) => filter === "all" || l.type === filter,
  );

  return (
    <div className="bg-card border border-border rounded-3xl shadow-soft overflow-hidden">
      <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h2 className="text-lg font-bold text-foreground tracking-tight">
          Activity Stream
        </h2>
        <div className="flex bg-muted/50 p-1 rounded-xl">
          {(["all", "rent", "sell"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${filter === f ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left min-w-[800px]">
          <thead>
            <tr className="bg-muted/30">
              {["Asset Details", "Valuation", "Type", "Status", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground ${h === "Actions" ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filteredListings.map((listing) => (
              <tr
                key={listing.id}
                className="group hover:bg-muted/20 transition-colors"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl overflow-hidden bg-muted border border-border flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                      {listing.image ? (
                        <img
                          src={listing.image}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : listing.category === "house" ? (
                        <Home className="h-4 w-4" />
                      ) : listing.category === "car" ? (
                        <Car className="h-4 w-4" />
                      ) : (
                        <Wrench className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                        {listing.title}
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {listing.location}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 font-bold text-sm">
                  {listing.price.toLocaleString()} Br
                </td>
                <td className="px-6 py-5">
                  <span
                    className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${listing.type === "rent" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"}`}
                  >
                    {listing.type}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${listing.status === "active" ? "bg-emerald-500" : "bg-amber-500"}`}
                    />
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest ${listing.status === "active" ? "text-emerald-600" : "text-amber-600"}`}
                    >
                      {listing.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={getListingPath(listing.category, listing.id)}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => toast.error(`Removing ${listing.title}`)}
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
    </div>
  );
}
