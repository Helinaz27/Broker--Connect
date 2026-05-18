"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Chat from "@/components/Chat";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ForgottenPassword() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [formData, setFormData] = useState({ email: "", otp: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (step === "email") {
      if (!formData.email.trim()) errs.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = "Invalid email address";
    } else if (step === "otp") {
      if (!formData.otp.trim()) errs.otp = "OTP is required";
      else if (formData.otp.length !== 6) errs.otp = "OTP must be 6 digits";
    } else if (step === "reset") {
      if (formData.newPassword.length < 6) errs.newPassword = "Password must be at least 6 characters";
      if (formData.newPassword !== formData.confirmPassword) errs.confirmPassword = "Passwords do not match";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    if (step === "email") {
      setStep("otp");
      setSuccessMessage("Check your email for the OTP");
    } else if (step === "otp") {
      setStep("reset");
      setSuccessMessage("");
    } else {
      setSuccessMessage("Password has been reset successfully!");
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  const FormField = ({ label, name, type = "text", placeholder, extraClasses = "" }: any) => (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{label}</label>
      {type === "password" ? (
        <PasswordInput name={name} value={(formData as any)[name]} onChange={handleChange} placeholder={placeholder} className={`w-full px-4 py-3 bg-muted/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${errors[name] ? "border-red-500" : "border-border"}`} />
      ) : (
        <input type={type} name={name} value={(formData as any)[name]} onChange={handleChange} placeholder={placeholder} className={`w-full px-4 py-3 bg-muted/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${extraClasses} ${errors[name] ? "border-red-500" : "border-border"}`} maxLength={name === "otp" ? 6 : undefined} />
      )}
      {errors[name] && <p className="text-red-500 text-xs mt-2 font-medium">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
            <Link href="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm font-medium group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Sign In
            </Link>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Reset Password</h1>
              <p className="text-muted-foreground">
                {step === "email" ? "Enter your email address to receive an OTP" : step === "otp" ? "Enter the 6-digit code sent to your email" : "Create a strong new password for your account"}
              </p>
            </div>
            {successMessage && <div className="bg-green-500/10 border border-green-500/20 text-green-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium animate-in fade-in slide-in-from-top-2">{successMessage}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === "email" && <FormField label="Email Address" name="email" type="email" placeholder="name@example.com" />}
              {step === "otp" && <FormField label="Verification Code" name="otp" placeholder="000000" extraClasses="text-center text-2xl tracking-[1em] font-bold" />}
              {step === "reset" && (
                <div className="space-y-4">
                  <FormField label="New Password" name="newPassword" type="password" placeholder="••••••••" />
                  <FormField label="Confirm New Password" name="confirmPassword" type="password" placeholder="••••••••" />
                </div>
              )}
              <Button type="submit" className="w-full py-6 text-base font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                {step === "email" ? "Send Verification Code" : step === "otp" ? "Verify Code" : "Update Password"}
              </Button>
              {step === "otp" && <button type="button" onClick={() => setStep("email")} className="w-full text-sm text-muted-foreground hover:text-primary font-medium transition-colors py-2">Resend code or use a different email</button>}
            </form>
          </div>
        </div>
      </main>
      <Footer /><Chat />
    </div>
  );
}
