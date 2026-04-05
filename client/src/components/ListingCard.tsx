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
    <div className="group rounded-lg overflow-hidden bg-card border border-border hover:border-border hover:shadow-md transition-all duration-200">
      <div className="relative h-48 bg-muted overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
        />
        <div className="absolute top-2.5 left-2.5">
          <span className="bg-background/90 text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded text-foreground">
            {category}
          </span>
        </div>

        {/* Like Button */}
        <button
          onClick={handleLike}
          className="absolute top-2.5 right-2.5 bg-background/90 p-2 rounded-full shadow-sm hover:bg-background z-10 transition-colors"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              liked ? "fill-red-500 text-red-500" : "text-gray-600"
            }`}
          />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="flex items-center gap-0.5 text-amber-600">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className={`h-3 w-3 ${i < Math.floor(rating) ? "fill-current" : "fill-muted text-muted"}`} viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">{rating > 0 ? rating : "New"}</span>
        </div>
        <h3 className="font-medium text-foreground line-clamp-1 text-sm">
          {title}
        </h3>
        <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1 mb-3">
          <MapPin className="h-3 w-3 shrink-0 opacity-70" />
          <span className="line-clamp-1">{location}</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div>
            <span className="text-lg font-semibold text-foreground">{price.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground ml-1">{category === "service" ? "Birr/hr" : "Birr/mo"}</span>
          </div>
          <Button variant="outline" size="sm" className="text-xs font-medium h-8" asChild>
            <Link href={getListingPath(category, id)}>View details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
