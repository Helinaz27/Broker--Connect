"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useCallback, memo } from "react";
import { useRegisterMutation } from "@/store/apis/userApi";
import { setUser } from "@/store/slices/userSlice";
import { useAppDispatch } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, X, User, Mail, Phone, Lock } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

const InputField = memo(
  ({
    label,
    name,
    type = "text",
    placeholder,
    icon: Icon,
    value,
    error,
    isFocused,
    showToggle = false,
    showValue = false,
    onToggle,
    onChange,
    onFocus,
    onBlur,
    disabled,
  }: any) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          type={showToggle && showValue ? "text" : type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-12 pr-12 py-3 border rounded-lg bg-white dark:bg-gray-900 transition-all duration-200
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : isFocused
                ? "border-blue-500 ring-4 ring-blue-500/10"
                : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
          } focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-gray-100`}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showValue ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1.5 mt-1">
          <X className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  ),
);

InputField.displayName = "InputField";

export default function Register() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
      if (errors[name]) {
        setErrors((prev) => {
          const n = { ...prev };
          delete n[name];
          return n;
        });
      }
    },
    [errors],
  );

  const validateForm = useCallback((): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!formData.firstName.trim())
      e.firstName = t("auth.firstNameRequired");
    if (!formData.lastName.trim()) e.lastName = t("auth.lastNameRequired");
    if (!formData.email.trim()) e.email = t("auth.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = t("auth.emailInvalid");
    if (!formData.phone.trim()) e.phone = t("auth.phoneRequired");
    if (!formData.password) e.password = t("auth.passwordRequired");
    else if (formData.password.length < 6)
      e.password = t("auth.passwordMinLength");
    if (!formData.confirmPassword)
      e.confirmPassword = t("auth.confirmPasswordRequired");
    else if (formData.password !== formData.confirmPassword)
      e.confirmPassword = t("auth.passwordsMustMatch");
    if (!formData.agreeToTerms) e.agreeToTerms = t("auth.agreeTermsRequired");
    return e;
  }, [formData, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError);
      return;
    }

    try {
      const { confirmPassword, agreeToTerms, ...registerData } = formData;
      const response = await register(registerData).unwrap();

      if (response.success && response.data) {
        toast.success(t("auth.registerSuccess"));
        dispatch(
          setUser({ user: response.data.user, token: response.data.token }),
        );
        setTimeout(() => {
          router.push("/");
        }, 1500);
      }
    } catch (err: any) {
      const errorMessage =
        err?.data?.message || t("auth.registerFailed");
      toast.error(errorMessage);
      setErrors({ form: errorMessage });
    }
  };

  const handleFocus = useCallback((name: string) => {
    setFocusedField(name);
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedField(null);
  }, []);

  return (
    <>
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 md:p-10 border border-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t("auth.createAnAccount")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("auth.joinSubtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label={t("auth.firstName")}
                name="firstName"
                placeholder={t("auth.firstNamePlaceholder")}
                icon={User}
                value={formData.firstName}
                error={errors.firstName}
                isFocused={focusedField === "firstName"}
                onChange={handleChange}
                onFocus={() => handleFocus("firstName")}
                onBlur={handleBlur}
                disabled={isLoading}
              />
              <InputField
                label={t("auth.lastName")}
                name="lastName"
                placeholder={t("auth.lastNamePlaceholder")}
                icon={User}
                value={formData.lastName}
                error={errors.lastName}
                isFocused={focusedField === "lastName"}
                onChange={handleChange}
                onFocus={() => handleFocus("lastName")}
                onBlur={handleBlur}
                disabled={isLoading}
              />
            </div>

            <InputField
              label={t("auth.emailAddress")}
              name="email"
              type="email"
              placeholder={t("auth.registerEmailPlaceholder")}
              icon={Mail}
              value={formData.email}
              error={errors.email}
              isFocused={focusedField === "email"}
              onChange={handleChange}
              onFocus={() => handleFocus("email")}
              onBlur={handleBlur}
              disabled={isLoading}
            />

            <InputField
              label={t("auth.phone")}
              name="phone"
              type="tel"
              placeholder={t("auth.phonePlaceholder")}
              icon={Phone}
              value={formData.phone}
              error={errors.phone}
              isFocused={focusedField === "phone"}
              onChange={handleChange}
              onFocus={() => handleFocus("phone")}
              onBlur={handleBlur}
              disabled={isLoading}
            />

            <InputField
              label={t("auth.password")}
              name="password"
              type="password"
              placeholder={t("auth.passwordCreatePlaceholder")}
              icon={Lock}
              value={formData.password}
              error={errors.password}
              isFocused={focusedField === "password"}
              showToggle={true}
              showValue={showPassword}
              onToggle={() => setShowPassword(!showPassword)}
              onChange={handleChange}
              onFocus={() => handleFocus("password")}
              onBlur={handleBlur}
              disabled={isLoading}
            />

            <InputField
              label={t("auth.confirmPassword")}
              name="confirmPassword"
              type="password"
              placeholder={t("auth.confirmPasswordPlaceholder")}
              icon={Lock}
              value={formData.confirmPassword}
              error={errors.confirmPassword}
              isFocused={focusedField === "confirmPassword"}
              showToggle={true}
              showValue={showConfirmPassword}
              onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
              onChange={handleChange}
              onFocus={() => handleFocus("confirmPassword")}
              onBlur={handleBlur}
              disabled={isLoading}
            />

            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                disabled={isLoading}
                className="mt-1 w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-2 cursor-pointer"
              />
              <label
                htmlFor="agreeToTerms"
                className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
              >
                {t("auth.agreeTerms")}{" "}
                <Link
                  href="/terms"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {t("auth.termsOfService")}
                </Link>{" "}
                {t("auth.and")}{" "}
                <Link
                  href="/privacy"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {t("auth.privacyPolicy")}
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t("auth.creatingAccount")}
                </>
              ) : (
                t("auth.createAccount")
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("auth.alreadyHaveAccount")}{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                {t("auth.signIn")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
