"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Eye, Edit, Trash2 } from "lucide-react";

interface ListingForTable {
  id: string;
  title: string;
  price: number;
  location: string;
  mode?: "rent" | "sell";
  status: "active" | "inactive" | "pending" | "sold" | "rented";
  createdAt: string;
  views?: number;
}

interface ListingsTableProps {
  listings: ListingForTable[];
  category: "house" | "car" | "otherService";
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showMode?: boolean;
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  sold: "bg-blue-100 text-blue-800",
  rented: "bg-purple-100 text-purple-800",
};

export default function ListingsTable({
  listings,
  category,
  onView,
  onEdit,
  onDelete,
  showMode = false,
}: ListingsTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold">Title</TableHead>
            <TableHead className="font-semibold">Location</TableHead>
            {showMode && <TableHead className="font-semibold">Mode</TableHead>}
            <TableHead className="font-semibold">Price</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            {listings[0]?.views !== undefined && (
              <TableHead className="font-semibold">Views</TableHead>
            )}
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listings.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={showMode ? 7 : 6}
                className="text-center text-muted-foreground py-8"
              >
                No listings found
              </TableCell>
            </TableRow>
          ) : (
            listings.map((listing) => (
              <TableRow key={listing.id} className="hover:bg-muted/50">
                <TableCell className="font-medium max-w-xs truncate">
                  {listing.title}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {listing.location}
                </TableCell>
                {showMode && listing.mode && (
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        listing.mode === "rent"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-green-50 text-green-700"
                      }
                    >
                      {listing.mode}
                    </Badge>
                  </TableCell>
                )}
                <TableCell className="font-semibold">
                  ${listing.price.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={statusColors[listing.status]}
                  >
                    {listing.status}
                  </Badge>
                </TableCell>
                {listing.views !== undefined && (
                  <TableCell className="text-sm">{listing.views}</TableCell>
                )}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onView && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onView(listing.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(listing.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onDelete(listing.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
