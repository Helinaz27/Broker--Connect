import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Menu, X, Bell, Heart, LogOut, Settings, LayoutDashboard, ChevronDown, Coins } from "lucide-react";
import { useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  // Mock user data for the hover card
  const user = {
    name: "Abebaw Tsega",
    email: "abebaw@example.com",
    coins: 5000,
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary" />
          <span className="hidden font-bold text-lg sm:inline-block">
            BrokerHub
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 items-center">
          <Link to="/" className="text-sm font-semibold hover:text-primary transition-colors">
            Home
          </Link>
          
          {/* Categories Dropdown */}
          <div className="relative group">
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              onMouseEnter={() => setCategoriesOpen(true)}
              className="flex items-center gap-1 text-sm font-semibold hover:text-primary transition-colors py-2"
            >
              Categories
              <ChevronDown className={`h-4 w-4 transition-transform ${categoriesOpen ? "rotate-180" : ""}`} />
            </button>
            
            {categoriesOpen && (
              <div 
                className="absolute left-0 mt-0 w-48 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden py-2"
                onMouseEnter={() => setCategoriesOpen(true)}
                onMouseLeave={() => setCategoriesOpen(false)}
              >
                <Link
                  to="/houses"
                  onClick={() => setCategoriesOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                >
                  Houses
                </Link>
                <Link
                  to="/cars"
                  onClick={() => setCategoriesOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cars
                </Link>
                <Link
                  to="/services"
                  onClick={() => setCategoriesOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                >
                  Services
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Link to="/favorites">
              <Button variant="ghost" size="icon" className="relative h-9 w-9 p-0 rounded-full hover:bg-muted hover:text-primary transition-colors">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 p-0 rounded-full hover:bg-muted hover:text-primary transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full ring-2 ring-background" />
            </Button>
          </div>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 pr-4 border-r border-border">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="font-semibold text-sm hover:text-primary transition-colors">
                Login
              </Button>
            </Link>
          </div>

          <HoverCard openDelay={0} closeDelay={300}>
            <HoverCardTrigger asChild>
              <Link to="/profile">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-full overflow-hidden border border-border hover:ring-2 hover:ring-primary/20 transition-all focus-visible:ring-0"
                >
                  <Avatar className="h-full w-full">
                    <AvatarImage src={user.profileImage} alt={user.name} />
                    <AvatarFallback>
                      <User className="h-5 w-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </Link>
            </HoverCardTrigger>
            <HoverCardContent align="end" className="w-80 p-0 overflow-hidden rounded-xl border-border shadow-2xl">
              <div className="relative">
                {/* Header background */}
                <div className="h-16 bg-gradient-to-r from-primary/20 to-secondary/20" />
                
                {/* User Info Section */}
                <div className="px-5 pb-5 pt-0">
                  <div className="relative -mt-8 mb-3 flex items-end justify-between">
                    <Avatar className="h-20 w-20 border-4 border-background shadow-sm">
                      <AvatarImage src={user.profileImage} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="pb-1">
                      <Link to="/profile">
                        <Button size="sm" variant="outline" className="h-8 rounded-full text-xs font-bold">
                          Edit Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  <div className="space-y-1 mb-4">
                    <h4 className="text-lg font-bold text-foreground leading-tight">{user.name}</h4>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>

                  {/* Stats/Quick Actions */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-muted/50 p-3 rounded-xl border border-border/50">
                      <div className="flex items-center gap-2 text-primary mb-1">
                        <Coins className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Coins</span>
                      </div>
                      <p className="text-lg font-bold">{user.coins.toLocaleString()}</p>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-xl border border-border/50">
                      <div className="flex items-center gap-2 text-secondary mb-1">
                        <LayoutDashboard className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Level</span>
                      </div>
                      <p className="text-lg font-bold">1</p>
                    </div>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-border">
                    <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium hover:bg-muted rounded-lg transition-colors">
                      <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                      Seller Dashboard
                    </Link>
                    <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium hover:bg-muted rounded-lg transition-colors">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      Account Settings
                    </Link>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container py-4 space-y-3 flex flex-col">
            <Link
              to="/"
              className="text-sm font-medium hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/houses"
              className="text-sm font-medium hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Houses
            </Link>
            <Link
              to="/cars"
              className="text-sm font-medium hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cars
            </Link>
            <Link
              to="/services"
              className="text-sm font-medium hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </Link>
            <div className="pt-3 border-t border-border space-y-2">
              <Link to="/favorites" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full gap-2 justify-start">
                  <Heart className="h-4 w-4" />
                  Favorites
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="w-full gap-2 justify-start">
                <Bell className="h-4 w-4" />
                Notifications
              </Button>
              <Link to="/profile" className="block" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full gap-2 justify-start">
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
