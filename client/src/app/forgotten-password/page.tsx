"use client";

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
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateEmail = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email address";
    return newErrors;
  };

  const validateOTP = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.otp.trim()) newErrors.otp = "OTP is required";
    if (formData.otp.length !== 6) newErrors.otp = "OTP must be 6 digits";
    return newErrors;
  };

  const validateReset = () => {
    const newErrors: Record<string, string> = {};
    if (formData.newPassword.length < 6)
      newErrors.newPassword = "Password must be at least 6 characters";
    if (formData.newPassword !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateEmail();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setStep("otp");
    setSuccessMessage("Check your email for the OTP");
  };

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateOTP();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setStep("reset");
    setSuccessMessage("");
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateReset();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSuccessMessage("Password has been reset successfully!");
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm font-medium group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Sign In
            </Link>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Reset Password
              </h1>
              <p className="text-muted-foreground">
                {step === "email"
                  ? "Enter your email address to receive an OTP"
                  : step === "otp"
                    ? "Enter the 6-digit code sent to your email"
                    : "Create a strong new password for your account"}
              </p>
            </div>

            {successMessage && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                {successMessage}
              </div>
            )}

            {/* Email Step */}
            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className={`w-full px-4 py-3 bg-muted/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                      errors.email ? "border-red-500" : "border-border"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-2 font-medium">
                      {errors.email}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full py-6 text-base font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                >
                  Send Verification Code
                </Button>
              </form>
            )}

            {/* OTP Step */}
            {step === "otp" && (
              <form onSubmit={handleOTPSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="000000"
                    maxLength={6}
                    className={`w-full px-4 py-3 bg-muted/50 border rounded-xl text-center text-2xl tracking-[1em] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                      errors.otp ? "border-red-500" : "border-border"
                    }`}
                  />
                  {errors.otp && (
                    <p className="text-red-500 text-xs mt-2 font-medium">
                      {errors.otp}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full py-6 text-base font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                >
                  Verify Code
                </Button>
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="w-full text-sm text-muted-foreground hover:text-primary font-medium transition-colors py-2"
                >
                  Resend code or use a different email
                </button>
              </form>
            )}

            {/* Reset Step */}
            {step === "reset" && (
              <form onSubmit={handleResetSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                      New Password
                    </label>
                    <PasswordInput
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 bg-muted/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                        errors.newPassword ? "border-red-500" : "border-border"
                      }`}
                    />
                    {errors.newPassword && (
                      <p className="text-red-500 text-xs mt-2 font-medium">
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                      Confirm New Password
                    </label>
                    <PasswordInput
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 bg-muted/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-border"
                      }`}
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-2 font-medium">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full py-6 text-base font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                >
                  Update Password
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Chat />
    </div>
  );
}
