"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Edit,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Upload,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Pencil,
  Coins,
  MapPin,
  Home,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Phone,
  Mail,
  Copy,
  Check,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import {
  useGetMyKYCStatusQuery,
  useSubmitKYCMutation,
  type DocumentType,
} from "@/store/apis/kycApi";
import {
  useGetMyAccessesQuery,
  type ContactAccess,
} from "@/store/apis/accessApi";
import { useInitiateChapaMutation } from "@/store/apis/paymentApi";
import { toast } from "sonner";
import { useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";

function BuyCoinsModal({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const [coinsRequested, setCoinsRequested] = useState(100);
  const [initiateChapa, { isLoading }] = useInitiateChapaMutation();

  const packages = [
    { coins: 50, label: t("contact.starter") },
    { coins: 100, label: t("contact.basic") },
    { coins: 250, label: t("contact.popular") },
    { coins: 500, label: t("contact.pro") },
  ];

  const COIN_PRICE_IN_BIRR = 1;
  const totalBirr = coinsRequested * COIN_PRICE_IN_BIRR;

  const handleBuy = async () => {
    if (coinsRequested < 1) {
      toast.error(t("contact.validCoinAmount"));
      return;
    }
    try {
      const result = await initiateChapa({ coinsRequested }).unwrap();
      if (result.data?.checkout_url) {
        window.location.href = result.data.checkout_url;
      }
    } catch (err: any) {
      toast.error(err?.data?.message ?? t("contact.paymentInitFailed"));
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
              <h2 className="font-bold text-lg">{t("contact.buyCoins")}</h2>
              <p className="text-xs text-muted-foreground">
                {t("contact.paidViaChapa")}
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
            {t("contact.customAmount")}
          </label>
          <input
            type="number"
            min={1}
            value={coinsRequested}
            onChange={(e) =>
              setCoinsRequested(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary/10 outline-none transition-all"
            placeholder={t("contact.enterCoinAmount")}
          />
        </div>

        <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {t("contact.youPay")}
            </p>
            <p className="text-2xl font-extrabold text-foreground">
              {totalBirr.toLocaleString()}{" "}
              <span className="text-sm font-bold text-muted-foreground">
                {t("common.etb")}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {t("contact.youGet")}
            </p>
            <p className="text-2xl font-extrabold text-primary">
              {coinsRequested.toLocaleString()}{" "}
              <span className="text-sm font-bold">{t("common.coins")}</span>
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
              {t("contact.redirecting")}
            </>
          ) : (
            <>
              <Coins className="h-4 w-4" />
              {t("contact.proceedToPayment")}
            </>
          )}
        </Button>

        <p className="text-center text-[10px] text-muted-foreground">
          {t("contact.poweredByChapa")}
        </p>
      </div>
    </div>
  );
}

function KYCStatusBanner({
  status,
  reason,
}: {
  status: "pending" | "approved" | "rejected" | null;
  reason?: string;
}) {
  const { t } = useLanguage();
  if (status === "approved") {
    return (
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-bold text-sm">{t("profile.identityVerified")}</p>
          <p className="text-xs mt-0.5 opacity-80">
            {t("profile.kycApproved")}
          </p>
        </div>
      </div>
    );
  }
  if (status === "pending") {
    return (
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
        <Clock className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-bold text-sm">{t("profile.kycUnderReview")}</p>
          <p className="text-xs mt-0.5 opacity-80">
            {t("profile.kycUnderReviewDesc")}
          </p>
        </div>
      </div>
    );
  }
  if (status === "rejected") {
    return (
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400">
        <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-bold text-sm">{t("profile.kycRejected")}</p>
          <p className="text-xs mt-0.5 opacity-80">
            {t("profile.reason")} {reason || t("profile.defaultRejection")}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400">
      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-bold text-sm">{t("profile.kycNotSubmitted")}</p>
        <p className="text-xs mt-0.5 opacity-80">
          {t("profile.kycNotSubmittedDesc")}
        </p>
      </div>
    </div>
  );
}

function ImageUploadField({
  label,
  file,
  existingUrl,
  onChange,
  onClear,
}: {
  label: string;
  file: File | null;
  existingUrl?: string;
  onChange: (f: File) => void;
  onClear: () => void;
}) {
  const previewSrc = file ? URL.createObjectURL(file) : (existingUrl ?? null);

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
        {label}
      </label>
      {previewSrc ? (
        <div className="relative rounded-2xl overflow-hidden border border-border aspect-video group">
          <img
            src={previewSrc}
            alt={label}
            className="w-full h-full object-cover"
          />
          <label className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) onChange(e.target.files[0]);
              }}
            />
            <Upload className="h-5 w-5 text-white" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">
              Replace
            </span>
          </label>
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border aspect-video hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) onChange(e.target.files[0]);
            }}
          />
          <Upload className="h-6 w-6 text-muted-foreground" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Upload {label}
          </span>
        </label>
      )}
    </div>
  );
}

function KYCSection() {
  const { data: kycData, isLoading } = useGetMyKYCStatusQuery();
  const [submitKYC, { isLoading: isSubmitting }] = useSubmitKYCMutation();

  const kyc = kycData?.data;
  const alreadySubmitted = kyc?.kycSubmitted ?? false;
  const currentStatus = kyc?.status ?? null;

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [documentType, setDocumentType] = useState<DocumentType>(
    kyc?.documentType ?? "national_id",
  );
  const [documentNumber, setDocumentNumber] = useState("");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);

  useEffect(() => {
    if (kyc?.documentType) setDocumentType(kyc.documentType);
  }, [kyc?.documentType]);

  const inputStyle =
    "w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary/10 outline-none transition-all";
  const labelStyle =
    "text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontImage) {
      toast.error("Please upload the front side image.");
      return;
    }
    if (!documentNumber.trim()) {
      toast.error("Document number is required.");
      return;
    }
    try {
      await submitKYC({
        documentType,
        documentNumber: documentNumber.trim(),
        frontSideImage: frontImage,
        ...(backImage ? { backSideImage: backImage } : {}),
      }).unwrap();
      toast.success(
        isEditing ? "KYC updated successfully!" : "KYC submitted successfully!",
      );
      setShowForm(false);
      setIsEditing(false);
      setDocumentNumber("");
      setFrontImage(null);
      setBackImage(null);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to submit KYC.");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowForm(true);
    setDocumentNumber("");
    setFrontImage(null);
    setBackImage(null);
  };
  const handleCancel = () => {
    setShowForm(false);
    setIsEditing(false);
    setDocumentNumber("");
    setFrontImage(null);
    setBackImage(null);
  };

  if (isLoading) {
    return (
      <div className="py-10 text-center text-muted-foreground text-sm animate-pulse">
        Loading KYC status…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <KYCStatusBanner status={currentStatus} reason={kyc?.reason} />

      {alreadySubmitted && !showForm && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Document Type
            </p>
            <p className="font-semibold capitalize">
              {kyc?.documentType?.replace(/_/g, " ") ?? "—"}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Submitted At
            </p>
            <p className="font-semibold">
              {kyc?.submittedAt
                ? new Date(kyc.submittedAt).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </div>
      )}

      {!showForm && (
        <div className="flex flex-col sm:flex-row gap-3">
          {!alreadySubmitted && (
            <Button
              onClick={() => setShowForm(true)}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-xs gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              Submit KYC
            </Button>
          )}
          {currentStatus === "rejected" && (
            <Button
              onClick={() => setShowForm(true)}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-xs gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              Resubmit KYC
            </Button>
          )}
          {currentStatus === "pending" && (
            <Button
              onClick={handleEdit}
              variant="outline"
              className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs gap-2"
            >
              <Pencil className="h-4 w-4" />
              Edit Submission
            </Button>
          )}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-card border border-border rounded-3xl p-6 animate-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">
              {isEditing ? "Edit KYC Submission" : "Identity Documents"}
            </h3>
            <button
              type="button"
              onClick={handleCancel}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {isEditing && currentStatus === "pending" && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
              <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                Your KYC is currently under review. Editing will resubmit it for
                review again.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className={labelStyle}>Document Type</label>
            <select
              className={inputStyle}
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
            >
              <option value="national_id">National ID</option>
              <option value="passport">Passport</option>
              <option value="driving_license">Driving License</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className={labelStyle}>Document Number</label>
            <input
              type="text"
              className={inputStyle}
              placeholder={
                isEditing ? "Enter updated document number" : "e.g. ET-1234567"
              }
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ImageUploadField
              label="Front Side"
              file={frontImage}
              onChange={setFrontImage}
              onClear={() => setFrontImage(null)}
            />
            <ImageUploadField
              label="Back Side"
              file={backImage}
              onChange={setBackImage}
              onClear={() => setBackImage(null)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-xs gap-2 disabled:opacity-60"
            >
              <ShieldCheck className="h-4 w-4" />
              {isSubmitting
                ? "Submitting…"
                : isEditing
                  ? "Update & Resubmit"
                  : "Submit for Review"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function getListingDetailPath(listingType: string, id: string): string {
  const type = listingType?.toLowerCase();
  if (type === "house") return `/house-listings/${id}`;
  if (type === "car") return `/car-listings/${id}`;
  if (type === "service") return `/service-listings/${id}`;
  return `/listings/${id}`;
}

function CopyContactButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-muted transition-colors"
      title="Copy"
    >
      {copied ? (
        <Check className="h-3 w-3 text-emerald-500" />
      ) : (
        <Copy className="h-3 w-3 text-muted-foreground" />
      )}
    </button>
  );
}

function MyListingsTab() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isFetching, isError } = useGetMyAccessesQuery({
    page,
    limit,
  });

  const accesses = data?.data?.accesses ?? [];
  const pagination = data?.data?.pagination;
  const totalPages = pagination?.pages ?? 1;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading your listings…</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12 text-center">
        <XCircle className="h-10 w-10 text-destructive mx-auto mb-3 opacity-60" />
        <p className="text-muted-foreground text-sm">
          Failed to load your listings. Please try again.
        </p>
      </div>
    );
  }

  if (accesses.length === 0) {
    return (
      <div className="py-12 text-center px-4">
        <Home className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
        <p className="text-muted-foreground font-medium">
          You haven't unlocked any listings yet
        </p>
        <p className="text-sm text-muted-foreground mt-1 opacity-70">
          Browse listings and unlock contact details to see them here.
        </p>
        <Link href="/listings">
          <Button className="mt-4 gap-2">
            <Home className="h-4 w-4" />
            Browse Listings
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-border">
              {[
                "Listing",
                "Price",
                "Location",
                "Owner Contact",
                "Coins Paid",
                "Date",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left py-3 px-4 font-semibold text-foreground whitespace-nowrap text-sm"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {accesses.map((access) => (
              <ListingRow key={access.id} access={access} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden space-y-3">
        {accesses.map((access) => (
          <ListingCard key={access.id} access={access} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} · {pagination?.total ?? 0} total
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isFetching}
              className="h-8 w-8 p-0 rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isFetching}
              className="h-8 w-8 p-0 rounded-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ListingRow({ access }: { access: ContactAccess }) {
  const { listing } = access;
  const coverImage = listing.images?.[0];
  const detailPath = getListingDetailPath(listing.listingType, listing.id);

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      <td className="py-4 px-4">
        <Link href={detailPath} className="flex items-center gap-3 group">
          {coverImage ? (
            <img
              src={coverImage}
              alt={listing.title}
              className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-border"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Home className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div>
            <p className="font-medium text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {listing.title}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
              {listing.listingType}
            </p>
          </div>
        </Link>
      </td>
      <td className="py-4 px-4 text-foreground font-semibold text-sm whitespace-nowrap">
        {listing.price.toLocaleString()} ETB
      </td>
      <td className="py-4 px-4 text-sm whitespace-nowrap">
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span>
            {typeof listing.location === "string"
              ? listing.location.split(",")[0]
              : ((listing.location as any)?.placeName ??
                (listing.location as any)?.subCity ??
                (listing.location as any)?.city)}
          </span>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
            <Phone className="h-3 w-3 text-primary flex-shrink-0" />
            <span>{listing.owner.phone}</span>
            <CopyContactButton value={listing.owner.phone} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3 w-3 flex-shrink-0" />
            <span className="truncate max-w-[120px]">
              {listing.owner.email}
            </span>
            <CopyContactButton value={listing.owner.email} />
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
          <Coins className="h-3 w-3" />
          {access.coinsPaid}
        </span>
      </td>
      <td className="py-4 px-4 text-muted-foreground text-sm whitespace-nowrap">
        {new Date(access.createdAt).toLocaleDateString()}
      </td>
      <td className="py-4 px-4">
        <Link href={`/chat?listingId=${listing.id}`}>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-lg text-xs font-bold uppercase tracking-widest whitespace-nowrap"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Chat
          </Button>
        </Link>
      </td>
    </tr>
  );
}

function ListingCard({ access }: { access: ContactAccess }) {
  const { listing } = access;
  const coverImage = listing.images?.[0];
  const detailPath = getListingDetailPath(listing.listingType, listing.id);

  return (
    <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
      <Link href={detailPath} className="flex items-center gap-3 group">
        {coverImage ? (
          <img
            src={coverImage}
            alt={listing.title}
            className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-border"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
            <Home className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {listing.title}
          </p>
          <div className="flex items-center gap-1 mt-0.5 text-muted-foreground text-xs">
            <MapPin className="h-3 w-3" />
            <span>
              {typeof listing.location === "string"
                ? listing.location.split(",")[0]
                : ((listing.location as any)?.placeName ??
                  (listing.location as any)?.subCity ??
                  (listing.location as any)?.city)}
            </span>
          </div>
          <p className="font-bold text-primary text-sm mt-1">
            {listing.price.toLocaleString()} ETB
          </p>
        </div>
      </Link>

      <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          Unlocked Contact
        </p>
        <div className="flex items-center gap-1.5 text-sm text-foreground font-medium">
          <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="flex-1">{listing.owner.phone}</span>
          <CopyContactButton value={listing.owner.phone} />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="flex-1 truncate">{listing.owner.email}</span>
          <CopyContactButton value={listing.owner.email} />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary font-bold">
          <Coins className="h-3 w-3" />
          {access.coinsPaid} coins paid
        </span>
        <span>{new Date(access.createdAt).toLocaleDateString()}</span>
        <Link href={`/chat?listingId=${listing.id}`}>
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 rounded-lg text-xs font-bold uppercase tracking-widest"
          >
            <MessageCircle className="h-3 w-3" />
            Chat
          </Button>
        </Link>
      </div>
    </div>
  );
}

type ProfileTab = "listings" | "kyc";

export default function ProfilePage() {
  const { t } = useLanguage();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const isKYCVerified = currentUser?.isKYCVerified ?? false;
  const [activeTab, setActiveTab] = useState<ProfileTab>("listings");
  const [showBuyCoins, setShowBuyCoins] = useState(false);

  const user = {
    name:
      `${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim() ||
      "—",
    email: currentUser?.email ?? "—",
    joinedAt: currentUser?.createdAt
      ? new Date(currentUser.createdAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "—",
    coins: currentUser?.coins ?? 0,
  };

  return (
    <>
      {showBuyCoins && <BuyCoinsModal onClose={() => setShowBuyCoins(false)} />}

      <main className="min-h-screen bg-background py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-1 sm:mb-2">
                {t("profile.myProfile")}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground">
                {t("profile.manageAccount")}
              </p>
            </div>
            <Link href="/settings">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 w-full sm:w-auto"
              >
                <Edit className="h-4 w-4" />
                {t("profile.editProfile")}
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="lg:col-span-1">
              <Card className="bg-card border-border lg:sticky lg:top-24">
                <CardHeader>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-primary/50 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                    {user.name.charAt(0)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 sm:space-y-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      {t("profile.name")}
                    </p>
                    <p className="text-base sm:text-lg font-semibold text-foreground mt-1">
                      {user.name}
                    </p>
                  </div>
                  <div className="border-t border-border pt-5 sm:pt-6">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      {t("profile.email")}
                    </p>
                    <p className="text-sm font-semibold text-foreground break-all mt-1">
                      {user.email}
                    </p>
                  </div>
                  <div className="border-t border-border pt-5 sm:pt-6">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      {t("profile.memberSince")}
                    </p>
                    <p className="text-sm font-semibold text-foreground mt-1">
                      {user.joinedAt}
                    </p>
                  </div>

                  <div className="border-t border-border pt-5 sm:pt-6">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      {t("profile.identity")}
                    </p>
                    {isKYCVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold uppercase tracking-widest">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {t("profile.verified")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold uppercase tracking-widest">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        {t("profile.unverified")}
                      </span>
                    )}
                  </div>

                  <div className="border-t border-border pt-5 sm:pt-6 bg-primary/5 -mx-6 px-6 py-5 sm:py-6 rounded-b-lg space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Available Coins
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold text-primary mt-2">
                        {user.coins.toLocaleString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowBuyCoins(true)}
                      className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-xs gap-2"
                    >
                      <Coins className="h-3.5 w-3.5" />
                      Buy Coins
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3 space-y-6">
              <div className="flex bg-muted/50 p-1 rounded-xl w-fit">
                <button
                  onClick={() => setActiveTab("listings")}
                  className={`px-4 sm:px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === "listings"
                      ? "bg-card text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  My Listings
                </button>
                {!isKYCVerified && (
                  <button
                    onClick={() => setActiveTab("kyc")}
                    className={`px-4 sm:px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                      activeTab === "kyc"
                        ? "bg-card text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                    KYC
                  </button>
                )}
              </div>

              {activeTab === "listings" && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl">
                      My Unlocked Listings
                    </CardTitle>
                    <CardDescription>
                      Listings whose contact details you have unlocked
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 sm:p-6">
                    <MyListingsTab />
                  </CardContent>
                </Card>
              )}

              {activeTab === "kyc" && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl">
                      Identity Verification
                    </CardTitle>
                    <CardDescription>
                      Submit a government-issued ID to unlock listing creation
                      on the platform.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <KYCSection />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
