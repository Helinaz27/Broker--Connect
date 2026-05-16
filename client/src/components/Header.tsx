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

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const { currentUser, isAuthenticated } = useAppSelector((state) => state.user);

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
    <header className="sticky top-0 z-40 w-full bg-gray-100 border-b border-gray-200">
      <div className="container flex h-14 items-center justify-between">
        <Logo size="md" />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-0.5">
          <Link
            href="/"
            className="text-sm font-medium px-3 py-2 rounded-md text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/house-listings"
            className="text-sm font-medium px-3 py-2 rounded-md text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-colors"
          >
            Houses
          </Link>
          <Link
            href="/car-listings"
            className="text-sm font-medium px-3 py-2 rounded-md text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-colors"
          >
            Cars
          </Link>
          <Link
            href="/service-listings"
            className="text-sm font-medium px-3 py-2 rounded-md text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-colors"
          >
            Services
          </Link>
          <Link
            href="/favorites"
            className="text-sm font-medium px-3 py-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
          >
            Favorites
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {/* Conditional auth UI: show Sign in/Register when not signed in; profile when signed in */}
          {user ? (
            <HoverCard openDelay={0} closeDelay={200}>
              <HoverCardTrigger asChild>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImage} alt={userName} />
                    <AvatarFallback className="bg-gray-200 text-gray-700 text-sm font-medium">
                      {userInitials || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-900 leading-tight">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(user.coins ?? 0).toLocaleString()} Coins
                    </p>
                  </div>
                </Link>
              </HoverCardTrigger>
              <HoverCardContent
                className="w-56 p-1 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg z-50"
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
                      className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                    >
                      <item.icon className="h-4 w-4 text-gray-400" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  <div className="h-px bg-gray-100 my-1" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-gray-50 text-gray-500 hover:text-red-600 transition-colors text-sm font-medium w-full disabled:opacity-60"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                  </button>
                </div>
              </HoverCardContent>
            </HoverCard>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-900 hover:bg-gray-200"
                >
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="font-medium bg-gray-900 text-white hover:bg-gray-800"
                >
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/favorites">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-gray-500 hover:text-gray-900"
            >
              <Heart className="h-5 w-5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-gray-500 hover:text-gray-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-gray-100 py-4 animate-in slide-in-from-top duration-300">
          <nav className="container flex flex-col gap-4">
            <Link
              href="/"
              className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/house-listings"
              className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Houses
            </Link>
            <Link
              href="/car-listings"
              className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cars
            </Link>
            <Link
              href="/service-listings"
              className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </Link>
            <div className="h-px bg-gray-200" />
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-red-600 transition-colors disabled:opacity-60"
                >
                  <LogOut className="h-4 w-4" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
