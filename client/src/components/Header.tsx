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
  Bell,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logo from "@/components/Logo";
import { useLogoutMutation } from "@/store/apis/userApi";
import { clearUser } from "@/store/slices/userSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "sonner";
import { ModeToggle } from "@/components/ModeToggle";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const { currentUser, isAuthenticated } = useAppSelector(
    (state) => state.user,
  );

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

  return (
    <header className="sticky top-0 z-40 w-full bg-background border-b border-border">
      <div className="container flex h-14 items-center justify-between">
        <Logo size="md" />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-0.5">
          <Link
            href="/"
            className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors"
          >
            Home
          </Link>
          <Link
            href="/house-listings"
            className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors"
          >
            Houses
          </Link>
          <Link
            href="/car-listings"
            className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors"
          >
            Cars
          </Link>
          <Link
            href="/service-listings"
            className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors"
          >
            Other Services
          </Link>
          <Link
            href="/about-us"
            className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors"
          >
            About Us
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <ModeToggle />
          
          {/* Notification Icon - Only when authenticated */}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 relative"
              asChild
            >
              <Link href="/notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
              </Link>
            </Button>
          )}

          {/* Favorites Icon */}
          <Link href="/favorites">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
            >
              <Heart className="h-5 w-5" />
            </Button>
          </Link>

          {/* Conditional auth UI: show Sign in when not signed in; profile when signed in */}
          {user ? (
            <HoverCard openDelay={0} closeDelay={200}>
              <HoverCardTrigger asChild>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 p-1.5 rounded-md hover:bg-accent transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImage} alt={userName} />
                    <AvatarFallback className="bg-accent text-sm font-medium">
                      {userInitials || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium leading-tight">
                      {userName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(user.coins ?? 0).toLocaleString()} Coins
                    </p>
                  </div>
                </Link>
              </HoverCardTrigger>
              <HoverCardContent
                className="w-56 p-1 mt-1 rounded-lg border border-border bg-background shadow-lg z-50"
                align="end"
              >
                <div className="flex flex-col gap-1">
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
                      className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm font-medium"
                    >
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  <div className="h-px bg-border my-1" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-accent text-muted-foreground hover:text-destructive transition-colors text-sm font-medium w-full disabled:opacity-60"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                  </button>
                </div>
              </HoverCardContent>
            </HoverCard>
          ) : (
            <Link href="/login">
              <Button
                variant="default"
                size="sm"
                className="font-medium"
              >
                Sign in
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 md:hidden">
          <ModeToggle />
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 relative"
              asChild
            >
              <Link href="/notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
              </Link>
            </Button>
          )}
          <Link href="/favorites">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
            >
              <Heart className="h-5 w-5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
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
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container py-4 flex flex-col gap-2">
            <Link
              href="/"
              className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/house-listings"
              className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Houses
            </Link>
            <Link
              href="/car-listings"
              className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cars
            </Link>
            <Link
              href="/service-listings"
              className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Other Services
            </Link>
            <Link
              href="/about-us"
              className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <div className="h-px bg-border my-2" />
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  My Profile
                </Link>
                <Link
                  href="/settings"
                  className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent text-destructive transition-colors flex items-center gap-2 text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="default" size="sm" className="w-full font-medium">
                  Sign in
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
