"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Mail,
  Lock,
  Coins,
  LogIn,
  Copy,
  Check,
  MessageCircle,
  X,
  Loader2,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useAccessContactMutation } from "@/store/apis/accessApi";
import { useInitiateChapaMutation } from "@/store/apis/paymentApi";
import { toast } from "sonner";
import { useChatWidget } from "@/components/chat/ChatWidget";
import { useLanguage } from "@/i18n/LanguageProvider";

interface Props {
  listingId: string;
  listingTitle: string;
  coinCost: number;
  hasContactAccess: boolean;
  ownerPhone?: string;
  ownerId?: string;
  ownerEmail?: string;
  isAuthenticated: boolean;
}

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

function CopyButton({ value }: { value: string }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(t("common.copiedToClipboard"));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-auto p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
      title={t("common.copy")}
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-500" />
      ) : (
        <Copy className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );
}

export default function ContactSection({
  listingId,
  listingTitle,
  coinCost,
  hasContactAccess,
  ownerPhone,
  ownerId,
  ownerEmail,
  isAuthenticated,
}: Props) {
  const { t } = useLanguage();
  const router = useRouter();
  const currentUser = useSelector((s: RootState) => s.user.currentUser);
  const [accessContact, { isLoading }] = useAccessContactMutation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showBuyCoins, setShowBuyCoins] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localAccess, setLocalAccess] = useState(hasContactAccess);
  const [localPhone, setLocalPhone] = useState(ownerPhone);
  const [localEmail, setLocalEmail] = useState(ownerEmail);

  const { openChat } = useChatWidget();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-3">
        {showBuyCoins && (
          <BuyCoinsModal onClose={() => setShowBuyCoins(false)} />
        )}
        <p className="text-sm text-muted-foreground">
          {t("contact.loginToUnlock")}
        </p>
        <Button
          onClick={() => router.push("/login")}
          className="h-14 px-10 rounded-2xl bg-primary text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
        >
          <LogIn className="h-4 w-4 mr-2" />
          {t("contact.loginToContact")}
        </Button>
      </div>
    );
  }

  if (localAccess && localPhone && localEmail) {
    return (
      <div className="flex flex-col gap-3">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
          {t("contact.agentContact")}
        </h3>
        <div className="flex items-center gap-3 h-14 px-6 rounded-2xl border border-border bg-muted/40 font-semibold text-foreground">
          <Phone className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="flex-1">{localPhone}</span>
          <CopyButton value={localPhone} />
        </div>
        <div className="flex items-center gap-3 h-14 px-6 rounded-2xl border border-border bg-muted/40 font-semibold text-foreground">
          <Mail className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="flex-1 truncate">{localEmail}</span>
          <CopyButton value={localEmail} />
        </div>
        {currentUser?.id !== ownerId && (
          <Button
            onClick={() => openChat({ listingId, otherUserId: ownerId ?? "" })}
            variant="outline"
            className="h-12 rounded-2xl font-bold uppercase tracking-widest text-xs gap-2 border-primary/30 text-primary hover:bg-primary/5"
          >
            <MessageCircle className="h-4 w-4" />
            {t("contact.chatWithAgent")}
          </Button>
        )}
      </div>
    );
  }

  const userCoins = currentUser?.coins ?? 0;
  const canAfford = userCoins >= coinCost;

  const handleUnlock = async () => {
    setError(null);
    try {
      await accessContact({ listingId }).unwrap();
      window.location.reload();
    } catch (err: any) {
      setError(err?.data?.message ?? t("common.somethingWentWrong"));
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <Lock className="h-5 w-5 text-primary" />
          <div>
            <p className="font-bold text-foreground text-sm">
              {t("contact.unlockContact")}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("contact.unlockDeductText", {
                coins: coinCost,
                balance: userCoins,
              })}
            </p>
          </div>
        </div>
        {error && (
          <p className="text-xs text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <Button
            onClick={handleUnlock}
            disabled={isLoading}
            className="flex-1 h-11 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-widest"
          >
            {isLoading ? t("contact.unlocking") : t("contact.confirmUnlock")}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowConfirm(false)}
            disabled={isLoading}
            className="flex-1 h-11 rounded-xl text-xs uppercase tracking-widest"
          >
            {t("common.cancel")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showBuyCoins && <BuyCoinsModal onClose={() => setShowBuyCoins(false)} />}
      <div className="flex flex-col gap-3">
        {!canAfford && (
          <p className="text-xs text-amber-600 bg-amber-500/10 px-3 py-2 rounded-lg">
            {t("contact.insufficientBalance", {
              needed: coinCost,
              have: userCoins,
            })}
          </p>
        )}
        {error && (
          <p className="text-xs text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}
        <Button
          onClick={() => canAfford && setShowConfirm(true)}
          disabled={!canAfford}
          className="h-14 px-10 rounded-2xl bg-primary text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Lock className="h-4 w-4 mr-2" />
          {t("contact.unlockContactCoins", { coins: coinCost })}
        </Button>
        {!canAfford && (
          <Button
            variant="outline"
            onClick={() => setShowBuyCoins(true)}
            className="h-11 px-6 rounded-2xl text-xs uppercase tracking-widest"
          >
            <Coins className="h-4 w-4 mr-2" />
            {t("contact.buyCoins")}
          </Button>
        )}
      </div>
    </>
  );
}
