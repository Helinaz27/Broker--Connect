"use client";

import { Home, Car, Wrench, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { getListingPath } from "@/data/listings";

interface Listing {
  id: string;
  title: string;
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

export function ActivityTable({ listings, filter, setFilter }: ActivityTableProps) {
  const filteredListings = listings.filter(l => filter === "all" || l.type === filter);

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-[2.5rem] shadow-soft overflow-hidden">
      <div className="p-8 border-b border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h2 className="text-xl font-black text-foreground tracking-tight font-poppins italic">Activity Stream</h2>
        <div className="flex bg-muted/30 p-1.5 rounded-2xl border border-border/50">
          {(["all", "rent", "sell"] as const).map((f) => (
            <button 
              key={f} 
              onClick={() => setFilter(f)} 
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all font-poppins ${filter === f ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left min-w-[800px]">
          <thead>
            <tr className="bg-muted/20">
              {["Post Details", "Valuation", "Type", "Status", "Actions"].map((h) => (
                <th key={h} className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground font-poppins ${h === "Actions" ? "text-right" : ""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {filteredListings.map((listing) => (
              <tr key={listing.id} className="group hover:bg-muted/10 transition-all">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-2xl overflow-hidden bg-muted border border-border/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500">
                      {listing.image ? (
                        <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        listing.category === "house" ? <Home className="h-5 w-5" /> : listing.category === "car" ? <Car className="h-5 w-5" /> : <Wrench className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm font-poppins group-hover:text-primary transition-colors">{listing.title}</p>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5 font-poppins">{listing.location}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 font-bold text-sm font-poppins">{listing.price.toLocaleString()} Br</td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border font-poppins ${listing.type === "rent" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"}`}>{listing.type}</span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${listing.status === "active" ? "bg-emerald-500" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest font-poppins ${listing.status === "active" ? "text-emerald-600" : "text-amber-600"}`}>{listing.status}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={getListingPath(listing.category, listing.id)}>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
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
