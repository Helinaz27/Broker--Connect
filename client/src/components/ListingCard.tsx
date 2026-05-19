"use client";

import { Heart, MapPin, ArrowUpRight } from "lucide-react";
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
  contactLimit?: number;
  type?: "rent" | "sale";
}

export default function ListingCard({
  id,
  title,
  image,
  price,
  location,
  category,
  contactLimit = 0,
  type,
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

  const href = getListingPath(category, id);

  return (
    <Link href={href}>
      <div className="group rounded-[2rem] overflow-hidden bg-card border border-border hover:border-primary/50 hover:shadow-modern hover:-translate-y-1.5 transition-all duration-500 animate-in">
        <div className="relative h-60 bg-muted overflow-hidden">
          <img
            src={image}
            alt={title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          
          {/* Category & Type Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-background/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg text-foreground border border-white/20 shadow-sm">
              {category === "car" ? "Car" : category === "service" ? "Service" : "House"}
            </span>
            {type && (
              <span className={`backdrop-blur-md text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/20 shadow-sm ${type === 'rent' ? 'bg-blue-500/80 text-white' : 'bg-emerald-500/80 text-white'}`}>
                {type === 'rent' ? 'Rent' : 'Sale'}
              </span>
            )}
          </div>

          {/* Like Button */}
          <button
            onClick={handleLike}
            className="absolute top-4 right-4 bg-background/80 backdrop-blur-md p-2.5 rounded-xl shadow-sm hover:bg-background z-10 transition-all active:scale-90 border border-white/20 group/heart"
          >
            <Heart
              className={`h-4 w-4 transition-colors duration-300 ${
                liked ? "fill-destructive text-destructive" : "text-muted-foreground group-hover/heart:text-destructive"
              }`}
            />
          </button>

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="line-clamp-1">{location.split(",")[1] || location}</span>
            </div>
          </div>
          
          <h3 className="font-bold text-foreground line-clamp-1 text-lg tracking-tight mb-5 group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          <div className="flex items-center justify-between pt-5 border-t border-border/50">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground tracking-tight">{price.toLocaleString()} Br</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                {category === "service" ? "Per Project" : "Total Price"}
              </span>
            </div>
            <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
          </div>

          {contactLimit > 0 && (
            <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
              {contactLimit} contact{contactLimit !== 1 ? "s" : ""} available
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
