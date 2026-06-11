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
  LucideProps,
} from "lucide-react";
import {
  useState,
  useEffect,
  ForwardRefExoticComponent,
  RefAttributes,
} from "react";
import { useRouter } from "next/navigation";
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
import { disconnectSocket, connectSocket, getSocket } from "@/lib/socket";
import { useGetUnreadCountQuery } from "@/store/apis/notificationApi";
import { AppNotification } from "@/store/apis/notificationApi";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageProvider";

type MenuItem = {
  href: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  label: string;
};

export default function Header() {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [liveUnread, setLiveUnread] = useState(0);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const { currentUser, isAuthenticated } = useAppSelector(
    (state) => state.user,
  );

  const user = isAuthenticated ? currentUser : null;
  const userName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
      t("header.user")
    : "";
  const userInitials = userName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const hasDashboardAccess =
    user?.roles?.some((role) => role === "client" || role === "admin") ?? false;

  const { data: unreadData, refetch: refetchUnread } = useGetUnreadCountQuery(
    undefined,
    {
      skip: !isAuthenticated,
      pollingInterval: 60000,
    },
  );

  const serverUnread = unreadData?.data?.unreadCount ?? 0;
  const totalUnread = serverUnread + liveUnread;
  const showBadge = totalUnread > 0;

  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    connectSocket();
    const socket = getSocket();

    const handleNewNotification = (notification: AppNotification) => {
      setLiveUnread((prev) => prev + 1);
      toast(notification.title, {
        description: notification.body,
        duration: 5000,
      });
    };

    socket.on("new_notification", handleNewNotification);
    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    setLiveUnread(0);
    if (isAuthenticated) {
      refetchUnread();
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      disconnectSocket();
      dispatch(clearUser());
      toast.success(t("auth.logoutSuccess"));
      setMobileMenuOpen(false);
      setProfileOpen(false);
      router.push("/login");
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message ||
        t("auth.logoutFailed");
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const desktopMenuItems: MenuItem[] = [
    ...(hasDashboardAccess
      ? [
          {
            href: "/dashboard",
            icon: LayoutDashboard,
            label: t("header.dashboard"),
          },
        ]
      : []),
    { href: "/profile", icon: User, label: t("header.myProfile") },
    { href: "/settings", icon: Settings, label: t("header.settings") },
  ];

  const navLinks = [
    { href: "/", label: t("header.home") },
    { href: "/house-listings", label: t("header.houses") },
    { href: "/car-listings", label: t("header.cars") },
    { href: "/service-listings", label: t("header.otherServices") },
    { href: "/about-us", label: t("header.aboutUs") },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full bg-background border-b border-border transition-all duration-300 ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="container flex h-14 items-center justify-between">
        <Logo size="md" />

        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher />
          <ModeToggle />

          {user && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 relative"
              asChild
            >
              <Link href="/notifications" onClick={() => setLiveUnread(0)}>
                <Bell className="h-5 w-5" />
                {showBadge && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
              </Link>
            </Button>
          )}

          <Link href="/favorites">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>

          {user ? (
            <HoverCard
              open={profileOpen}
              onOpenChange={setProfileOpen}
              openDelay={0}
              closeDelay={200}
            >
              <HoverCardTrigger asChild>
                <div
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1.5 rounded-md hover:bg-accent transition-colors cursor-pointer"
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
                      {(user.coins ?? 0).toLocaleString()} {t("header.coins")}
                    </p>
                  </div>
                </div>
              </HoverCardTrigger>
              <HoverCardContent
                className="w-56 p-1 mt-1 rounded-lg border border-border bg-background shadow-lg z-50"
                align="end"
              >
                <div className="flex flex-col gap-1">
                  {desktopMenuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setProfileOpen(false)}
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
                    <span>
                      {isLoggingOut
                        ? t("header.loggingOut")
                        : t("header.logout")}
                    </span>
                  </button>
                </div>
              </HoverCardContent>
            </HoverCard>
          ) : (
            <Link href="/login">
              <Button variant="default" size="sm" className="font-medium">
                {t("header.signIn")}
              </Button>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher className="h-9 w-[110px]" />
          <ModeToggle />
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 relative"
              asChild
            >
              <Link href="/notifications" onClick={() => setLiveUnread(0)}>
                <Bell className="h-5 w-5" />
                {showBadge && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
              </Link>
            </Button>
          )}
          <Link href="/favorites">
            <Button variant="ghost" size="icon" className="h-9 w-9">
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

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-border my-2" />
            {user ? (
              <>
                {hasDashboardAccess && (
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {t("header.dashboard")}
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  {t("header.myProfile")}
                </Link>
                <Link
                  href="/settings"
                  className="text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  {t("header.settings")}
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
                  {t("header.logout")}
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="default"
                  size="sm"
                  className="w-full font-medium"
                >
                  {t("header.signIn")}
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
