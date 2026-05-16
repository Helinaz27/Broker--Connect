"use client";

import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import Link from "next/link";
import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { useLoginMutation } from "@/store/apis/userApi";
import { setUser } from "@/store/slices/userSlice";
import { useAppDispatch } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }
    },
    [errors],
  );

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email address";
    if (!formData.password) newErrors.password = "Password is required";
    return newErrors;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(Object.values(newErrors)[0]);
      return;
    }

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      }).unwrap();

      if (response.success && response.data) {
        toast.success("Signed in successfully!");
        dispatch(
          setUser({ user: response.data.user, token: response.data.token }),
        );
        setTimeout(() => router.push("/"), 1500);
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message ||
        "Sign in failed. Please try again.";
      toast.error(errorMessage);
      setErrors({ form: errorMessage });
    }
  };

  return (
    <>
      <div className="w-full max-w-[400px] animate-fade-in">
        <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-foreground mb-8">
            Sign in
          </h1>

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
                disabled={isLoading}
                placeholder="name@example.com"
                className={`w-full px-5 py-4 bg-muted/30 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium disabled:opacity-50 ${
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
              <label className="text-xs font-medium text-muted-foreground">
                Password
              </label>
              <PasswordInput
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="••••••••"
                className={`w-full px-3 py-2.5 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary disabled:opacity-50 ${
                  errors.password ? "border-destructive" : "border-border"
                }`}
              />
              {errors.password && (
                <p className="text-destructive text-[11px] mt-1.5 font-bold ml-1">
                  {errors.password}
                </p>
              )}
              <Link
                href="/forgotten-password"
                className="inline-block text-xs text-primary hover:underline mt-1"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full font-medium mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

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
    </>
  );
}
