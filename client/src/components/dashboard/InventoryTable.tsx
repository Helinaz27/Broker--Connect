// client/src/components/dashboard/InventoryTable.tsx
"use client";

import { Home, Car, Wrench, Edit, Trash2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  image?: string;
  status: "active" | "occupied" | "inactive";
  category: "house" | "car" | "service";
}

interface InventoryTableProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  listings: Listing[];
}

export function InventoryTable({
  activeTab,
  setActiveTab,
  listings,
}: InventoryTableProps) {
  const filteredListings = listings.filter(
    (l) =>
      (activeTab === "house_view" && l.category === "house") ||
      (activeTab === "car_view" && l.category === "car") ||
      (activeTab === "service_view" && l.category === "service"),
  );

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight italic">
            {activeTab === "house_view"
              ? "House Inventory"
              : activeTab === "car_view"
                ? "Car Inventory"
                : "Service Directory"}
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            Review and manage your active{" "}
            {activeTab === "house_view"
              ? "houses"
              : activeTab === "car_view"
                ? "cars"
                : "services"}
            .
          </p>
        </div>
        <Button
          onClick={() => setActiveTab(activeTab.replace("view", "post") as any)}
          className="rounded-xl font-bold text-xs uppercase tracking-widest gap-2 bg-primary text-white"
        >
          <PlusCircle className="h-3.5 w-3.5" /> Add New Asset
        </Button>
      </div>
      <div className="bg-card border border-border rounded-3xl overflow-x-auto shadow-soft custom-scrollbar">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {["Asset Details", "Valuation", "Status", "Actions"].map((h) => (
                <th
                  key={h}
                  className={`px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest ${h === "Actions" ? "text-right" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filteredListings.map((listing) => (
              <tr
                key={listing.id}
                className="hover:bg-muted/30 transition-colors group"
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
                      ) : activeTab === "house_view" ? (
                        <Home className="h-4 w-4" />
                      ) : activeTab === "car_view" ? (
                        <Car className="h-4 w-4" />
                      ) : (
                        <Wrench className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm line-clamp-1">
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
                    className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${listing.status === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}
                  >
                    {listing.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary"
                      onClick={() => toast.info(`Editing ${listing.title}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => toast.error(`Deleting ${listing.title}`)}
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
