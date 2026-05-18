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

  return (
    <Card className={cn("bg-card", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Filters</CardTitle>
            <CardDescription>Refine your search</CardDescription>
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
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium">
            Search
          </Label>
          <Input
            id="search"
            placeholder="Search by title..."
            value={filters.search}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="bg-background"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">
            Category
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
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="house">Houses</SelectItem>
              <SelectItem value="car">Cars</SelectItem>
              <SelectItem value="otherService">Other Services</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Listing Mode (for houses and cars) */}
        {showListingMode && filters.category !== "otherService" && (
          <div className="space-y-2">
            <Label htmlFor="listingMode" className="text-sm font-medium">
              Listing Mode
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
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium">
            Location
          </Label>
          <Input
            id="location"
            placeholder="Enter city or area..."
            value={filters.location}
            onChange={(e) =>
              onFiltersChange({ ...filters, location: e.target.value })
            }
            className="bg-background"
          />
        </div>

        {/* Price Range */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">
            Price Range: ${priceRange[0].toLocaleString()} - $
            {priceRange[1].toLocaleString()}
          </Label>
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
