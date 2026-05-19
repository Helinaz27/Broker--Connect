// client/src/components/dashboard/StatsGrid.tsx
"use client";

import { LucideIcon } from "lucide-react";

interface Stat {
  label: string;
  value: string;
  icon: LucideIcon;
  trend: string;
  color: string;
}

interface StatsGridProps {
  stats: Stat[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-card border border-border p-6 rounded-3xl shadow-soft hover:shadow-modern transition-all duration-500 group"
        >
          <div className="flex items-center justify-between mb-6">
            <div
              className={`h-12 w-12 rounded-2xl ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110`}
            >
              <stat.icon className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 uppercase tracking-widest">
              {stat.trend}
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground tracking-tight mb-1">
            {stat.value}
          </p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
