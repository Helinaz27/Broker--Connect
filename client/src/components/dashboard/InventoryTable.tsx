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

export function InventoryTable({ activeTab, setActiveTab, listings }: InventoryTableProps) {
  const filteredListings = listings.filter(l => 
    (activeTab === "house_view" && l.category === "house") || 
    (activeTab === "car_view" && l.category === "car") || 
    (activeTab === "service_view" && l.category === "service")
  );

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight italic font-poppins">
            {activeTab === "house_view" ? "Manage All Homes" : activeTab === "car_view" ? "Manage All Cars" : "Manage All Services"}
          </h1>
          <p className="text-muted-foreground font-medium mt-1 font-inter">Review and manage your active {activeTab === "house_view" ? "houses" : activeTab === "car_view" ? "cars" : "services"}.</p>
        </div>
        <Button onClick={() => setActiveTab(activeTab.replace("view", "post") as any)} className="h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest gap-2 bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all font-poppins">
          <PlusCircle className="h-4 w-4" /> Add New Post
        </Button>
      </div>
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-[2.5rem] overflow-x-auto shadow-soft custom-scrollbar">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-muted/30 border-b border-border/40">
            <tr>
              {["Post Details", "Valuation", "Status", "Actions"].map(h => (
                <th key={h} className={`px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] font-poppins ${h === "Actions" ? "text-right" : ""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {filteredListings.map((listing) => (
              <tr key={listing.id} className="hover:bg-muted/20 transition-all group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl overflow-hidden bg-muted border border-border/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500">
                      {listing.image ? (
                        <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        activeTab === "house_view" ? <Home className="h-5 w-5" /> : activeTab === "car_view" ? <Car className="h-5 w-5" /> : <Wrench className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-base font-poppins group-hover:text-primary transition-colors">{listing.title}</p>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5 font-poppins">{listing.location}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 font-bold text-base font-poppins">{listing.price.toLocaleString()} Br</td>
                <td className="px-8 py-6">
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest font-poppins ${listing.status === "active" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border border-amber-500/20"}`}>{listing.status}</span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300"
                      onClick={() => toast.info(`Editing ${listing.title}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
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
