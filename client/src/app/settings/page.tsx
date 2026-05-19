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
import { ArrowLeft, User, Lock, ChevronRight, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";

export default function SettingsPage() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  return (
    <div className="py-12 md:py-20 relative z-10">
      <div className="container mx-auto px-4 max-w-2xl animate-fade-in">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-opacity mb-8"
        >
          <ArrowLeft className="h-3 w-3" /> Back to profile
        </Link>
        
        <div className="mb-10">
          <h1 className="text-4xl font-black text-foreground tracking-tight italic font-poppins">
            Platform Settings.
          </h1>
          <p className="text-muted-foreground font-medium mt-2 font-inter">Manage your broker account preferences and security.</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setShowEditProfileModal(true)}
            className="w-full text-left group flex items-center gap-5 p-6 rounded-[1.5rem] border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-muted/50 hover:border-primary/20 transition-all duration-300 shadow-sm"
          >
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground font-poppins">Edit Profile</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5 font-inter">
                Update your professional name, email, and mobile link
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          </button>

          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full text-left group flex items-center gap-5 p-6 rounded-[1.5rem] border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-muted/50 hover:border-primary/20 transition-all duration-300 shadow-sm"
          >
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <Lock className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground font-poppins">Password</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5 font-inter">
                Change your access password and account credentials
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-card rounded-[2.5rem] max-w-md w-full p-10 border border-border/50 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-3xl font-black text-foreground tracking-tight mb-8 italic font-poppins">
              Edit Profile.
            </h2>

            <div className="space-y-6 mb-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 font-poppins">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    defaultValue="Helina Tesfaye"
                    className="w-full pl-12 pr-5 py-4 bg-muted/30 border border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium font-inter"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 font-poppins">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    defaultValue="helina.t@brokerconnect.et"
                    className="w-full pl-12 pr-5 py-4 bg-muted/30 border border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium font-inter"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 font-poppins">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel"
                    defaultValue="+251 911 123 456"
                    className="w-full pl-12 pr-5 py-4 bg-muted/30 border border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium font-inter"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1 h-14 rounded-2xl font-bold border-border/60 font-inter"
                onClick={() => setShowEditProfileModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-14 rounded-2xl font-black shadow-lg shadow-primary/20 font-poppins"
                onClick={() => {
                  toast.success("Profile updated successfully.");
                  setShowEditProfileModal(false);
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-card rounded-[2.5rem] max-w-md w-full p-10 border border-border/50 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-3xl font-black text-foreground tracking-tight mb-8 italic font-poppins">
              Reset Access.
            </h2>

            <div className="space-y-6 mb-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 font-poppins">
                  Current Password
                </label>
                <PasswordInput
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-muted/30 border border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium font-inter"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 font-poppins">
                  New Password
                </label>
                <PasswordInput
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-muted/30 border border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium font-inter"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 font-poppins">
                  Verify New Password
                </label>
                <PasswordInput
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-muted/30 border border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium font-inter"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1 h-14 rounded-2xl font-bold border-border/60 font-inter"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-14 rounded-2xl font-black shadow-lg shadow-primary/20 font-poppins"
                onClick={() => {
                  toast.success("Account credentials updated successfully.");
                  setShowPasswordModal(false);
                }}
              >
                Confirm Reset
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
