"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Eye,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditHouseListing } from "@/components/dashboard/EditHouseListing";
import {
  useGetMyListingsQuery,
  useUpdateListingStatusMutation,
} from "@/store/apis/listingsApi";
import type { Listing, ListingStatus } from "@/store/apis/listingsApi";
import { toast } from "sonner";

export default function HouseManagePage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [listingToUpdate, setListingToUpdate] = useState<{
    id: string;
    status: ListingStatus;
  } | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useGetMyListingsQuery({
    page,
    limit,
    listingType: "house",
    status:
      statusFilter === "all" ? undefined : (statusFilter as ListingStatus),
  });

  const [updateListingStatus, { isLoading: isUpdating }] =
    useUpdateListingStatusMutation();

  const handleStatusUpdate = async () => {
    if (!listingToUpdate) return;

    try {
      const result = await updateListingStatus({
        id: listingToUpdate.id,
        status: listingToUpdate.status,
      }).unwrap();

      if (result.success) {
        toast.success(`Listing status updated to ${listingToUpdate.status}`);
        setIsUpdateDialogOpen(false);
        setListingToUpdate(null);
        refetch();
      } else {
        toast.error(result.message || "Failed to update status");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update status");
    }
  };

  const getStatusBadge = (status: ListingStatus) => {
    const variants: Record<ListingStatus, string> = {
      active: "bg-green-500 hover:bg-green-600",
      inactive: "bg-gray-500 hover:bg-gray-600",
      occupied: "bg-yellow-500 hover:bg-yellow-600",
      sold: "bg-blue-500 hover:bg-blue-600",
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const listings = data?.data?.listings || [];
  const pagination = data?.data?.pagination;

  return (
    <div className="space-y-6 md:space-y-8 animate-in px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="md:hidden flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl"
              onClick={() => router.back()}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-bold text-lg">Broker Console</h1>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            My House Listings
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Manage your house listings
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="gap-2"
            onClick={() => router.push("/dashboard/houses/post")}
          >
            Post New House
          </Button>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg sm:text-xl">
              Houses {pagination && `(${pagination.total})`}
            </CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-destructive">Failed to load listings</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => refetch()}
              >
                Try Again
              </Button>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-muted-foreground">No house listings found</p>
              <Button
                variant="outline"
                className="mt-4 gap-2"
                onClick={() => router.push("/dashboard/houses/post")}
              >
                Post your first house
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto w-full">
                <div className="min-w-[800px] lg:min-w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">
                          Title
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Price
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Location
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Bed/Bath
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Area
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Status
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Posted
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Expires
                        </TableHead>
                        <TableHead className="whitespace-nowrap text-center">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listings.map((listing) => (
                        <TableRow key={listing.id}>
                          <TableCell className="font-medium whitespace-nowrap">
                            {listing.title}
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-mono">
                            ${listing.price.toLocaleString()}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {listing.location?.city || "-"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {listing.bedrooms}/{listing.bathrooms}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {listing.area_sqm ? `${listing.area_sqm}m²` : "-"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {getStatusBadge(listing.status)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatDate(listing.createdAt)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {listing.daysRemaining !== undefined
                              ? `${listing.daysRemaining} days`
                              : "-"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-center">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedListing(listing);
                                  setIsViewDialogOpen(true);
                                }}
                                className="h-8 w-8 p-0"
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedListing(listing);
                                  setIsEditDialogOpen(true);
                                }}
                                className="h-8 w-8 p-0"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Select
                                value={listing.status}
                                onValueChange={(value: ListingStatus) => {
                                  setListingToUpdate({
                                    id: listing.id,
                                    status: value,
                                  });
                                  setIsUpdateDialogOpen(true);
                                }}
                              >
                                <SelectTrigger className="h-8 w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="inactive">
                                    Inactive
                                  </SelectItem>
                                  <SelectItem value="occupied">
                                    Occupied
                                  </SelectItem>
                                  <SelectItem value="sold">Sold</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {pagination && pagination.pages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-4 sm:px-0">
                  <p className="text-sm text-muted-foreground order-2 sm:order-1">
                    Showing {(pagination.page - 1) * limit + 1} to{" "}
                    {Math.min(pagination.page * limit, pagination.total)} of{" "}
                    {pagination.total} entries
                  </p>
                  <div className="flex gap-2 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page === pagination.pages}
                      className="gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedListing?.title}</DialogTitle>
            <DialogDescription>Listing details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedListing?.images && selectedListing.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {selectedListing.images.slice(0, 4).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Listing ${idx + 1}`}
                    className="rounded-lg w-full h-32 object-cover"
                  />
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-medium">
                  ${selectedListing?.price?.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">
                  {selectedListing?.location?.fullAddress || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bedrooms</p>
                <p className="font-medium">
                  {selectedListing?.bedrooms || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bathrooms</p>
                <p className="font-medium">
                  {selectedListing?.bathrooms || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Area</p>
                <p className="font-medium">
                  {selectedListing?.area_sqm
                    ? `${selectedListing.area_sqm}m²`
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Parking</p>
                <p className="font-medium">{selectedListing?.parking || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tanker</p>
                <p className="font-medium">
                  {selectedListing?.tanker ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rental Period</p>
                <p className="font-medium">
                  {selectedListing?.rentalPeriod || "-"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-sm">{selectedListing?.description}</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditHouseListing
        listing={selectedListing}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={() => {
          refetch();
          setSelectedListing(null);
        }}
      />

      <AlertDialog
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status to "
              {listingToUpdate?.status}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusUpdate}
              disabled={isUpdating}
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
