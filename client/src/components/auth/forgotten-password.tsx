"use client";

import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import Link from "next/link";
import { useState, useCallback } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
} from "@/store/apis/userApi";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageProvider";

type Step = "email" | "otp" | "reset";

export default function ForgottenPassword() {
  const { t } = useLanguage();
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [resetToken, setResetToken] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [forgotPassword, { isLoading: isSending }] =
    useForgotPasswordMutation();
  const [verifyResetOtp, { isLoading: isVerifying }] =
    useVerifyResetOtpMutation();
  const [resetPassword, { isLoading: isResetting }] =
    useResetPasswordMutation();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const nextValue =
        name === "otp" ? value.replace(/\D/g, "").slice(0, 6) : value;
      setFormData((prev) => ({ ...prev, [name]: nextValue }));
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

  const validateEmail = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = t("auth.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = t("auth.emailInvalid");
    return newErrors;
  }, [formData.email, t]);

  const validateOTP = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!formData.otp.trim()) newErrors.otp = t("auth.otpRequired");
    else if (formData.otp.length !== 6) newErrors.otp = t("auth.otpSixDigits");
    return newErrors;
  }, [formData.otp, t]);

  const validateReset = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (formData.newPassword.length < 6)
      newErrors.newPassword = t("auth.passwordMinLength");
    if (formData.newPassword !== formData.confirmPassword)
      newErrors.confirmPassword = t("auth.passwordsMustMatch");
    return newErrors;
  }, [formData.newPassword, formData.confirmPassword, t]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateEmail();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await forgotPassword({ email: formData.email }).unwrap();
      if (response.success) {
        setErrors({});
        setStep("otp");
        setSuccessMessage(t("auth.checkEmailCode"));
      }
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        t("auth.sendCodeFailed");
      toast.error(message);
      setErrors({ email: message });
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateOTP();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await verifyResetOtp({
        email: formData.email,
        otp: formData.otp,
      }).unwrap();

      if (response.success && response.data?.resetToken) {
        setResetToken(response.data.resetToken);
        setErrors({});
        setStep("reset");
        setSuccessMessage("");
      }
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        t("auth.invalidVerificationCode");
      toast.error(message);
      setErrors({ otp: message });
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateReset();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!resetToken) {
      toast.error(t("auth.sessionExpired"));
      setStep("email");
      return;
    }

    try {
      const response = await resetPassword({
        token: resetToken,
        newPassword: formData.newPassword,
      }).unwrap();

      if (response.success) {
        setErrors({});
        setSuccessMessage(t("auth.passwordUpdated"));
        toast.success(t("auth.passwordUpdated"));
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        t("auth.resetPasswordFailed");
      toast.error(message);
      setErrors({ form: message });
    }
  };

  const isLoading = isSending || isVerifying || isResetting;

  const stepDescription =
    step === "email"
      ? t("auth.resetStepEmail")
      : step === "otp"
        ? t("auth.resetStepCode")
        : t("auth.resetStepNew");

  return (
    <>
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm font-medium group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            {t("auth.backToSignIn")}
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t("auth.resetPassword")}
            </h1>
            <p className="text-muted-foreground">{stepDescription}</p>
          </div>

          {successMessage && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
              {successMessage}
            </div>
          )}

          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  {t("auth.email")}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder={t("auth.emailPlaceholder")}
                  className={`w-full px-4 py-3 bg-muted/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 ${
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
                disabled={isSending}
                className="w-full py-6 text-base font-bold rounded-xl"
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("auth.sending")}
                  </>
                ) : (
                  t("auth.sendVerificationCode")
                )}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleOTPSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  {t("auth.verificationCode")}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  disabled={isVerifying}
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
                disabled={isVerifying}
                className="w-full py-6 text-base font-bold rounded-xl"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("auth.verifying")}
                  </>
                ) : (
                  t("auth.verifyCode")
                )}
              </Button>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full text-sm text-muted-foreground hover:text-primary font-medium transition-colors py-2"
              >
                {t("auth.resendOrDifferentEmail")}
              </button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleResetSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    {t("auth.newPassword")}
                  </label>
                  <PasswordInput
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    disabled={isResetting}
                    placeholder={t("auth.passwordPlaceholder")}
                    className={`w-full px-4 py-3 bg-muted/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 ${
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
                    {t("auth.confirmNewPassword")}
                  </label>
                  <PasswordInput
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isResetting}
                    placeholder={t("auth.passwordPlaceholder")}
                    className={`w-full px-4 py-3 bg-muted/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 ${
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
                disabled={isResetting}
                className="w-full py-6 text-base font-bold rounded-xl"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("auth.updating")}
                  </>
                ) : (
                  t("auth.updatePassword")
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
