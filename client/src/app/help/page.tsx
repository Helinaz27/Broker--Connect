"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Home,
  Car,
  Wrench,
  MessageCircle,
  Shield,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { helpContent } from "@/i18n";

const quickLinkIcons: Record<string, LucideIcon> = {
  "/house-listings": Home,
  "/car-listings": Car,
  "/service-listings": Wrench,
  "/dashboard": MessageCircle,
  "/terms": FileText,
  "/privacy": Shield,
};

export default function HelpPage() {
  const { locale, t } = useLanguage();
  const content = helpContent[locale];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 container px-6 py-12 md:py-20 max-w-4xl mx-auto animate-fade-in">
        <div className="mb-12">
          <Link
            href="/"
            className="text-sm font-bold text-primary uppercase tracking-widest hover:opacity-80 transition-opacity"
          >
            {t("common.backToMarketplace")}
          </Link>
        </div>

        <div className="space-y-4 mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight italic">
            {t("pages.helpTitle")}
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl">
            {t("pages.helpIntro")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
          {content.quickLinks.map((link) => {
            const Icon = quickLinkIcons[link.href] ?? FileText;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-4 p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:bg-muted/50 hover:border-primary/20 transition-all duration-300 shadow-sm group"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-bold text-sm text-foreground tracking-tight">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="space-y-16">
          {content.sections.map((section) => (
            <section key={section.title} className="space-y-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary border-b border-border pb-4">
                {section.title}
              </h2>
              <ul className="grid gap-10">
                {section.items.map((item) => (
                  <li key={item.q} className="space-y-3">
                    <h3 className="text-xl font-bold text-foreground tracking-tight italic">
                      {item.q}
                    </h3>
                    <p className="text-muted-foreground font-medium leading-relaxed max-w-2xl">
                      {item.a}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-24 p-10 rounded-[2.5rem] bg-card border border-border shadow-glass text-center space-y-6">
          <h3 className="text-2xl font-black text-foreground tracking-tight italic">
            {t("pages.stillNeedHelp")}
          </h3>
          <p className="text-muted-foreground font-medium max-w-md mx-auto">
            {t("pages.helpSupportText")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              className="h-12 px-8 rounded-xl bg-primary font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
              asChild
            >
              <Link href="/contact">{t("pages.contactSupport")}</Link>
            </Button>
            <Button
              variant="outline"
              className="h-12 px-8 rounded-xl border-border font-bold uppercase tracking-widest text-xs"
              asChild
            >
              <Link href="/">{t("pages.returnHomeLink")}</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
