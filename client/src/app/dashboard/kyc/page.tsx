// app/dashboard/kyc/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  Menu,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  FileText,
  Calendar,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import {
  useGetAllKYCQuery,
  useGetKYCByIdQuery,
  useApproveKYCMutation,
  useRejectKYCMutation,
  type KYCRequest,
} from "@/store/apis/kycApi";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useLanguage } from "@/i18n/LanguageProvider";

// ─── KYC Detail Panel ─────────────────────────────────────────────────────────

function KYCDetailContent({
  requestId,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: {
  requestId: string;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
}) {
  const { t } = useLanguage();
  const { data, isLoading, isError } = useGetKYCByIdQuery(requestId);
  const req = data?.data?.kycRequest;

  const statusLabel = (status: string) => {
    if (status === "approved") return t("dashboard.statusApproved");
    if (status === "rejected") return t("dashboard.statusRejected");
    if (status === "pending") return t("dashboard.statusPending");
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-60 gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading details...</span>
      </div>
    );
  }

  if (isError || !req) {
    return (
      <div className="flex items-center justify-center h-60 text-muted-foreground">
        Failed to load KYC details.
      </div>
    );
  }

  return (
    <div className="space-y-6 py-2">
      {/* Status */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Badge
          variant="outline"
          className={`${statusColors[req.status]} text-sm px-3 py-1`}
        >
          {statusLabel(req.status)}
        </Badge>
        <span className="text-xs text-muted-foreground">
          ID: <span className="font-mono">{req.id}</span>
        </span>
      </div>

      <Separator />

      {/* User Info */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {t("dashboard.userInformation")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoRow
            icon={<User className="h-4 w-4" />}
            label={t("dashboard.fullName")}
            value={
              req.user ? `${req.user.firstName} ${req.user.lastName}` : "—"
            }
          />
          <InfoRow
            icon={<Mail className="h-4 w-4" />}
            label={t("dashboard.tableEmail")}
            value={req.user?.email ?? "—"}
          />
          <InfoRow
            icon={<Phone className="h-4 w-4" />}
            label={t("dashboard.tablePhone")}
            value={req.user?.phone ?? "—"}
          />
          <InfoRow
            icon={<Calendar className="h-4 w-4" />}
            label={t("dashboard.submitted")}
            value={new Date(req.submittedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          />
        </div>
      </div>

      <Separator />

      {/* Document Info */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {t("dashboard.documentDetails")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoRow
            icon={<FileText className="h-4 w-4" />}
            label={t("dashboard.documentType")}
            value={req.documentType.replace(/_/g, " ")}
            className="capitalize"
          />
          <InfoRow
            icon={<FileText className="h-4 w-4" />}
            label={t("dashboard.documentNumber")}
            value={req.documentNumber}
            className="font-mono"
          />
        </div>
      </div>

      <Separator />

      {/* Document Images */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {t("dashboard.documentImages")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DocumentImage
            label={t("dashboard.frontSide")}
            src={req.frontSideImage}
          />
          {req.backSideImage && (
            <DocumentImage
              label={t("dashboard.backSide")}
              src={req.backSideImage}
            />
          )}
        </div>
      </div>

      {/* Rejection Reason */}
      {req.status === "rejected" && req.reason && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {t("dashboard.rejectionReason")}
            </h3>
            <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3 border border-red-100">
              {req.reason}
            </p>
          </div>
        </>
      )}

      {/* Approval Info */}
      {req.status === "approved" && req.approvedBy && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {t("dashboard.approvalInfo")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow
                icon={<User className="h-4 w-4" />}
                label={t("dashboard.approvedBy")}
                value={req.approvedBy.name}
              />
              {req.verifiedAt && (
                <InfoRow
                  icon={<Calendar className="h-4 w-4" />}
                  label={t("dashboard.approvedAt")}
                  value={new Date(req.verifiedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                />
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Actions ── */}
      <Separator />

      {/* PENDING: approve + reject */}
      {req.status === "pending" && (
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Button
            className="flex-1 gap-2"
            onClick={onApprove}
            disabled={isApproving || isRejecting}
          >
            {isApproving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {t("dashboard.approveKyc")}
          </Button>
          <Button
            variant="destructive"
            className="flex-1 gap-2"
            onClick={onReject}
            disabled={isApproving || isRejecting}
          >
            {isRejecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {t("dashboard.rejectKyc")}
          </Button>
        </div>
      )}

      {/* APPROVED: reject/revoke only */}
      {req.status === "approved" && (
        <div className="pt-1">
          <Button
            variant="destructive"
            className="w-full gap-2"
            onClick={onReject}
            disabled={isRejecting}
          >
            {isRejecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {t("dashboard.revokeRejectKycDetail")}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {t("dashboard.revokeStatusHint")}
          </p>
        </div>
      )}

      {/* REJECTED: approve only */}
      {req.status === "rejected" && (
        <div className="pt-1">
          <Button
            className="w-full gap-2"
            onClick={onApprove}
            disabled={isApproving}
          >
            {isApproving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {t("dashboard.approveKyc")}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {t("dashboard.approveStatusHint")}
          </p>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-muted-foreground shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-sm font-medium truncate ${className}`}>{value}</p>
      </div>
    </div>
  );
}

function DocumentImage({ label, src }: { label: string; src: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        <div className="relative rounded-lg border border-border overflow-hidden bg-muted aspect-video">
          <img
            src={src}
            alt={label}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
            <ExternalLink className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        </div>
      </a>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KYCPage() {
  const { t } = useLanguage();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const isAdmin = currentUser?.roles?.includes("admin") ?? false;
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [viewingId, setViewingId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<KYCRequest | null>(
    null,
  );
  const [reviewNote, setReviewNote] = useState("");
  const [reviewNoteError, setReviewNoteError] = useState("");

  const { data, isLoading, isError, refetch } = useGetAllKYCQuery(undefined, {
    skip: !isAdmin,
  });
  const [approveKYC, { isLoading: isApproving }] = useApproveKYCMutation();
  const [rejectKYC, { isLoading: isRejecting }] = useRejectKYCMutation();

  const kycRequests = data?.data?.kycRequests ?? [];

  const openApproveDialog = (req?: KYCRequest) => {
    if (req) setSelectedRequest(req);
    setApproveDialogOpen(true);
  };

  const openRejectDialog = (req?: KYCRequest) => {
    if (req) setSelectedRequest(req);
    setReviewNote("");
    setReviewNoteError("");
    setRejectDialogOpen(true);
  };

  const handleApprove = async () => {
    const id = selectedRequest?.id ?? viewingId;
    if (!id) return;
    try {
      await approveKYC(id).unwrap();
      toast.success(t("dashboard.kycApproved"));
      setApproveDialogOpen(false);
      setViewingId(null);
      setSelectedRequest(null);
    } catch {
      toast.error(t("dashboard.failedApproveKyc"));
    }
  };

  const handleReject = async () => {
    const id = selectedRequest?.id ?? viewingId;
    if (!id) return;
    if (!reviewNote.trim()) {
      setReviewNoteError(t("dashboard.reviewNoteRequiredForReject"));
      return;
    }
    try {
      await rejectKYC({
        requestId: id,
        reviewNote: reviewNote.trim(),
      }).unwrap();
      toast.success(t("dashboard.kycRejected"));
      setRejectDialogOpen(false);
      setViewingId(null);
      setSelectedRequest(null);
      setReviewNote("");
    } catch {
      toast.error(t("dashboard.failedRejectKyc"));
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  const detailOpen = !!viewingId;
  const detailContent = viewingId ? (
    <KYCDetailContent
      requestId={viewingId}
      onApprove={() => openApproveDialog()}
      onReject={() => openRejectDialog()}
      isApproving={isApproving}
      isRejecting={isRejecting}
    />
  ) : null;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in">
      {/* Mobile header */}
      <div className="md:hidden flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="font-bold text-lg">{t("dashboard.brokerConsole")}</h1>
      </div>

      {!isAdmin ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <ShieldCheck className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground font-medium text-center px-4">
            {t("dashboard.noPermission")}
          </p>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            {t("dashboard.goBackDashboard")}
          </Button>
        </div>
      ) : (
        <>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {t("dashboard.kycManagement")}
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              {t("dashboard.reviewKycSubtitle")}
            </p>
          </div>

          <Card className="bg-card border-border">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg">
                {t("dashboard.kycRequests")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-40 gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{t("dashboard.loadingKycRequests")}</span>
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground">
                  <p className="text-sm">{t("dashboard.failedLoadKycRequests")}</p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    {t("dashboard.retry")}
                  </Button>
                </div>
              ) : kycRequests.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                  {t("dashboard.noKycRequests")}
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <Table className="min-w-[640px]">
                    <TableHeader className="bg-muted/50">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold pl-4 sm:pl-6 whitespace-nowrap">
                          {t("dashboard.tableUser")}
                        </TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">
                          {t("dashboard.tableEmail")}
                        </TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">
                          {t("dashboard.document")}
                        </TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">
                          {t("dashboard.submitted")}
                        </TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">
                          {t("dashboard.status")}
                        </TableHead>
                        <TableHead className="font-semibold text-right pr-4 sm:pr-6 whitespace-nowrap">
                          {t("dashboard.actions")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kycRequests.map((req) => (
                        <TableRow key={req.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium pl-4 sm:pl-6 whitespace-nowrap">
                            {req.user
                              ? `${req.user.firstName} ${req.user.lastName}`
                              : "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {req.user?.email ?? "—"}
                          </TableCell>
                          <TableCell className="text-sm capitalize whitespace-nowrap">
                            {req.documentType.replace(/_/g, " ")}
                          </TableCell>
                          <TableCell className="text-sm whitespace-nowrap">
                            {new Date(req.submittedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${statusColors[req.status]} text-xs whitespace-nowrap`}
                            >
                              {req.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-4 sm:pr-6">
                            <div className="flex items-center justify-end gap-1">
                              {/* View */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setViewingId(req.id)}
                                title={t("dashboard.viewDetails")}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              {/* PENDING → approve + reject */}
                              {req.status === "pending" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => openApproveDialog(req)}
                                    title={t("dashboard.approve")}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => openRejectDialog(req)}
                                    title={t("dashboard.reject")}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}

                              {/* APPROVED → reject/revoke only */}
                              {req.status === "approved" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => openRejectDialog(req)}
                                  title={t("dashboard.revokeApprovalTitle")}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}

                              {/* REJECTED → approve only */}
                              {req.status === "rejected" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => openApproveDialog(req)}
                                  title={t("dashboard.approve")}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* View KYC — Sheet (mobile) */}
          {!isDesktop && (
            <Sheet
              open={detailOpen}
              onOpenChange={(open) => !open && setViewingId(null)}
            >
              <SheetContent
                side="bottom"
                className="h-[90vh] overflow-y-auto rounded-t-2xl px-4"
              >
                <SheetHeader className="mb-2">
                  <SheetTitle>{t("dashboard.kycRequestDetails")}</SheetTitle>
                </SheetHeader>
                {detailContent}
              </SheetContent>
            </Sheet>
          )}

          {/* View KYC — Dialog (desktop) */}
          {isDesktop && (
            <Dialog
              open={detailOpen}
              onOpenChange={(open) => !open && setViewingId(null)}
            >
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t("dashboard.kycRequestDetails")}</DialogTitle>
                  <DialogDescription>
                    {t("dashboard.reviewDocumentsDesc")}
                  </DialogDescription>
                </DialogHeader>
                {detailContent}
              </DialogContent>
            </Dialog>
          )}

          {/* Approve Confirm Dialog */}
          <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
            <DialogContent className="max-w-sm mx-4 sm:mx-auto">
              <DialogHeader>
                <DialogTitle>{t("dashboard.approveKycRequestTitle")}</DialogTitle>
                <DialogDescription>
                  {t("dashboard.approveKycRequestDesc")}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setApproveDialogOpen(false)}
                  disabled={isApproving}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  className="w-full sm:w-auto gap-2"
                  onClick={handleApprove}
                  disabled={isApproving}
                >
                  {isApproving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("dashboard.approve")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Reject / Revoke Dialog */}
          <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
            <DialogContent className="max-w-sm mx-4 sm:mx-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedRequest?.status === "approved"
                    ? t("dashboard.revokeRejectTitle")
                    : t("dashboard.rejectKycTitle")}
                </DialogTitle>
                <DialogDescription>
                  {selectedRequest?.status === "approved"
                    ? t("dashboard.revokeRejectApprovedDesc")
                    : t("dashboard.rejectKycDesc")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="reviewNote">
                  {t("dashboard.reviewNote")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="reviewNote"
                  placeholder={t("dashboard.reviewNotePlaceholder")}
                  value={reviewNote}
                  onChange={(e) => {
                    setReviewNote(e.target.value);
                    if (e.target.value.trim()) setReviewNoteError("");
                  }}
                  rows={4}
                  className={reviewNoteError ? "border-destructive" : ""}
                />
                {reviewNoteError && (
                  <p className="text-sm text-destructive">{reviewNoteError}</p>
                )}
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setRejectDialogOpen(false)}
                  disabled={isRejecting}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="destructive"
                  className="w-full sm:w-auto gap-2"
                  onClick={handleReject}
                  disabled={isRejecting}
                >
                  {isRejecting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {selectedRequest?.status === "approved"
                    ? t("dashboard.revoke")
                    : t("dashboard.reject")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
