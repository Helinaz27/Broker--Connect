"use client";

import Chat from "@/components/Chat";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { Lock } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
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

    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email address";
    if (!formData.password) newErrors.password = "Password is required";

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Handle login
    console.log("Login with:", formData);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-[400px] animate-fade-in">
          <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
            <div className="mb-8">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1">
                Sign in
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your credentials to access your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className={`w-full px-5 py-4 bg-muted/30 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium ${
                    errors.email ? "border-destructive" : "border-border/60"
                  }`}
                />
                {errors.email && (
                  <p className="text-destructive text-[11px] mt-1.5 font-bold ml-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">
                    Password
                  </label>
                  <Link
                    href="/forgotten-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <PasswordInput
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full px-3 py-2.5 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary ${
                    errors.password ? "border-destructive" : "border-border"
                  }`}
                />
                {errors.password && (
                  <p className="text-destructive text-[11px] mt-1.5 font-bold ml-1">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 ml-1">
                <input
                  type="checkbox"
                  name="rememberMe"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-5 h-5 border-border/60 rounded-lg text-primary focus:ring-primary transition-all cursor-pointer"
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm text-muted-foreground font-semibold cursor-pointer select-none"
                >
                  Remember this device
                </label>
              </div>

              <Button type="submit" className="w-full font-medium mt-2">
                Sign in
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-xs text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-10 font-medium">
              New to DigitalBroker?{" "}
              <Link
                href="/register"
                className="text-primary hover:underline font-medium ml-1"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Chat />
    </div>
  );
}
