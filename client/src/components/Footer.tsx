"use client";

import Link from "next/link";
import { Twitter, Facebook, Instagram, Linkedin } from "lucide-react";
import Logo from "@/components/Logo";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-card py-20">
      <div className="container px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-16">
          <div className="lg:col-span-2 space-y-8">
            <Logo size="md" showText={true} />
            <p className="text-base text-muted-foreground leading-relaxed max-w-sm font-medium">
              {t("footer.tagline")}
            </p>
            <div className="flex gap-3">
              {[
                { icon: Twitter, href: "https://twitter.com" },
                { icon: Facebook, href: "https://facebook.com" },
                { icon: Instagram, href: "https://instagram.com" },
                { icon: Linkedin, href: "https://linkedin.com" },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-xl border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/20 hover:shadow-soft transition-all duration-300"
                >
                  <item.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground">
              {t("footer.marketplace")}
            </h3>
            <ul className="space-y-3">
              {[
                { label: t("footer.houses"), href: "/house-listings" },
                { label: t("footer.cars"), href: "/car-listings" },
                {
                  label: t("footer.otherServices"),
                  href: "/service-listings",
                },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground">
              {t("footer.platform")}
            </h3>
            <ul className="space-y-3">
              {[
                { label: t("footer.dashboard"), href: "/dashboard" },
                { label: t("footer.myProfile"), href: "/profile" },
                { label: t("footer.favorites"), href: "/favorites" },
                { label: t("footer.settings"), href: "/settings" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground">
              {t("footer.support")}
            </h3>
            <ul className="space-y-3">
              {[
                { label: t("footer.helpCenter"), href: "/help" },
                { label: t("footer.terms"), href: "/terms" },
                { label: t("footer.privacy"), href: "/privacy" },
                { label: t("footer.contactUs"), href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-2 border-t border-border/50 flex justify-center">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
