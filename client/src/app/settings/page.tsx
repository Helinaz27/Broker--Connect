"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Bell,
  Lock,
  Shield,
  ChevronRight,
} from "lucide-react";

import { useState } from "react";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function SettingsPage() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-2xl animate-fade-in">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-opacity mb-8"
          >
            <ArrowLeft className="h-3 w-3" /> {t("pages.settingsBackProfile")}
          </Link>

          <div className="mb-10">
            <h1 className="text-4xl font-black text-foreground tracking-tight italic">
              {t("pages.settingsTitle")}
            </h1>
            <p className="text-muted-foreground font-medium mt-2">
              {t("pages.settingsSubtitle")}
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/profile"
              className="group flex items-center gap-5 p-6 rounded-[1.5rem] border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-muted/50 hover:border-primary/20 transition-all duration-300 shadow-sm"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground">
                  {t("pages.profileConfig")}
                </p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  {t("pages.profileConfigDesc")}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            </Link>

            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full text-left group flex items-center gap-5 p-6 rounded-[1.5rem] border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-muted/50 hover:border-primary/20 transition-all duration-300 shadow-sm"
            >
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                <Lock className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground">
                  {t("pages.securityProtocol")}
                </p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  {t("pages.securityProtocolDesc")}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            </button>

            <div className="flex items-center gap-5 p-6 rounded-[1.5rem] border border-border/50 bg-card/50 backdrop-blur-sm opacity-60">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Bell className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground">
                  {t("pages.notificationMatrix")}
                </p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  {t("pages.notificationMatrixDesc")}
                </p>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded-md">
                {t("pages.alpha")}
              </span>
            </div>

            <Link
              href="/privacy"
              className="group flex items-center gap-5 p-6 rounded-[1.5rem] border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-muted/50 hover:border-primary/20 transition-all duration-300 shadow-sm"
            >
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <Shield className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground">
                  {t("pages.dataPrivacy")}
                </p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  {t("pages.dataPrivacyDesc")}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            </Link>
          </div>
        </div>
      </main>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-card rounded-[2.5rem] max-w-md w-full p-10 border border-border/50 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-3xl font-black text-foreground tracking-tight mb-8 italic">
              {t("pages.resetAccess")}
            </h2>

            <div className="space-y-6 mb-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  {t("pages.currentProtocol")}
                </label>
                <PasswordInput
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-muted/30 border border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  {t("pages.newProtocol")}
                </label>
                <PasswordInput
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-muted/30 border border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  {t("pages.verifyNewProtocol")}
                </label>
                <PasswordInput
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-muted/30 border border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1 h-14 rounded-2xl font-bold border-border/60"
                onClick={() => setShowPasswordModal(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                className="flex-1 h-14 rounded-2xl font-black shadow-lg shadow-primary/20"
                onClick={() => {
                  toast.success(t("pages.securityUpdated"));
                  setShowPasswordModal(false);
                }}
              >
                {t("pages.confirmReset")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
