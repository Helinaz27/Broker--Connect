"use client";

import Link from "next/link";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = { sm: "h-7 w-7", md: "h-9 w-9", lg: "h-11 w-11" };
const iconSizeMap = { sm: "h-3.5 w-3.5", md: "h-5 w-5", lg: "h-6 w-6" };

/**
 * Digital Broker logo: house with door and keyhole — property and trust,
 * for the marketplace (properties, vehicles, services).
 */
export default function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
  const boxClass = sizeMap[size];
  const iconClass = iconSizeMap[size];

  return (
    <Link href="/" className={`flex items-center gap-2 group ${className}`}>
      <div
        className={`flex ${boxClass} items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white flex-shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-indigo-200 shadow-indigo-100/50 shadow-md relative overflow-hidden`}
        aria-hidden
      >
        <div className="absolute inset-0 bg-white/10 group-hover:translate-x-full transition-transform duration-700 -translate-x-full" />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={iconClass}
        >
          <path d="M12 3L4 9v12h5v-7h6v7h5V9L12 3z" />
          <rect x="10" y="13" width="4" height="5" rx="0.5" />
          <circle cx="12" cy="15.5" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      </div>
      {showText && (
        <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors duration-300">
          Digital<span className="text-indigo-600 group-hover:text-slate-900 transition-colors duration-300">Broker</span>
        </span>
      )}
    </Link>
  );
}
