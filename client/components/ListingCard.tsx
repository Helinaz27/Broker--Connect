import { Heart, MapPin, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/lib/FavoritesContext";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";

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
  const routeLocation = useLocation();
  const isFavoritesPage = routeLocation.pathname === "/favorites";
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
    <div className="group rounded-xl overflow-hidden bg-card border border-border hover:shadow-lg transition-all duration-300">
      {/* Image Container */}
      <div className="relative h-48 bg-muted overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Like Button */}
        <button
          onClick={handleLike}
          className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full shadow-sm transition-all hover:scale-110 z-10"
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              liked ? "fill-red-500 text-red-500" : "text-gray-600"
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
          {title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="h-4 w-4" />
          <span className="line-clamp-1">{location}</span>
        </div>

        {/* Price and Info */}
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <span className="text-lg font-bold text-primary">
              {price.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground ml-1">
              {category === "service" ? "/hr" : "/month"}
            </span>
          </div>
          {contactLimit > 0 && (
            <div className="flex items-center gap-1 text-xs bg-secondary/10 text-secondary px-2 py-1 rounded">
              <Zap className="h-3 w-3" />
              {contactLimit} coins
            </div>
          )}
        </div>

        {/* View Button */}
        <Button className="w-full" size="sm">
          View Details
        </Button>
      </div>
    </div>
  );
}
