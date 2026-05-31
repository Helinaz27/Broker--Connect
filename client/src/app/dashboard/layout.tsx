// app/dashboard/layout.tsx
"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import {
  Home,
  Car,
  Wrench,
  ShieldCheck,
  Users,
  DollarSign,
  Menu,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import Chat from "@/components/Chat";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const isAdmin = currentUser?.roles?.includes("admin") ?? false;

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMenu = (menu: string) => {
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
      setExpandedMenus([menu]);
      return;
    }
    setExpandedMenus((prev) =>
      prev.includes(menu) ? prev.filter((m) => m !== menu) : [...prev, menu],
    );
  };

  const menuItems = [
    {
      id: "houses",
      label: t("common.houses"),
      icon: Home,
      post: "/dashboard/houses/post",
      view: "/dashboard/houses/manage",
      color: "text-primary",
    },
    {
      id: "cars",
      label: t("common.cars"),
      icon: Car,
      post: "/dashboard/cars/post",
      view: "/dashboard/cars/manage",
      color: "text-blue-500",
    },
    {
      id: "services",
      label: t("common.otherServices"),
      icon: Wrench,
      post: "/dashboard/services/post",
      view: "/dashboard/services/manage",
      color: "text-emerald-500",
    },
  ];

  const adminItems = isAdmin
    ? [
        {
          id: "admin_fees",
          label: t("dashboard.platformFees"),
          icon: DollarSign,
          href: "/dashboard/fees",
          color: "bg-violet-500/10 text-violet-600",
        },
        {
          id: "admin_kyc",
          label: t("dashboard.kycRequests"),
          icon: ShieldCheck,
          href: "/dashboard/kyc",
          color: "bg-amber-500/10 text-amber-600",
        },
        {
          id: "admin_users",
          label: t("dashboard.userDirectory"),
          icon: Users,
          href: "/dashboard/users",
          color: "bg-primary/10 text-primary",
        },
      ]
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Mobile-only topbar — hidden on md+ where the sidebar is always visible */}
      <div className="md:hidden sticky top-0 z-40 flex items-center gap-3 px-4 h-14 bg-card border-b border-border">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="h-9 w-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
          aria-label={t("dashboard.openSidebar")}
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {t("dashboard.brokerConsole")}
        </span>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          isAdmin={isAdmin}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          isMobileSidebarOpen={isMobileSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          expandedMenus={expandedMenus}
          toggleMenu={toggleMenu}
          menuItems={menuItems}
          adminItems={adminItems}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar relative bg-muted/30">
          <div className="max-w-7xl mx-auto space-y-8 md:space-y-10">
            {children}
          </div>
        </main>
      </div>
      <Chat />
    </div>
  );
}
