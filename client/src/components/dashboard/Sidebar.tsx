// components/dashboard/Sidebar.tsx
"use client";

import { LayoutDashboard, Menu, ChevronDown } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  post: string; // href for "Post New Asset"
  view: string; // href for "Manage Inventory"
  color: string;
}

interface AdminItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  color: string;
}

interface SidebarProps {
  isAdmin: boolean;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  expandedMenus: string[];
  toggleMenu: (menu: string) => void;
  menuItems: MenuItem[];
  adminItems: AdminItem[];
}

export function Sidebar({
  isAdmin,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  expandedMenus,
  toggleMenu,
  menuItems,
  adminItems,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = (href: string) => {
    router.push(href);
    setIsMobileSidebarOpen(false);
  };

  const isExpanded = !isSidebarCollapsed || isMobileSidebarOpen;

  return (
    <>
      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 md:relative
          ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isSidebarCollapsed ? "md:w-20" : "md:w-72"}
          w-72 bg-card border-r border-border transition-all duration-300 flex flex-col shadow-sm
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          {isExpanded && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Broker Console
            </span>
          )}
          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth < 768) {
                setIsMobileSidebarOpen(false);
              } else {
                setIsSidebarCollapsed(!isSidebarCollapsed);
              }
            }}
            className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {/* Performance Hub */}
          <button
            onClick={() => navigate("/dashboard")}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${
              pathname === "/dashboard"
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <LayoutDashboard className="h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-105" />
            {isExpanded && (
              <span className="font-semibold text-sm">Performance Hub</span>
            )}
          </button>

          <div className="h-px bg-border/50 my-6 mx-4" />

          {isExpanded && (
            <p className="px-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
              Asset Portfolios
            </p>
          )}

          {/* Houses / Cars / Services */}
          {menuItems.map((cat) => {
            const isActive = pathname === cat.post || pathname === cat.view;

            return (
              <div key={cat.id} className="space-y-1">
                <button
                  onClick={() => toggleMenu(cat.id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group/item ${
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <cat.icon
                      className={`h-5 w-5 flex-shrink-0 transition-colors ${
                        isActive
                          ? cat.color
                          : "group-hover/item:text-foreground"
                      }`}
                    />
                    {isExpanded && (
                      <span className="font-semibold text-sm">{cat.label}</span>
                    )}
                  </div>
                  {isExpanded && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${
                        expandedMenus.includes(cat.id)
                          ? "rotate-180"
                          : "text-muted-foreground/50"
                      }`}
                    />
                  )}
                </button>

                {isExpanded && expandedMenus.includes(cat.id) && (
                  <div className="pl-11 pr-2 space-y-1 animate-in">
                    <button
                      onClick={() => navigate(cat.post)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium transition-all ${
                        pathname === cat.post
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      Post New Asset
                    </button>
                    <button
                      onClick={() => navigate(cat.view)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium transition-all ${
                        pathname === cat.view
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      Manage Inventory
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Admin section */}
          {isAdmin && (
            <>
              <div className="h-px bg-border/50 my-6 mx-4" />

              {isExpanded && (
                <p className="px-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
                  Network Admin
                </p>
              )}

              {adminItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.href)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {isExpanded && (
                    <span className="font-semibold text-sm">{item.label}</span>
                  )}
                </button>
              ))}
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
