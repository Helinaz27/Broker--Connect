"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  RefreshCw,
  Coins,
  X,
  ShoppingCart,
  AlertCircle,
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
  useRenewListingMutation,
} from "@/store/apis/listingsApi";
import type { Listing, ListingStatus } from "@/store/apis/listingsApi";
import { useSearchPlatformFeesQuery } from "@/store/apis/platformFeeApi";
import { useInitiateChapaMutation } from "@/store/apis/paymentApi";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { toast } from "sonner";

type ListingModeFilter = "all" | "rent" | "sell";

function BuyCoinsModal({ onClose }: { onClose: () => void }) {
  const [coinsRequested, setCoinsRequested] = useState(100);
  const [initiateChapa, { isLoading }] = useInitiateChapaMutation();

  const packages = [
    { coins: 50, label: "Starter" },
    { coins: 100, label: "Basic" },
    { coins: 250, label: "Popular" },
    { coins: 500, label: "Pro" },
  ];

  const totalBirr = coinsRequested * 1;

  const handleBuy = async () => {
    if (coinsRequested < 1) {
      toast.error("Please enter a valid coin amount.");
      return;
    }
    try {
      const result = await initiateChapa({ coinsRequested }).unwrap();
      if (result.data?.checkout_url) {
        window.location.href = result.data.checkout_url;
      }
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to initiate payment.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Coins className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Buy Coins</h2>
              <p className="text-xs text-muted-foreground">
                Paid via Chapa · ETB
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {packages.map((pkg) => (
            <button
              key={pkg.coins}
              onClick={() => setCoinsRequested(pkg.coins)}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl border text-xs font-bold transition-all ${
                coinsRequested === pkg.coins
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              <span className="text-base font-extrabold">{pkg.coins}</span>
              <span className="uppercase tracking-widest text-[9px]">
                {pkg.label}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Custom Amount
          </label>
          <input
            type="number"
            min={1}
            value={coinsRequested}
            onChange={(e) =>
              setCoinsRequested(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary/10 outline-none transition-all"
            placeholder="Enter coin amount"
          />
        </div>

        <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              You Pay
            </p>
            <p className="text-2xl font-extrabold text-foreground">
              {totalBirr.toLocaleString()}{" "}
              <span className="text-sm font-bold text-muted-foreground">
                ETB
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              You Get
            </p>
            <p className="text-2xl font-extrabold text-primary">
              {coinsRequested.toLocaleString()}{" "}
              <span className="text-sm font-bold">coins</span>
            </p>
          </div>
        </div>

        <Button
          onClick={handleBuy}
          disabled={isLoading || coinsRequested < 1}
          className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-xs gap-2 disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting…
            </>
          ) : (
            <>
              <Coins className="h-4 w-4" />
              Proceed to Payment
            </>
          )}
        </Button>

        <p className="text-center text-[10px] text-muted-foreground">
          Powered by Chapa · Secure payment gateway
        </p>
      </div>
    </div>
  );
}

interface RenewDialogProps {
  listing: Listing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userCoins: number;
  onBuyCoins: () => void;
}

function RenewDialog({
  listing,
  open,
  onOpenChange,
  onSuccess,
  userCoins,
  onBuyCoins,
}: RenewDialogProps) {
  const [durationDays, setDurationDays] = useState("");
  const [renewListing, { isLoading }] = useRenewListingMutation();

  const feeListingMode = listing?.listingMode ?? undefined;

  const {
    data: feeData,
    isLoading: isFeeLoading,
    isError: isFeeError,
  } = useSearchPlatformFeesQuery(
    {
      feeType: "posting_fee",
      category: listing?.listingType ?? "house",
      ...(feeListingMode ? { listingMode: feeListingMode } : {}),
      isActive: true,
    },
    { skip: !listing },
  );

  const { estimatedCost, noFeeFound } = useMemo(() => {
    const fees = feeData?.data?.platformFees;
    if (!fees || fees.length === 0)
      return { estimatedCost: null, noFeeFound: true };
    const fee = fees[0];
    const days = parseInt(durationDays || "0");
    if (!days || !fee.durationDays || !fee.coinAmount)
      return { estimatedCost: null, noFeeFound: false };
    const cost = Math.ceil((days * fee.coinAmount) / fee.durationDays);
    return { estimatedCost: cost, noFeeFound: false };
  }, [feeData, durationDays]);

  const canAfford = estimatedCost !== null && userCoins >= estimatedCost;

  const handleRenew = async () => {
    if (!listing) return;
    if (!durationDays || parseInt(durationDays) < 1) {
      toast.error("Please enter a valid number of days.");
      return;
    }
    try {
      const result = await renewListing({
        id: listing.id,
        durationDays: parseInt(durationDays),
      }).unwrap();
      if (result.success) {
        toast.success(`Listing renewed successfully for ${durationDays} days.`);
        onOpenChange(false);
        setDurationDays("");
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to renew listing.");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setDurationDays("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Renew Listing
          </DialogTitle>
          <DialogDescription>
            Extend the active duration of &ldquo;{listing?.title}&rdquo;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
              Duration (days)
            </label>
            <input
              type="number"
              min={1}
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary/10 outline-none transition-all"
              placeholder="e.g. 30"
            />
          </div>

          {durationDays && parseInt(durationDays) > 0 && (
            <div className="space-y-3">
              {isFeeLoading && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/20">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Calculating cost…
                  </span>
                </div>
              )}

              {(isFeeError || noFeeFound) && (
                <div className="flex items-start gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                  <AlertCircle className="h-4 w-4 mt-0.5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">
                    No active posting fee configured for this listing type.
                    Please contact admin.
                  </p>
                </div>
              )}

              {estimatedCost !== null && !isFeeLoading && (
                <div
                  className={`rounded-xl border p-4 space-y-3 ${canAfford ? "border-green-500/30 bg-green-500/5" : "border-destructive/30 bg-destructive/5"}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Renewal Cost
                      </p>
                      <p
                        className={`text-2xl font-bold tabular-nums ${canAfford ? "text-green-600" : "text-destructive"}`}
                      >
                        {estimatedCost.toLocaleString()}{" "}
                        <span className="text-sm font-medium text-muted-foreground">
                          coins
                        </span>
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${canAfford ? "bg-green-500/10 text-green-700" : "bg-destructive/10 text-destructive"}`}
                    >
                      <Coins className="h-3.5 w-3.5" />
                      {userCoins.toLocaleString()} available
                    </div>
                  </div>

                  {listing?.paidUntil && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(listing.paidUntil) > new Date()
                        ? `Days will be added on top of your current expiry (${new Date(listing.paidUntil).toLocaleDateString()})`
                        : "Listing is expired — renewal will start from today"}
                    </p>
                  )}

                  {canAfford ? (
                    <p className="text-xs text-green-700 font-medium">
                      ✓ You have sufficient coins.{" "}
                      <strong>{estimatedCost.toLocaleString()} coins</strong>{" "}
                      will be deducted on confirm.
                    </p>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <p className="text-xs text-destructive font-medium flex-1">
                        You need{" "}
                        <strong>
                          {(estimatedCost - userCoins).toLocaleString()} more
                          coins
                        </strong>{" "}
                        to renew.
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="gap-2 shrink-0"
                        onClick={() => {
                          handleClose();
                          onBuyCoins();
                        }}
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Buy Coins
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleRenew}
            disabled={
              isLoading ||
              !durationDays ||
              parseInt(durationDays) < 1 ||
              !canAfford ||
              isFeeLoading
            }
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Renewing…
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Confirm Renewal
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function HouseManagePage() {
  const router = useRouter();
  const currentUser = useSelector((s: RootState) => s.user.currentUser);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modeFilter, setModeFilter] = useState<ListingModeFilter>("all");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);
  const [listingToRenew, setListingToRenew] = useState<Listing | null>(null);
  const [showBuyCoins, setShowBuyCoins] = useState(false);
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
    listingMode: modeFilter === "all" ? undefined : modeFilter,
  });

  const [updateListingStatus, { isLoading: isUpdating }] =
    useUpdateListingStatusMutation();

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleModeFilterChange = (value: ListingModeFilter) => {
    setModeFilter(value);
    setPage(1);
  };

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

  const getModeBadge = (mode: string | undefined) => {
    if (!mode) return <span className="text-muted-foreground">—</span>;
    return (
      <Badge
        variant="outline"
        className={
          mode === "rent"
            ? "border-violet-500/50 text-violet-600 bg-violet-500/5"
            : "border-blue-500/50 text-blue-600 bg-blue-500/5"
        }
      >
        {mode === "rent" ? "Rent" : "Sale"}
      </Badge>
    );
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
  const userCoins = currentUser?.coins ?? 0;

  return (
    <>
      {showBuyCoins && <BuyCoinsModal onClose={() => setShowBuyCoins(false)} />}

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
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center rounded-xl border border-border overflow-hidden">
                  {(["all", "rent", "sell"] as ListingModeFilter[]).map(
                    (mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => handleModeFilterChange(mode)}
                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                          modeFilter === mode
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        {mode === "all"
                          ? "All"
                          : mode === "rent"
                            ? "Rent"
                            : "Sale"}
                      </button>
                    ),
                  )}
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={handleStatusFilterChange}
                >
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
                <p className="text-muted-foreground">
                  {modeFilter !== "all" || statusFilter !== "all"
                    ? "No listings match the selected filters."
                    : "No house listings found."}
                </p>
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
                  <div className="min-w-[1000px] lg:min-w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">
                            Title
                          </TableHead>
                          <TableHead className="whitespace-nowrap">
                            Price (ETB)
                          </TableHead>
                          <TableHead className="whitespace-nowrap">
                            Mode
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
                              {listing.price.toLocaleString()}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {getModeBadge(listing.listingMode)}
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
                              {listing.daysRemaining !== undefined ? (
                                <span
                                  className={
                                    listing.daysRemaining <= 3
                                      ? "text-destructive font-semibold"
                                      : ""
                                  }
                                >
                                  {listing.daysRemaining} days
                                </span>
                              ) : (
                                "-"
                              )}
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
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setListingToRenew(listing);
                                    setIsRenewDialogOpen(true);
                                  }}
                                  className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10 gap-1 text-xs font-semibold"
                                  title="Renew"
                                >
                                  Renew
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
                                    <SelectItem value="active">
                                      Active
                                    </SelectItem>
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
                  <p className="text-sm text-muted-foreground">Price (ETB)</p>
                  <p className="font-medium">
                    {selectedListing?.price?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mode</p>
                  <div className="mt-0.5">
                    {getModeBadge(selectedListing?.listingMode)}
                  </div>
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
                  <p className="font-medium">
                    {selectedListing?.parking || "-"}
                  </p>
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

        <RenewDialog
          listing={listingToRenew}
          open={isRenewDialogOpen}
          onOpenChange={setIsRenewDialogOpen}
          onSuccess={() => {
            refetch();
            setListingToRenew(null);
          }}
          userCoins={userCoins}
          onBuyCoins={() => setShowBuyCoins(true)}
        />

        <AlertDialog
          open={isUpdateDialogOpen}
          onOpenChange={setIsUpdateDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Update Status</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to change the status to &ldquo;
                {listingToUpdate?.status}&rdquo;?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleStatusUpdate}
                disabled={isUpdating}
              >
                {isUpdating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
