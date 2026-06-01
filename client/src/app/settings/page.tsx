"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Lock,
  ChevronRight,
  Camera,
  Loader2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  useChangePasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/store/apis/userApi";

export default function SettingsPage() {
  const { t } = useLanguage();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    undefined,
  );
  const [profileImage, setProfileImage] = useState<string | undefined>(
    undefined,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profileData } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();

  useEffect(() => {
    if (profileData?.data?.user) {
      const u = profileData.data.user;
      setFirstName(u.firstName || "");
      setLastName(u.lastName || "");
      setPhone(u.phone || "");
      setEmail(u.email || "");
      setImagePreview(u.profileImage);
      setProfileImage(u.profileImage);
    }
  }, [profileData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setProfileImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({
        firstName,
        lastName,
        phone,
        ...(profileImage !== profileData?.data?.user?.profileImage && {
          profileImage,
        }),
      }).unwrap();
      toast.success("Profile updated successfully");
      setShowProfileModal(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update profile");
    }
  };

  const handleCloseProfileModal = () => {
    const u = profileData?.data?.user;
    if (u) {
      setFirstName(u.firstName || "");
      setLastName(u.lastName || "");
      setPhone(u.phone || "");
      setEmail(u.email || "");
      setImagePreview(u.profileImage);
      setProfileImage(u.profileImage);
    }
    setShowProfileModal(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      toast.success("Password changed successfully");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to change password");
    }
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-2xl animate-fade-in">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-opacity mb-8"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Profile
          </Link>

          <div className="mb-10">
            <h1 className="text-4xl font-black text-foreground tracking-tight italic">
              Settings
            </h1>
            <p className="text-muted-foreground font-medium mt-2">
              Manage your account preferences
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setShowProfileModal(true)}
              className="w-full text-left group flex items-center gap-5 p-6 rounded-[1.5rem] border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-muted/50 hover:border-primary/20 transition-all duration-300 shadow-sm"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground">Profile</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  Update your name, email, phone and profile picture
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
                <p className="font-bold text-foreground">Change Password</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  Update your account password
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            </button>
          </div>
        </div>
      </main>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-card rounded-[2.5rem] max-w-md w-full p-10 border border-border/50 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-black text-foreground tracking-tight mb-8 italic">
              Edit Profile
            </h2>

            {/* Avatar */}
            <div className="flex flex-col items-center gap-3 mb-8">
              <div
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="h-20 w-20 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center border-2 border-border/50">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-black text-primary">
                      {initials || "?"}
                    </span>
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-opacity"
              >
                Change Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            <div className="space-y-5 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3.5 bg-muted/30 border border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-foreground text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3.5 bg-muted/30 border border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-foreground text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-3.5 bg-muted/20 border border-border/40 rounded-2xl font-medium text-muted-foreground cursor-not-allowed opacity-60 text-sm"
                />
                <p className="text-[10px] text-muted-foreground ml-1">
                  Contact support to change your email
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3.5 bg-muted/30 border border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-foreground text-sm"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1 h-14 rounded-2xl font-bold border-border/60 font-inter"
                onClick={handleCloseProfileModal}
                disabled={isUpdatingProfile}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-14 rounded-2xl font-black shadow-lg shadow-primary/20 font-poppins"
                onClick={handleUpdateProfile}
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </span>
                ) : (
                  "Update Profile"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-card rounded-[2.5rem] max-w-md w-full p-10 border border-border/50 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-3xl font-black text-foreground tracking-tight mb-8 italic">
              Change Password
            </h2>

            <div className="space-y-6 mb-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Current Password
                </label>
                <PasswordInput
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-muted/30 border border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium font-inter"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  New Password
                </label>
                <PasswordInput
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-muted/30 border border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium font-inter"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Confirm New Password
                </label>
                <PasswordInput
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-muted/30 border border-border/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium font-inter"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1 h-14 rounded-2xl font-bold border-border/60 font-inter"
                onClick={handleClosePasswordModal}
                disabled={isChangingPassword}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-14 rounded-2xl font-black shadow-lg shadow-primary/20 font-poppins"
                onClick={handleChangePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? "Saving..." : "Update Password"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
