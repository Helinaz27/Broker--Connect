// app/dashboard/fees/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  ShieldCheck,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useCreatePlatformFeeMutation,
  useUpdatePlatformFeeMutation,
  useDeletePlatformFeeMutation,
  useTogglePlatformFeeStatusMutation,
  useGetAllPlatformFeesQuery,
} from "@/store/apis/platformFeeApi";
import type {
  PlatformFee,
  FeeType,
  Category,
  ListingMode,
} from "@/store/apis/platformFeeApi";

const formSchema = z.object({
  feeType: z.enum(["posting_fee", "contact_access_fee"], {
    required_error: "Fee type is required",
  }),
  category: z.enum(["house", "car", "service"], {
    required_error: "Category is required",
  }),
  listingMode: z.enum(["rent", "sell"]).optional(),
  durationDays: z.coerce
    .number()
    .min(1, "Duration must be at least 1 day")
    .max(365, "Duration cannot exceed 365 days")
    .optional(),
  coinAmount: z.coerce.number().min(0, "Coin amount must be at least 0"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export default function FeesPage() {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const isAdmin = currentUser?.roles?.includes("admin") ?? false;
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedFee, setSelectedFee] = useState<PlatformFee | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [feeToDelete, setFeeToDelete] = useState<PlatformFee | null>(null);

  const {
    data: feesData,
    isLoading,
    isError,
    refetch,
  } = useGetAllPlatformFeesQuery({ page, limit });

  const [createPlatformFee, { isLoading: isCreating }] =
    useCreatePlatformFeeMutation();
  const [updatePlatformFee, { isLoading: isUpdating }] =
    useUpdatePlatformFeeMutation();
  const [togglePlatformFeeStatus, { isLoading: isToggling }] =
    useTogglePlatformFeeStatusMutation();
  const [deletePlatformFee, { isLoading: isDeleting }] =
    useDeletePlatformFeeMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      feeType: "posting_fee",
      coinAmount: 0,
      isActive: true,
    },
  });

  const watchFeeType = form.watch("feeType");
  const watchCategory = form.watch("category");

  useEffect(() => {
    if (isFormOpen) {
      if (selectedFee) {
        form.reset({
          feeType: selectedFee.feeType,
          category: selectedFee.category || undefined,
          listingMode: selectedFee.listingMode || undefined,
          durationDays: selectedFee.durationDays || undefined,
          coinAmount: selectedFee.coinAmount,
          description: selectedFee.description || undefined,
          isActive: selectedFee.isActive,
        });
      } else {
        form.reset({
          feeType: "posting_fee",
          category: undefined,
          listingMode: undefined,
          durationDays: undefined,
          coinAmount: 0,
          description: "",
          isActive: true,
        });
      }
    }
  }, [isFormOpen, selectedFee, form]);

  const existingCombinations =
    feesData?.data?.platformFees
      ?.filter((fee) => !selectedFee || fee.id !== selectedFee.id)
      .map((fee) => ({
        feeType: fee.feeType,
        category: fee.category,
        listingMode: fee.listingMode,
      })) || [];

  const isCombinationDuplicate = (
    feeType: FeeType,
    category?: Category,
    listingMode?: ListingMode,
  ) => {
    return existingCombinations.some((comb) => {
      if (category === "service") {
        return (
          comb.feeType === feeType &&
          comb.category === category &&
          comb.listingMode === null
        );
      } else {
        return (
          comb.feeType === feeType &&
          comb.category === category &&
          comb.listingMode === listingMode
        );
      }
    });
  };

  const getAvailableListingModes = (): ListingMode[] => {
    if (!watchFeeType || !watchCategory || watchCategory === "service")
      return [];

    const usedModes = existingCombinations
      .filter(
        (comb) =>
          comb.feeType === watchFeeType && comb.category === watchCategory,
      )
      .map((comb) => comb.listingMode)
      .filter((mode): mode is ListingMode => mode !== null);

    const allModes: ListingMode[] = ["rent", "sell"];
    return allModes.filter((mode) => !usedModes.includes(mode));
  };

  const isListingModeRequired = (category?: Category): boolean => {
    return category === "house" || category === "car";
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (!values.category) {
        toast.error("Category is required");
        return;
      }

      if (isListingModeRequired(values.category) && !values.listingMode) {
        toast.error(`Listing mode is required for ${values.category} fees`);
        return;
      }

      if (values.feeType === "posting_fee" && !values.durationDays) {
        toast.error("Duration days is required for posting fees");
        return;
      }

      if (values.category === "service") {
        values.listingMode = undefined;
      }

      if (!selectedFee) {
        const isDuplicate = isCombinationDuplicate(
          values.feeType,
          values.category,
          values.listingMode,
        );
        if (isDuplicate) {
          toast.error(
            `This fee combination already exists. Please edit the existing fee instead.`,
          );
          return;
        }
      }

      if (selectedFee) {
        const updateData: any = {};
        if (values.category !== selectedFee.category)
          updateData.category = values.category;
        if (values.listingMode !== selectedFee.listingMode) {
          if (values.category === "service") {
            updateData.listingMode = null;
          } else if (values.listingMode) {
            updateData.listingMode = values.listingMode;
          } else {
            updateData.listingMode = null;
          }
        }
        if (values.durationDays !== selectedFee.durationDays)
          updateData.durationDays = values.durationDays;
        if (values.coinAmount !== selectedFee.coinAmount)
          updateData.coinAmount = values.coinAmount;
        if (values.description !== selectedFee.description)
          updateData.description = values.description;
        if (values.isActive !== selectedFee.isActive)
          updateData.isActive = values.isActive;

        if (Object.keys(updateData).length === 0) {
          toast.info("No changes to update");
          setIsFormOpen(false);
          setSelectedFee(null);
          return;
        }

        const result = await updatePlatformFee({
          id: selectedFee.id,
          data: updateData,
        }).unwrap();
        if (result.success) {
          toast.success("Platform fee updated successfully");
          setIsFormOpen(false);
          setSelectedFee(null);
          refetch();
        } else {
          toast.error(result.message || "Failed to update platform fee");
        }
      } else {
        const createData: any = {
          feeType: values.feeType,
          category: values.category,
          coinAmount: values.coinAmount,
          description: values.description,
        };

        if (values.listingMode) createData.listingMode = values.listingMode;
        if (values.durationDays) createData.durationDays = values.durationDays;

        const result = await createPlatformFee(createData).unwrap();
        if (result.success) {
          toast.success("Platform fee created successfully");
          setIsFormOpen(false);
          refetch();
        } else {
          toast.error(result.message || "Failed to create platform fee");
        }
      }
    } catch (error: any) {
      if (error?.status === 409) {
        toast.error(
          "This fee combination already exists. Please edit the existing fee instead.",
        );
      } else {
        toast.error(error?.data?.message || "An error occurred");
      }
    }
  };

  const handleToggleStatus = async (fee: PlatformFee) => {
    try {
      const result = await togglePlatformFeeStatus({
        id: fee.id,
        isActive: !fee.isActive,
      }).unwrap();
      if (result.success) {
        toast.success(
          `Fee ${!fee.isActive ? "activated" : "deactivated"} successfully`,
        );
        refetch();
      } else {
        toast.error(result.message || "Failed to update status");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!feeToDelete) return;

    try {
      const result = await deletePlatformFee(feeToDelete.id).unwrap();
      if (result.success) {
        toast.success("Platform fee deleted successfully");
        setIsDeleteDialogOpen(false);
        setFeeToDelete(null);
        refetch();
      } else {
        toast.error(result.message || "Failed to delete platform fee");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete platform fee");
    }
  };

  const handleEdit = (fee: PlatformFee) => {
    setSelectedFee(fee);
    setIsFormOpen(true);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  const getDisplayName = (fee: PlatformFee): string => {
    const parts: string[] = [];
    if (fee.category)
      parts.push(fee.category.charAt(0).toUpperCase() + fee.category.slice(1));
    if (fee.listingMode)
      parts.push(
        fee.listingMode.charAt(0).toUpperCase() + fee.listingMode.slice(1),
      );
    if (fee.feeType === "posting_fee") parts.push("Posting Fee");
    else parts.push("Contact Access Fee");

    return parts.join(" - ");
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShieldCheck className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground font-medium">
          You don't have permission to view this page.
        </p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Go back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Platform Fees
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Manage platform fees for listings and contact access
          </p>
        </div>
        <Button
          className="gap-2 w-full sm:w-auto"
          onClick={() => {
            setSelectedFee(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add New Fee
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg sm:text-xl">
              Fee Configurations
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-destructive">Failed to load platform fees</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => refetch()}
              >
                Try Again
              </Button>
            </div>
          ) : feesData?.data?.platformFees?.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-muted-foreground">No platform fees found</p>
              <Button
                variant="outline"
                className="mt-4 gap-2"
                onClick={() => {
                  setSelectedFee(null);
                  setIsFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Create your first fee
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto w-full">
                <div className="min-w-[900px] lg:min-w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">
                          Fee Name
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Fee Type
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Category
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Listing Mode
                        </TableHead>
                        <TableHead className="whitespace-nowrap text-right">
                          Coin Amount
                        </TableHead>
                        <TableHead className="whitespace-nowrap text-right">
                          Duration (Days)
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Status
                        </TableHead>
                        <TableHead className="whitespace-nowrap text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feesData?.data?.platformFees.map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell className="font-medium whitespace-nowrap">
                            {getDisplayName(fee)}
                          </TableCell>
                          <TableCell className="capitalize whitespace-nowrap">
                            {fee.feeType === "posting_fee"
                              ? "Posting"
                              : "Contact Access"}
                          </TableCell>
                          <TableCell className="capitalize whitespace-nowrap">
                            {fee.category || "-"}
                          </TableCell>
                          <TableCell className="capitalize whitespace-nowrap">
                            {fee.listingMode || "-"}
                          </TableCell>
                          <TableCell className="text-right font-mono whitespace-nowrap">
                            {fee.coinAmount} coins
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            {fee.durationDays
                              ? `${fee.durationDays} days`
                              : "-"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(fee.isActive)}
                              <Switch
                                checked={fee.isActive}
                                onCheckedChange={() => handleToggleStatus(fee)}
                                disabled={isToggling}
                                className="data-[state=checked]:bg-green-500"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(fee)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setFeeToDelete(fee);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {feesData?.data?.pagination &&
                feesData.data.pagination.pages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-4 sm:px-0">
                    <p className="text-sm text-muted-foreground order-2 sm:order-1">
                      Showing {(feesData.data.pagination.page - 1) * limit + 1}{" "}
                      to{" "}
                      {Math.min(
                        feesData.data.pagination.page * limit,
                        feesData.data.pagination.total,
                      )}{" "}
                      of {feesData.data.pagination.total} entries
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
                        disabled={page === feesData.data.pagination.pages}
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

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsFormOpen(false);
            setSelectedFee(null);
            form.reset();
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">
              {selectedFee ? "Edit Platform Fee" : "Create New Platform Fee"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {selectedFee
                ? "Update the fee details below"
                : "Fill in the details to create a new platform fee. Each combination of fee type, category, and listing mode must be unique."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="feeType" className="font-medium">
                Fee Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.watch("feeType")}
                onValueChange={(value: FeeType) => {
                  form.setValue("feeType", value);
                  form.setValue("category", undefined as any);
                  form.setValue("listingMode", undefined as any);
                }}
                disabled={!!selectedFee}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fee type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="posting_fee">Posting Fee</SelectItem>
                  <SelectItem value="contact_access_fee">
                    Contact Access Fee
                  </SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.feeType && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.feeType.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="font-medium">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.watch("category")}
                onValueChange={(value: Category) => {
                  form.setValue("category", value);
                  form.setValue("listingMode", undefined);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>

            {isListingModeRequired(form.watch("category")) && (
              <div className="space-y-2">
                <Label htmlFor="listingMode" className="font-medium">
                  Listing Mode <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.watch("listingMode")}
                  onValueChange={(value: ListingMode) =>
                    form.setValue("listingMode", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select listing mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableListingModes().map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.listingMode && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.listingMode.message}
                  </p>
                )}
                {!selectedFee &&
                  getAvailableListingModes().length === 0 &&
                  watchFeeType &&
                  watchCategory && (
                    <p className="text-sm text-amber-600">
                      Both listing modes have been used for {watchCategory}{" "}
                      {watchFeeType === "posting_fee"
                        ? "posting fee"
                        : "contact access fee"}
                      . Please edit existing fees instead.
                    </p>
                  )}
              </div>
            )}

            {form.watch("feeType") === "posting_fee" && (
              <div className="space-y-2">
                <Label htmlFor="durationDays" className="font-medium">
                  Duration (Days) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="durationDays"
                  type="number"
                  min="1"
                  max="365"
                  value={form.watch("durationDays") || ""}
                  onChange={(e) =>
                    form.setValue(
                      "durationDays",
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                  placeholder="Enter duration in days"
                />
                {form.formState.errors.durationDays && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.durationDays.message}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="coinAmount" className="font-medium">
                Coin Amount <span className="text-destructive">*</span>
              </Label>
              <Input
                id="coinAmount"
                type="number"
                min="0"
                step="1"
                value={form.watch("coinAmount")}
                onChange={(e) =>
                  form.setValue("coinAmount", parseInt(e.target.value) || 0)
                }
                placeholder="Enter coin amount"
              />
              {form.formState.errors.coinAmount && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.coinAmount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={form.watch("description") || ""}
                onChange={(e) => form.setValue("description", e.target.value)}
                placeholder="Enter a description for this fee"
                rows={3}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            {selectedFee && (
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active Status</Label>
                <Switch
                  id="isActive"
                  checked={form.watch("isActive")}
                  onCheckedChange={(checked) =>
                    form.setValue("isActive", checked)
                  }
                />
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsFormOpen(false);
                  setSelectedFee(null);
                  form.reset();
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
                className="w-full sm:w-auto"
              >
                {(isCreating || isUpdating) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {selectedFee ? "Update Fee" : "Create Fee"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="w-[95vw] max-w-lg p-4 sm:p-6">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the platform fee{" "}
              <span className="font-medium">
                {feeToDelete && getDisplayName(feeToDelete)}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-3">
            <AlertDialogCancel className="w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
