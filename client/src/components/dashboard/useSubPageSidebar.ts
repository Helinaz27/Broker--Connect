import { useState } from "react";
import {
  Home,
  Car,
  Wrench,
  ShieldCheck,
  Users,
  DollarSign,
} from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

export function useSubPageSidebar() {
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
      label: "Houses",
      icon: Home,
      post: "house_post",
      view: "house_view",
      color: "text-primary",
    },
    {
      id: "cars",
      label: "Cars",
      icon: Car,
      post: "car_post",
      view: "car_view",
      color: "text-blue-500",
    },
    {
      id: "services",
      label: "Services",
      icon: Wrench,
      post: "service_post",
      view: "service_view",
      color: "text-emerald-500",
    },
  ];

  const adminItems = isAdmin
    ? [
        {
          id: "admin_fees",
          label: "Platform Fees",
          icon: DollarSign,
          href: "/dashboard/fees",
          color: "bg-violet-500/10 text-violet-600",
        },
        {
          id: "admin_kyc",
          label: "KYC Requests",
          icon: ShieldCheck,
          href: "/dashboard/kyc",
          color: "bg-amber-500/10 text-amber-600",
        },
        {
          id: "admin_users",
          label: "User Directory",
          icon: Users,
          href: "/dashboard/users",
          color: "bg-primary/10 text-primary",
        },
      ]
    : [];

  return {
    isAdmin,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    expandedMenus,
    toggleMenu,
    menuItems,
    adminItems,
  };
}
