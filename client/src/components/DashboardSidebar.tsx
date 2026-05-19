"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Shield,
  Settings,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

interface DashboardSidebarProps {
  isAdmin?: boolean;
  className?: string;
}

export default function DashboardSidebar({
  isAdmin = false,
  className,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const sidebarItems: SidebarItem[] = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "My Listings",
      href: "/dashboard/listings",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-4 w-4" />,
    },
    // Admin only items
    {
      label: "KYC Management",
      href: "/dashboard/kyc",
      icon: <Shield className="h-4 w-4" />,
      adminOnly: true,
    },
    {
      label: "Users",
      href: "/dashboard/users",
      icon: <Users className="h-4 w-4" />,
      adminOnly: true,
    },
    {
      label: "Platform Fees",
      href: "/dashboard/fees",
      icon: <CreditCard className="h-4 w-4" />,
      adminOnly: true,
    },
  ];

  const visibleItems = sidebarItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <Card
      className={cn(
        "bg-card border border-border rounded-lg p-4 h-fit sticky top-20",
        className
      )}
    >
      <nav className="space-y-2">
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className="w-full justify-start gap-3"
              >
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>
    </Card>
  );
}
