"use client";

import { Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/lib/FavoritesContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { getListingPath } from "@/data/listings";

interface ListingCardProps {
  id: string;
  title: string;
  image: string;
  price: number;
  location: string;
  category: "house" | "car" | "service";
  rating?: number;
  contactLimit?: number;
}

export default function ListingCard({
  id,
  title,
  image,
  price,
  location,
  category,
  rating = 0,
  contactLimit = 0,
}: ListingCardProps) {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const pathname = usePathname();
  const isFavoritesPage = pathname === "/favorites";
  const liked = isFavorite(id);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isFavoritesPage) {
      removeFavorite(id);
      toast.success("Removed from favorites");
    } else {
      if (!liked) {
        addFavorite({ id, title, image, price, location, category });
        toast.success("Added to favorites");
      } else {
        removeFavorite(id);
        toast.success("Removed from favorites");
      }
    }
  };

  return (
    <div className="group rounded-3xl overflow-hidden bg-card border border-border/50 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 animate-in fade-in slide-in-from-bottom-2">
      <div className="relative h-56 bg-muted overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-background/80 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full text-foreground border border-white/20 shadow-xl">
            {category === "car" ? "cars" : category === "service" ? "other services" : "house"}
          </span>
        </div>

        {/* Like Button */}
        <button
          onClick={handleLike}
          className="absolute top-4 right-4 bg-background/80 backdrop-blur-md p-2.5 rounded-full shadow-xl hover:bg-white z-10 transition-all active:scale-90 border border-white/20"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              liked ? "fill-red-500 text-red-500" : "text-slate-600"
            }`}
          />
        </button>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className={`h-3 w-3 ${i < Math.floor(rating) ? "fill-current" : "fill-muted text-muted"}`} viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{rating > 0 ? rating : "Unrated"}</span>
        </div>
        
        <h3 className="font-black text-foreground line-clamp-1 text-base tracking-tight italic group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-bold mt-2 mb-6">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/60" />
          <span className="line-clamp-1">{location}</span>
        </div>
        
        <div className="flex items-center justify-between pt-5 border-t border-border/40">
          <div className="flex flex-col">
            <span className="text-xl font-black text-foreground tracking-tighter">{price.toLocaleString()}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground -mt-1">
              {category === "service" ? "Birr / Hour" : "Total Birr"}
            </span>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl border-border/60 font-black text-[10px] uppercase tracking-widest px-4 h-10 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm" asChild>
            <Link href={getListingPath(category, id)}>View</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
