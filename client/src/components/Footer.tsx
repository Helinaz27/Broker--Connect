import Link from "next/link";
import { Twitter, Facebook, Instagram } from "lucide-react";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="bg-gray-200 border-t border-gray-200 py-8">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
          {/* Brand Section */}
          <div className="md:col-span-5 space-y-2">
            <Logo
              size="sm"
              showText={true}
              className="[&_span]:text-gray-900"
            />
            <p className="text-xs text-gray-500 leading-relaxed max-w-[280px]">
              Ethiopia's trusted marketplace for houses, vehicles, and other
              services.
            </p>
          </div>

          {/* Marketplace Links */}
          <div className="md:col-span-2 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-950">
              Marketplace
            </h3>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link
                  href="/house-listings"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Houses
                </Link>
              </li>
              <li>
                <Link
                  href="/car-listings"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Vehicles
                </Link>
              </li>
              <li>
                <Link
                  href="/service-listings"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Other services
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="md:col-span-2 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-950">
              Support
            </h3>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link
                  href="/help"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Section */}
          <div className="md:col-span-3 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-950">
              Follow Us
            </h3>
            <div className="flex gap-2">
              {[
                {
                  Icon: Twitter,
                  href: "https://twitter.com",
                  label: "Twitter",
                },
                {
                  Icon: Facebook,
                  href: "https://facebook.com",
                  label: "Facebook",
                },
                {
                  Icon: Instagram,
                  href: "https://instagram.com",
                  label: "Instagram",
                },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-7 w-7 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-400 hover:bg-gray-100 transition-all"
                  aria-label={label}
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright Bar - Centered */}
        <div className="pt-4 border-t border-gray-200 flex flex-col items-center gap-2 text-xs text-gray-600 text-center">
          <p>© 2026 Digital Broker. All rights reserved.</p>
          <div className="flex gap-5">
            <Link
              href="/privacy"
              className="text-gray-950 hover:text-gray-900 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-gray-950 hover:text-gray-900 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="text-gray-950 hover:text-gray-900 transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
