"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowLeft, User, Bell, Lock, Shield, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";

export default function SettingsPage() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-2xl animate-fade-in">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-opacity mb-8"
          >
            <ArrowLeft className="h-3 w-3" /> Back to profile
          </Link>
          
          <div className="mb-10">
            <h1 className="text-4xl font-black text-foreground tracking-tight italic">
              Platform Settings.
            </h1>
            <p className="text-muted-foreground font-medium mt-2">Manage your broker account preferences and security protocols.</p>
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
                <p className="font-bold text-foreground">Profile Configuration</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  Update your professional name, email, and mobile link
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
                <p className="font-bold text-foreground">Security Protocol</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  Change your access password and session credentials
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            </button>

            <div className="flex items-center gap-5 p-6 rounded-[1.5rem] border border-border/50 bg-card/50 backdrop-blur-sm opacity-60">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Bell className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground">Notification Matrix</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  Coming soon: Configure real-time alert preferences
                </p>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded-md">Alpha</span>
            </div>

            <Link
              href="/privacy"
              className="group flex items-center gap-5 p-6 rounded-[1.5rem] border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-muted/50 hover:border-primary/20 transition-all duration-300 shadow-sm"
            >
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <Shield className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground">Data Privacy</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  Review our commitment to your data security
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
              Reset Access.
            </h2>

            <div className="space-y-6 mb-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Current Protocol
                </label>
                <PasswordInput
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-muted/30 border border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  New Protocol
                </label>
                <PasswordInput
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-muted/30 border border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Verify New Protocol
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
                Cancel
              </Button>
              <Button
                className="flex-1 h-14 rounded-2xl font-black shadow-lg shadow-primary/20"
                onClick={() => {
                  toast.success("Security credentials updated successfully.");
                  setShowPasswordModal(false);
                }}
              >
                Confirm Reset
              </Button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
