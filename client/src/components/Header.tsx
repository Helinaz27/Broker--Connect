"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  User,
  Menu,
  X,
  Heart,
  LogOut,
  Settings,
  LayoutDashboard,
  ChevronDown,
  Bell,
  Home,
  Car,
  Wrench,
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logo from "@/components/Logo";
import { ModeToggle } from "@/components/ModeToggle";
import { useLogoutMutation } from "@/store/apis/userApi";
import { clearUser } from "@/store/slices/userSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "sonner";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const { currentUser, isAuthenticated } = useAppSelector((state) => state.user);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const user = isAuthenticated ? currentUser : null;
  const userName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "User"
    : "";
  const userInitials = userName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(clearUser());
      toast.success("Logged out successfully");
      setMobileMenuOpen(false);
      router.push("/login");
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message ||
        "Logout failed. Please try again.";
      toast.error(errorMessage);
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/favorites", label: "Favorites" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "border-b border-white/20 bg-white/70 dark:bg-black/70 backdrop-blur-xl shadow-glass"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="container flex h-20 items-center justify-between">
        <Logo size="md" />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium px-4 py-2 rounded-xl transition-all duration-300 relative group ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}

          <div className="relative">
            <button
              onMouseEnter={() => setCategoriesOpen(true)}
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl transition-all duration-300 ${
                categoriesOpen
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Categories
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-500 ${categoriesOpen ? "rotate-180" : ""}`}
              />
            </button>

            {categoriesOpen && (
              <div
                className="absolute left-0 mt-2 w-72 glass-card rounded-2xl z-50 p-2 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300"
                onMouseLeave={() => setCategoriesOpen(false)}
              >
                {[
                  {
                    href: "/house-listings",
                    label: "Houses",
                    desc: "Houses, Apartments & Land",
                    icon: Home,
                  },
                  {
                    href: "/car-listings",
                    label: "Cars",
                    desc: "Cars, Trucks & Rentals",
                    icon: Car,
                  },
                  {
                    href: "/service-listings",
                    label: "Services",
                    desc: "Experts & Professionals",
                    icon: Wrench,
                  },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setCategoriesOpen(false)}
                    className="flex items-start gap-4 px-4 py-3 hover:bg-primary/5 rounded-xl transition-all group"
                  >
                    <div className="mt-1 p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {item.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground leading-normal">
                        {item.desc}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-1">
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
              onClick={() => toast.info("No new notifications")}
            >
              <Bell className="h-5 w-5" />
            </Button>
          </div>

          {user ? (
            <HoverCard openDelay={0} closeDelay={200}>
              <HoverCardTrigger asChild>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 p-1 pr-4 rounded-full bg-muted/30 hover:bg-muted/50 transition-all border border-transparent hover:border-border group"
                >
                  <Avatar className="h-8 w-8 border border-white dark:border-white/10 shadow-sm transition-transform group-hover:scale-105">
                    <AvatarImage src={user.profileImage} alt={userName} />
                    <AvatarFallback className="bg-primary text-white text-[10px] font-bold">
                      {userInitials || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left">
                    <p className="text-[12px] font-semibold text-foreground leading-none mb-0.5">
                      {userName}
                    </p>
                    <p className="text-[10px] font-medium text-primary uppercase tracking-tight">
                      {(user.coins ?? 0).toLocaleString()} Br
                    </p>
                  </div>
                </Link>
              </HoverCardTrigger>
              <HoverCardContent
                className="w-64 p-2 mt-2 glass-card rounded-2xl"
                align="end"
              >
                <div className="flex flex-col gap-1">
                  <div className="px-3 py-3 mb-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Broker Profile
                    </p>
                    <p className="text-xs font-medium text-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="h-px bg-border/50 mb-1 mx-2" />
                  {[
                    {
                      href: "/dashboard",
                      icon: LayoutDashboard,
                      label: "Dashboard",
                    },
                    { href: "/profile", icon: User, label: "My Profile" },
                    { href: "/settings", icon: Settings, label: "Settings" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-primary hover:text-white transition-all text-sm font-medium text-muted-foreground hover:text-white group"
                    >
                      <item.icon className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  <div className="h-px bg-border/50 my-1 mx-2" />
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all text-sm font-medium w-full text-left group disabled:opacity-60"
                  >
                    <LogOut className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                    <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                  </button>
                </div>
              </HoverCardContent>
            </HoverCard>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl px-4 h-10 font-medium"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-primary text-white hover:bg-primary/90 rounded-xl px-4 h-10 font-medium"
                >
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-1 md:hidden">
          <ModeToggle />
          <Link href="/favorites">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-muted-foreground rounded-xl"
            >
              <Heart className="h-5 w-5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-muted-foreground rounded-xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl py-8 animate-in slide-in-from-top-4 duration-300">
          <nav className="container flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-semibold text-foreground px-4 py-3 rounded-xl hover:bg-muted transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-border/50 my-4 mx-2" />
            <p className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Categories
            </p>
            {[
              { href: "/house-listings", label: "Houses", icon: Home },
              { href: "/car-listings", label: "Cars", icon: Car },
              { href: "/service-listings", label: "Services", icon: Wrench },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 text-base font-medium text-foreground px-4 py-3 rounded-xl hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-4 w-4 text-primary" />
                {item.label}
              </Link>
            ))}
            <div className="h-px bg-border/50 my-4 mx-2" />
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 text-base font-semibold text-primary px-4 py-4 rounded-xl bg-primary/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Go to Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-3 text-base font-semibold text-destructive px-4 py-4 rounded-xl hover:bg-destructive/5 transition-colors disabled:opacity-60 text-left"
                >
                  <LogOut className="h-5 w-5" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full rounded-xl">
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full rounded-xl">Register</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
