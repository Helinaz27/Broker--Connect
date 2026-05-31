"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = { sm: 20, md: 24, lg: 28 };
const textSizeMap = { sm: "text-base", md: "text-lg", lg: "text-xl" };

export default function Logo({
  className = "",
  showText = true,
  size = "md",
}: LogoProps) {
  const { t } = useLanguage();
  const px = sizeMap[size];

  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className="flex-shrink-0"
      >
        <path
          d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z"
          className="fill-indigo-600 dark:fill-indigo-400"
        />
        <rect
          x="10"
          y="13"
          width="4"
          height="5"
          rx="0.5"
          className="fill-white dark:fill-slate-900"
          opacity="0.9"
        />
        <circle
          cx="12"
          cy="15.5"
          r="0.65"
          className="fill-indigo-600 dark:fill-indigo-400"
        />
      </svg>
      {showText && (
        <span
          className={`font-medium tracking-tight text-slate-900 dark:text-slate-100 hidden min-[441px]:inline ${textSizeMap[size]}`}
        >
          {t("common.brandDigital")}
          <span className="text-indigo-600 dark:text-indigo-400">
            {t("common.brandBroker")}
          </span>
        </span>
      )}
    </Link>
  );
}
