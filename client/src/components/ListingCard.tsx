"use client";

import { Heart, MapPin, Star, ArrowUpRight } from "lucide-react";
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
  rating = 4.8,
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
    <div className="group rounded-[2rem] overflow-hidden bg-card border border-border hover:border-primary/50 hover:shadow-modern hover:-translate-y-1.5 transition-all duration-500 animate-in">
      <div className="relative h-60 bg-muted overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-background/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg text-foreground border border-white/20 shadow-sm">
            {category === "car" ? "Car" : category === "service" ? "Service" : "House"}
          </span>
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
          <div className="flex items-center gap-1 text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md">
            <Star className="h-3 w-3 fill-current" />
            <span className="text-[11px] font-bold">{rating}</span>
          </div>
          <div className="h-1 w-1 rounded-full bg-border" />
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
          <Link href={getListingPath(category, id)}>
            <div className="h-10 w-10 rounded-xl bg-muted border border-border flex items-center justify-center text-foreground group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all duration-300 shadow-sm">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
