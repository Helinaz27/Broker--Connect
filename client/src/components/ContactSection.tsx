"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Lock, Coins, LogIn } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useAccessContactMutation } from "@/store/apis/accessApi";

interface Props {
  listingId: string;
  listingTitle: string;
  coinCost: number;
  hasContactAccess: boolean;
  ownerPhone?: string;
  ownerEmail?: string;
  isAuthenticated: boolean;
}

export default function ContactSection({
  listingId,
  listingTitle,
  coinCost,
  hasContactAccess,
  ownerPhone,
  ownerEmail,
  isAuthenticated,
}: Props) {
  const router = useRouter();
  const currentUser = useSelector((s: RootState) => s.user.currentUser);
  const [accessContact, { isLoading }] = useAccessContactMutation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localAccess, setLocalAccess] = useState(hasContactAccess);
  const [localPhone, setLocalPhone] = useState(ownerPhone);
  const [localEmail, setLocalEmail] = useState(ownerEmail);

  // guest
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Login to unlock the agent&apos;s contact details.
        </p>
        <Button
          onClick={() => router.push("/login")}
          className="h-14 px-10 rounded-2xl bg-primary text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
        >
          <LogIn className="h-4 w-4 mr-2" />
          Login to Contact Agent
        </Button>
      </div>
    );
  }

  // has access — show phone + email
  if (localAccess && localPhone && localEmail) {
    return (
      <div className="flex flex-col gap-3">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
          Agent Contact
        </h3>
        <a
          href={`tel:${localPhone}`}
          className="flex items-center gap-3 h-14 px-6 rounded-2xl border border-border bg-muted/40 hover:bg-muted transition-colors font-semibold text-foreground"
        >
          <Phone className="h-4 w-4 text-primary flex-shrink-0" />
          {localPhone}
        </a>
        <a
          href={`mailto:${localEmail}?subject=Inquiry: ${encodeURIComponent(listingTitle)}`}
          className="flex items-center gap-3 h-14 px-6 rounded-2xl border border-border bg-muted/40 hover:bg-muted transition-colors font-semibold text-foreground"
        >
          <Mail className="h-4 w-4 text-primary flex-shrink-0" />
          {localEmail}
        </a>
      </div>
    );
  }

  // logged in, no access — show unlock button or confirmation
  const userCoins = currentUser?.coins ?? 0;
  const canAfford = userCoins >= coinCost;

  const handleUnlock = async () => {
    setError(null);
    try {
      const res = await accessContact({ listingId }).unwrap();
      // After unlocking, refetch the listing to get phone/email
      // We reload the page so the server returns contact info now
      // (simpler than managing local state without owner data)
      window.location.reload();
    } catch (err: any) {
      setError(err?.data?.message ?? "Something went wrong. Please try again.");
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <Lock className="h-5 w-5 text-primary" />
          <div>
            <p className="font-bold text-foreground text-sm">Unlock Contact</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              This will deduct{" "}
              <span className="font-bold text-primary">{coinCost} coins</span>{" "}
              from your balance (you have{" "}
              <span className="font-semibold">{userCoins}</span>).
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
            {isLoading ? "Unlocking…" : "Confirm Unlock"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowConfirm(false)}
            disabled={isLoading}
            className="flex-1 h-11 rounded-xl text-xs uppercase tracking-widest"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {!canAfford && (
        <p className="text-xs text-amber-600 bg-amber-500/10 px-3 py-2 rounded-lg">
          You need {coinCost} coins but only have {userCoins}. Please top up
          your balance.
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
        Unlock Contact · {coinCost} coins
      </Button>
      {!canAfford && (
        <Button
          variant="outline"
          onClick={() => router.push("/buy-coins")}
          className="h-11 px-6 rounded-2xl text-xs uppercase tracking-widest"
        >
          <Coins className="h-4 w-4 mr-2" />
          Buy Coins
        </Button>
      )}
    </div>
  );
}
