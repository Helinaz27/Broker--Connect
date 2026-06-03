"use client";

import { Heart, MapPin, ArrowUpRight } from "lucide-react";
import { useFavorites } from "@/lib/FavoritesContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { getListingPath } from "@/data/listings";
import { useLanguage } from "@/i18n/LanguageProvider";

interface ListingCardProps {
  id: string;
  title: string;
  image: string;
  price: number;
  location: string;
  category: "house" | "car" | "service" | "otherService";
  listingMode?: "rent" | "sell";
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
  listingMode,
  contactLimit = 0,
  type,
}: ListingCardProps) {
  const { t } = useLanguage();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const pathname = usePathname();
  const isFavoritesPage = pathname === "/favorites";
  const liked = isFavorite(id);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isFavoritesPage) {
      removeFavorite(id);
      toast.success(t("common.removedFromFavorites"));
    } else {
      if (!liked) {
        addFavorite({ id, title, image, price, location, category });
        toast.success(t("common.addedToFavorites"));
      } else {
        removeFavorite(id);
        toast.success(t("common.removedFromFavorites"));
      }
    }
  };

  const mappedCategory = category === "otherService" ? "service" : category;
  const href = getListingPath(mappedCategory, id);

  const showModeBadge =
    (category === "house" || category === "car") && listingMode;

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

          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-background/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg text-foreground border border-white/20 shadow-sm">
              {category === "car"
                ? t("common.car")
                : category === "service" || category === "otherService"
                  ? t("common.service")
                  : t("common.house")}
            </span>
            {showModeBadge && (
              <span
                className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm text-white ${
                  listingMode === "rent" ? "bg-blue-500/90" : "bg-green-500/90"
                }`}
              >
                {listingMode === "rent" ? t("common.rent") : t("common.sell")}
              </span>
            )}
          </div>

          <button
            onClick={handleLike}
            className="absolute top-4 right-4 bg-background/80 backdrop-blur-md p-2.5 rounded-xl shadow-sm hover:bg-background z-10 transition-all active:scale-90 border border-white/20 group/heart"
          >
            <Heart
              className={`h-4 w-4 transition-colors duration-300 ${
                liked
                  ? "fill-destructive text-destructive"
                  : "text-muted-foreground group-hover/heart:text-destructive"
              }`}
            />
          </button>

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <div className="p-6">
          <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider mb-3">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="line-clamp-1">
              {location.split(",")[1] || location}
            </span>
          </div>

          <h3 className="font-bold text-foreground line-clamp-1 text-lg tracking-tight mb-5 group-hover:text-primary transition-colors">
            {title}
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {t("common.price")}
              </p>
              <p className="text-xl font-bold text-foreground">
                ETB {price.toLocaleString()}
              </p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
          </div>

          {contactLimit > 0 && (
            <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
              {t("common.contactsAvailable", { count: contactLimit })}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
