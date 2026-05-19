"use client";

import { LayoutDashboard, Menu, ChevronDown } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  post: string;
  view: string;
  color: string;
}

interface AdminItem {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
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
  activeTab,
  setActiveTab,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  expandedMenus,
  toggleMenu,
  menuItems,
  adminItems,
}: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 md:relative 
        ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${isSidebarCollapsed ? "md:w-20" : "md:w-72"} 
        w-72 bg-card border-r border-border transition-all duration-300 flex flex-col shadow-sm
      `}>
        <div className="p-6 border-b border-border flex items-center justify-between">
          {(!isSidebarCollapsed || isMobileSidebarOpen) && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Broker Console</span>
          )}
          <button 
            onClick={() => {
              if (window.innerWidth < 768) {
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
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${
              activeTab === "dashboard"
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <LayoutDashboard className={`h-5 w-5 flex-shrink-0 transition-transform ${activeTab === "dashboard" ? "scale-105" : "group-hover:scale-105"}`} />
            {(!isSidebarCollapsed || isMobileSidebarOpen) && <span className="font-semibold text-sm">Performance Hub</span>}
          </button>

          <div className="h-px bg-border/50 my-6 mx-4" />

          {(!isSidebarCollapsed || isMobileSidebarOpen) && (
            <p className="px-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Asset Portfolios</p>
          )}

          {menuItems.map((cat) => (
            <div key={cat.id} className="space-y-1">
              <button
                onClick={() => toggleMenu(cat.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group/item ${
                  (activeTab === cat.post || activeTab === cat.view) ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-4">
                  <cat.icon className={`h-5 w-5 flex-shrink-0 transition-colors ${ (activeTab === cat.post || activeTab === cat.view) ? cat.color : "group-hover/item:text-foreground"}`} />
                  {(!isSidebarCollapsed || isMobileSidebarOpen) && <span className="font-semibold text-sm">{cat.label}</span>}
                </div>
                {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${expandedMenus.includes(cat.id) ? "rotate-180" : "text-muted-foreground/50"}`} />
                )}
              </button>
              
              {(!isSidebarCollapsed || isMobileSidebarOpen) && expandedMenus.includes(cat.id) && (
                <div className="pl-11 pr-2 space-y-1 animate-in">
                  {[
                    { label: "Post New Asset", tab: cat.post },
                    { label: "Manage Inventory", tab: cat.view }
                  ].map((sub) => (
                    <button
                      key={sub.tab}
                      onClick={() => setActiveTab(sub.tab as any)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium transition-all ${
                        activeTab === sub.tab ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="h-px bg-border/50 my-6 mx-4" />

          {(!isSidebarCollapsed || isMobileSidebarOpen) && (
            <p className="px-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Network Admin</p>
          )}

          {adminItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                activeTab === item.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {(!isSidebarCollapsed || isMobileSidebarOpen) && <span className="font-semibold text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
