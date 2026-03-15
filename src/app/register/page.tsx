"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Chat from "@/components/Chat";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import Link from "next/link";
import { useState } from "react";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email address";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.agreeToTerms)
      newErrors.agreeToTerms = "You must agree to the terms";

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Handle registration
    console.log("Register with:", formData);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.05),transparent_50%)]" />
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4 relative z-10">
        <div className="w-full max-w-2xl animate-fade-in">
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-10 shadow-2xl shadow-black/5">
            <div className="mb-10 text-center md:text-left">
              <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">Join Digital Broker</h1>
              <p className="text-muted-foreground font-medium">Create your account to list or find properties, vehicles, and services.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className={`w-full px-5 py-4 bg-muted/30 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium ${
                      errors.firstName ? "border-destructive" : "border-border/60"
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-destructive text-[11px] mt-1.5 font-bold ml-1">{errors.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className={`w-full px-5 py-4 bg-muted/30 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium ${
                      errors.lastName ? "border-destructive" : "border-border/60"
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-destructive text-[11px] mt-1.5 font-bold ml-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={`w-full px-5 py-4 bg-muted/30 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium ${
                      errors.email ? "border-destructive" : "border-border/60"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-destructive text-[11px] mt-1.5 font-bold ml-1">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+251 912 345 678"
                    className={`w-full px-5 py-4 bg-muted/30 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium ${
                      errors.phone ? "border-destructive" : "border-border/60"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-destructive text-[11px] mt-1.5 font-bold ml-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full px-5 py-4 bg-muted/30 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium ${
                      errors.password ? "border-destructive" : "border-border/60"
                    }`}
                  />
                  {errors.password && (
                    <p className="text-destructive text-[11px] mt-1.5 font-bold ml-1">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">
                    Confirm Password
                  </label>
                  <PasswordInput
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full px-5 py-4 bg-muted/30 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium ${
                      errors.confirmPassword ? "border-destructive" : "border-border/60"
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-destructive text-[11px] mt-1.5 font-bold ml-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start gap-4 p-6 bg-primary/5 rounded-3xl border border-primary/10">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="w-6 h-6 border-border/60 rounded-lg text-primary focus:ring-primary mt-0.5 cursor-pointer transition-all"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-muted-foreground leading-relaxed font-medium cursor-pointer select-none">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary font-medium hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary font-medium hover:underline">
                    Privacy Policy
                  </Link>
                  . I understand my data will be processed securely.
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-destructive text-[11px] font-bold ml-1">{errors.agreeToTerms}</p>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full h-16 text-base font-black rounded-2xl shadow-[0_20px_40px_-10px_rgba(59,130,246,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(59,130,246,0.4)] transition-all duration-300 active:scale-[0.98]">
                Create account
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-10 font-medium">
              Already a member?{" "}
              <Link href="/login" className="text-primary hover:text-primary/80 font-black transition-colors ml-1">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
      <Chat />
    </div>
  );
}
