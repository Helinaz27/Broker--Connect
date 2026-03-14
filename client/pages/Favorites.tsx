import Header from "@/components/Header";
import ListingCard from "@/components/ListingCard";
import Chat from "@/components/Chat";
import Footer from "@/components/Footer";
import { useFavorites } from "@/lib/FavoritesContext";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Favorites() {
  const { favorites } = useFavorites();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-12 bg-muted/30">
        <div className="container">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Heart className="h-8 w-8 text-primary fill-primary" />
                My Favorites
              </h1>
              <p className="text-muted-foreground">Manage your saved listings and services</p>
            </div>
            <Link to="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>

          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {favorites.map((listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card border border-border rounded-2xl shadow-sm max-w-2xl mx-auto">
              <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-3">No favorites yet</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Start browsing and click the heart icon on any listing to save it for later.
              </p>
              <Link to="/">
                <Button size="lg" className="px-8">
                  Browse Listings
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <Chat />
    </div>
  );
}
