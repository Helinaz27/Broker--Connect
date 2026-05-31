"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageProvider";

export interface FilterValues {
  search: string;
  location: string;
  priceMin: number;
  priceMax: number;
  category: "all" | "house" | "car" | "otherService";
  listingMode?: "all" | "rent" | "sell";
}

interface FilterPanelProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  onReset?: () => void;
  showListingMode?: boolean;
  className?: string;
}

export default function FilterPanel({
  filters,
  onFiltersChange,
  onReset,
  showListingMode = false,
  className,
}: FilterPanelProps) {
  const { t } = useLanguage();
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.priceMin,
    filters.priceMax,
  ]);

  const handlePriceChange = (value: [number, number]) => {
    setPriceRange(value);
    onFiltersChange({
      ...filters,
      priceMin: value[0],
      priceMax: value[1],
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.location ||
    filters.category !== "all" ||
    filters.priceMin > 0 ||
    filters.priceMax < 100000 ||
    (filters.listingMode && filters.listingMode !== "all");

  const priceLabel = t("filters.priceRange")
    .replace("${min}", priceRange[0].toLocaleString())
    .replace("${max}", priceRange[1].toLocaleString());

  return (
    <Card className={cn("bg-card", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{t("filters.filters")}</CardTitle>
            <CardDescription>{t("filters.refineSearch")}</CardDescription>
          </div>
          {hasActiveFilters && onReset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium">
            {t("common.search")}
          </Label>
          <Input
            id="search"
            placeholder={t("filters.searchByTitle")}
            value={filters.search}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">
            {t("home.category")}
          </Label>
          <Select
            value={filters.category}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                category: value as FilterValues["category"],
              })
            }
          >
            <SelectTrigger id="category" className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.allCategories")}</SelectItem>
              <SelectItem value="house">{t("common.houses")}</SelectItem>
              <SelectItem value="car">{t("common.cars")}</SelectItem>
              <SelectItem value="otherService">
                {t("common.otherServices")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showListingMode && filters.category !== "otherService" && (
          <div className="space-y-2">
            <Label htmlFor="listingMode" className="text-sm font-medium">
              {t("common.listingMode")}
            </Label>
            <Select
              value={filters.listingMode || "all"}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  listingMode: value as FilterValues["listingMode"],
                })
              }
            >
              <SelectTrigger id="listingMode" className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="rent">{t("common.rent")}</SelectItem>
                <SelectItem value="sell">{t("common.sell")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium">
            {t("common.location")}
          </Label>
          <Input
            id="location"
            placeholder={t("filters.enterCity")}
            value={filters.location}
            onChange={(e) =>
              onFiltersChange({ ...filters, location: e.target.value })
            }
            className="bg-background"
          />
        </div>

        <div className="space-y-4">
          <Label className="text-sm font-medium">{priceLabel}</Label>
          <Slider
            value={priceRange}
            onValueChange={handlePriceChange}
            min={0}
            max={100000}
            step={500}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}
