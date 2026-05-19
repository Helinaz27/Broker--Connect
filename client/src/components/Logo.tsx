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
    <Link href="/" className={`flex items-center gap-2.5 group ${className}`}>
      <div
        className={`flex ${boxClass} items-center justify-center rounded-[0.8rem] bg-primary text-primary-foreground flex-shrink-0 transition-all duration-500 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-primary/20 shadow-primary/10 shadow-md relative overflow-hidden`}
        aria-hidden
      >
        <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-1000 -translate-x-full" />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={iconClass}
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>
      {showText && (
        <span className="text-xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors duration-300 italic">
          BROKER<span className="text-primary group-hover:text-foreground transition-colors duration-300">CONNECT.</span>
        </span>
      )}
    </Link>
  );
}
