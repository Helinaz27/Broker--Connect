"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useVerifyChapaQuery } from "@/store/apis/paymentApi";
import {
  CheckCircle2,
  XCircle,
  Coins,
  Receipt,
  Clock,
  ArrowLeft,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-ET", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateStr));
}

function formatBirr(amount: number) {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  const tx_ref = searchParams.get("tx_ref");

  useEffect(() => {
    if (!tx_ref) router.replace("/");
  }, [tx_ref]);

  const { data, isLoading, isError, error } = useVerifyChapaQuery(tx_ref!, {
    skip: !tx_ref,
  });

  const payment = data?.data?.payment;
  const isSuccess = payment?.status === "success";
  const isFailed = payment?.status === "failed" || isError;

  if (!tx_ref) return null;

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(var(--primary)/0.08), transparent 70%), hsl(var(--background))",
      }}
    >
      <div className="w-full max-w-md">
        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center gap-6 py-20">
            <div className="relative">
              <div
                className="h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin"
                style={{ animationDuration: "0.9s" }}
              />
              <Coins className="absolute inset-0 m-auto h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground text-lg">
                {t("pages.paymentVerifying")}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                {t("pages.paymentVerifyingDesc")}
              </p>
            </div>
          </div>
        )}

        {/* Success */}
        {!isLoading && isSuccess && payment && (
          <div
            className="rounded-2xl border border-border bg-card overflow-hidden"
            style={{
              boxShadow:
                "0 0 0 1px hsl(var(--border)), 0 24px 64px -12px rgba(0,0,0,0.18)",
              animation: "slideUp 0.45s cubic-bezier(.34,1.56,.64,1) forwards",
            }}
          >
            {/* Green header strip */}
            <div
              className="px-8 pt-10 pb-8 flex flex-col items-center text-center"
              style={{
                background:
                  "linear-gradient(160deg, hsl(142 72% 29% / 0.12), transparent 60%)",
                borderBottom: "1px solid hsl(var(--border))",
              }}
            >
              <div className="relative mb-5">
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "hsl(142 72% 42% / 0.15)",
                    transform: "scale(1.6)",
                  }}
                />
                <CheckCircle2
                  className="relative h-16 w-16"
                  strokeWidth={1.5}
                  style={{ color: "hsl(142 72% 42%)" }}
                />
              </div>
              <h1
                className="text-2xl font-bold text-foreground"
                style={{ letterSpacing: "-0.02em" }}
              >
                {t("pages.paymentSuccess")}
              </h1>
              <p className="text-muted-foreground text-sm mt-2">
                {t("pages.paymentSuccessDesc")}
              </p>
            </div>

            {/* Details */}
            <div className="px-8 py-6 space-y-4">
              <DetailRow
                icon={<Coins className="h-4 w-4" />}
                label={t("pages.coinsReceived")}
                value={
                  <span
                    className="font-bold text-lg"
                    style={{ color: "hsl(142 72% 42%)" }}
                  >
                    +{payment.coinsReceived} {t("common.coins")}
                  </span>
                }
              />
              <DetailRow
                icon={<Receipt className="h-4 w-4" />}
                label={t("pages.amountPaid")}
                value={formatBirr(payment.amountBirr)}
              />
              <DetailRow
                icon={<Clock className="h-4 w-4" />}
                label={t("pages.completed")}
                value={
                  payment.completedAt
                    ? formatDate(payment.completedAt)
                    : formatDate(payment.createdAt)
                }
              />
              <div
                className="rounded-lg px-4 py-3 text-xs font-mono break-all"
                style={{
                  background: "hsl(var(--muted))",
                  color: "hsl(var(--muted-foreground))",
                }}
              >
                <span className="uppercase tracking-wider text-[10px] block mb-1 opacity-60">
                  {t("pages.transactionId")}
                </span>
                {payment.transactionId}
              </div>

              {data?.data?.currentCoinBalance !== undefined && (
                <div
                  className="rounded-xl px-5 py-4 flex items-center justify-between"
                  style={{ background: "hsl(var(--primary)/0.08)" }}
                >
                  <span className="text-sm text-muted-foreground font-medium">
                    {t("pages.newCoinBalance")}
                  </span>
                  <span className="text-xl font-bold text-foreground flex items-center gap-1.5">
                    <Coins className="h-5 w-5 text-primary" />
                    {data.data.currentCoinBalance}
                  </span>
                </div>
              )}
            </div>

            <div className="px-8 pb-8">
              <Link href="/" className="block">
                <Button className="w-full" size="lg">
                  {t("pages.returnHome")}
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Failure */}
        {!isLoading && isFailed && (
          <div
            className="rounded-2xl border border-border bg-card overflow-hidden"
            style={{
              boxShadow:
                "0 0 0 1px hsl(var(--border)), 0 24px 64px -12px rgba(0,0,0,0.18)",
              animation: "slideUp 0.45s cubic-bezier(.34,1.56,.64,1) forwards",
            }}
          >
            {/* Red header strip */}
            <div
              className="px-8 pt-10 pb-8 flex flex-col items-center text-center"
              style={{
                background:
                  "linear-gradient(160deg, hsl(0 72% 51% / 0.10), transparent 60%)",
                borderBottom: "1px solid hsl(var(--border))",
              }}
            >
              <div className="relative mb-5">
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "hsl(0 72% 51% / 0.15)",
                    transform: "scale(1.6)",
                  }}
                />
                <XCircle
                  className="relative h-16 w-16"
                  strokeWidth={1.5}
                  style={{ color: "hsl(0 72% 51%)" }}
                />
              </div>
              <h1
                className="text-2xl font-bold text-foreground"
                style={{ letterSpacing: "-0.02em" }}
              >
                {t("pages.paymentFailed")}
              </h1>
              <p className="text-muted-foreground text-sm mt-2">
                {t("pages.paymentFailedDesc")}
              </p>
            </div>

            {/* Details */}
            <div className="px-8 py-6 space-y-4">
              {payment && (
                <>
                  <DetailRow
                    icon={<Receipt className="h-4 w-4" />}
                    label={t("pages.amount")}
                    value={formatBirr(payment.amountBirr)}
                  />
                  <DetailRow
                    icon={<Coins className="h-4 w-4" />}
                    label={t("pages.coinsRequested")}
                    value={`${payment.coinsReceived} ${t("common.coins")}`}
                  />
                  <div
                    className="rounded-lg px-4 py-3 text-xs font-mono break-all"
                    style={{
                      background: "hsl(var(--muted))",
                      color: "hsl(var(--muted-foreground))",
                    }}
                  >
                    <span className="uppercase tracking-wider text-[10px] block mb-1 opacity-60">
                      {t("pages.transactionId")}
                    </span>
                    {payment.transactionId}
                  </div>
                </>
              )}

              <div
                className="rounded-xl px-5 py-4 text-sm"
                style={{
                  background: "hsl(0 72% 51% / 0.08)",
                  color: "hsl(0 60% 40%)",
                }}
              >
                {isError
                  ? t("pages.paymentVerifyError")
                  : t("pages.paymentNotCompleted")}
              </div>
            </div>

            <div className="px-8 pb-8 flex flex-col gap-3">
              <Link href="/buy-coins">
                <Button className="w-full" size="lg">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("pages.tryAgainPayment")}
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full" size="lg">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("pages.returnHome")}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97) }
          to   { opacity: 1; transform: translateY(0)    scale(1)    }
        }
      `}</style>
    </main>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
