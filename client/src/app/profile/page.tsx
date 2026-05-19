"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Edit, Lock, LogOut, Plus, ChevronRight, ShieldCheck, FileText, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { useState } from "react";
import { toast } from "sonner";

export default function Profile() {
  const [user] = useState({
    name: "Helina Zeleke",
    email: "helina.zeleke@example.com",
    phone: "+251912345678",
    coins: 5000,
    level: 1,
    joinedDate: "Jan 15, 2026",
    profileImage:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
  });

  const [isKycApproved, setIsKycApproved] = useState(false);
  const [showKycForm, setShowKycForm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const getLevelBadge = (level: number) => {
    const badges = {
      0: { label: "Level 0 - Basic", color: "bg-gray-100 text-gray-800" },
      1: { label: "Level 1 - Verified", color: "bg-blue-100 text-blue-800" },
      2: { label: "Level 2 - Premium", color: "bg-purple-100 text-purple-800" },
    };
    return badges[level as keyof typeof badges] || badges[0];
  };

  return (
    <div className="bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent_50%)]" />

      <main className="py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-5xl animate-fade-in">
          {/* Profile Header */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-8 md:p-12 mb-10 shadow-2xl shadow-black/5 overflow-hidden group">
            <div className="absolute top-0 right-0 h-64 w-64 bg-primary/5 blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-700" />

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Profile Info Card */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border sticky top-24">
              <CardHeader>
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/50 rounded-xl flex items-center justify-center text-3xl font-bold text-white mb-4">
                  {user.name.charAt(0)}
                </div>
<<<<<<< HEAD
                <div
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${badge.color} border-current/20`}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                  {badge.label}
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight italic">
                      {user.name}
                    </h1>
                    <p className="text-muted-foreground font-bold text-sm flex items-center gap-2 mt-1">
                      Member since{" "}
                      <span className="text-foreground">{user.joinedDate}</span>
                    </p>
                  </div>

                  {/* KYC Status - Next to Name at bottom */}
                  <div className="flex items-center gap-3">
                    {isKycApproved ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">KYC Approved</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setShowKycForm(true)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-600 hover:bg-amber-500/20 transition-all"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">KYC Pending • Verify Now</span>
                      </button>
                    )}
                  </div>
=======
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Name
                  </p>
                  <p className="text-lg font-semibold text-foreground mt-1">
                    {user.name}
                  </p>
>>>>>>> 6a0820c0e4f785c05fcb4d4d98e92dd4dd534aed
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-border/40">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      Contact Email
                    </p>
                    <p className="font-bold text-foreground/90">{user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      Mobile Link
                    </p>
                    <p className="font-bold text-foreground/90">{user.phone}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="rounded-2xl border-border/60 font-bold text-xs h-12 px-8 hover:bg-muted/50 transition-all"
                  asChild
                >
                  <Link href="/settings">Edit personal details</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* KYC Form Modal */}
          {showKycForm && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
              <div className="bg-card rounded-[2.5rem] max-w-lg w-full p-10 border border-border/50 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h2 className="text-3xl font-black text-foreground tracking-tight italic">
                    Identity Verification.
                  </h2>
                </div>
                
                <p className="text-muted-foreground font-medium mb-8">
                  To ensure a secure marketplace, we require identity verification for all professional brokers in Addis Ababa.
                </p>

                <div className="space-y-6 mb-10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      ID Document Type
                    </label>
                    <select className="w-full px-5 py-4 bg-muted/30 border border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium appearance-none">
                      <option>National ID Card</option>
                      <option>Passport</option>
                      <option>Driver's License</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Upload Document (Front & Back)
                    </label>
                    <div className="border-2 border-dashed border-border/60 rounded-2xl p-8 text-center hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group">
                      <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4 group-hover:text-primary group-hover:scale-110 transition-all" />
                      <p className="text-sm font-bold text-foreground">Drop files here or click to browse</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2">Max size: 5MB • JPG, PNG, PDF</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1 h-14 rounded-2xl font-bold border-border/60"
                    onClick={() => setShowKycForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 h-14 rounded-2xl font-black shadow-lg shadow-primary/20"
                    onClick={() => {
                      toast.success("Verification documents submitted. Our team will review them within 24 hours.");
                      setIsKycApproved(true);
                      setShowKycForm(false);
                    }}
                  >
                    Submit for Review
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Finance & Activity */}
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[2.5rem] p-10 md:col-span-2 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-48 w-48 bg-primary/20 blur-[80px] group-hover:bg-primary/30 transition-colors" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black italic tracking-tight">
                      Financial Balance
                    </h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                      Available Credits
                    </p>
                  </div>
                  <div className="h-14 w-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                    <Coins className="h-7 w-7 text-primary" />
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-6xl font-black tracking-tighter">
                    {user.coins.toLocaleString()}
                  </span>
                  <span className="text-xl font-bold text-slate-500 uppercase">
                    Birr
                  </span>
                </div>
                <p className="text-slate-400 text-sm font-medium mb-10 max-w-md">
                  1 Coin = 1 Birr. These credits enable premium listings and
                  direct broker connections.
                </p>

                <div className="mt-auto">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => {
                      const amount = prompt("Enter amount to recharge (ETB):", "1000");
                      if (amount) alert(`Redirecting to payment gateway for ${amount} Birr...`);
                    }}
                    className="h-14 px-10 rounded-2xl text-base font-black gap-3 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all bg-white text-slate-950 hover:bg-slate-100"
                  >
                    <Plus className="h-5 w-5" />
                    Recharge Balance
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-[2rem] p-8 shadow-sm group hover:border-primary/20 transition-all duration-500">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">
                  Market Presence
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-foreground tracking-tighter group-hover:text-primary transition-colors">
                    3
                  </p>
                  <p className="text-sm font-semibold text-foreground break-all mt-1">
                    {user.email}
                  </p>
                </div>
                <div className="border-t border-border pt-6">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Member Since
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-1">
                    {user.joinedAt}
                  </p>
                </div>
                <div className="border-t border-border pt-6 bg-primary/5 -mx-6 px-6 py-6 rounded-b-lg">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Available Coins
                  </p>
                  <p className="text-3xl font-bold text-primary mt-2">
                    {user.coins.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security & Activity Console */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <h2 className="text-2xl font-black text-foreground tracking-tight italic mb-8">
              Security Console.
            </h2>

            <div className="grid gap-4">
              {/* Reset Password */}
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="group w-full flex items-center justify-between p-6 bg-muted/20 border border-border/50 rounded-[1.5rem] hover:bg-muted/40 transition-all duration-300"
              >
                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 rounded-xl bg-card border border-border/50 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-foreground">Security Protocol</p>
                    <p className="text-xs text-muted-foreground font-medium mt-1">
                      Update your access credentials and session security
                    </p>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full border border-border/50 flex items-center justify-center group-hover:border-primary/40 group-hover:text-primary transition-all">
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>

              {/* Delete Account */}
              <button 
                onClick={() => {
                  if (confirm("Are you sure you want to PERMANENTLY delete your account? This action cannot be undone.")) {
                    alert("Account deletion request submitted.");
                  }
                }}
                className="group w-full flex items-center justify-between p-6 bg-destructive/5 border border-destructive/10 rounded-[1.5rem] hover:bg-destructive/10 transition-all duration-300"
              >
                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 rounded-xl bg-card border border-destructive/10 flex items-center justify-center text-destructive/60 group-hover:text-destructive transition-colors">
                    <LogOut className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-foreground">
                      Termination Zone
                    </p>
                    <p className="text-xs text-muted-foreground font-medium mt-1">
                      Permanently wipe your broker profile and all digital assets
                    </p>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full border border-destructive/20 flex items-center justify-center group-hover:bg-destructive group-hover:text-white transition-all">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>
            </div>
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
                onClick={() => setShowPasswordModal(false)}
              >
                Confirm Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      <Chat />
    </div>
  );
}
