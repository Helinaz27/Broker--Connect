"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Users,
  Zap,
  Shield,
  Building2,
  Car,
  Briefcase,
  MessageCircle,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useMemo } from "react";

export default function AboutUsPage() {
  const { t } = useLanguage();

  const features = useMemo(
    () => [
      {
        icon: Zap,
        title: t("pages.aboutLightning"),
        description: t("pages.aboutLightningDesc"),
      },
      {
        icon: Shield,
        title: t("pages.aboutSecure"),
        description: t("pages.aboutSecureDesc"),
      },
      {
        icon: Users,
        title: t("pages.aboutCommunity"),
        description: t("pages.aboutCommunityDesc"),
      },
      {
        icon: MessageCircle,
        title: t("pages.aboutMessaging"),
        description: t("pages.aboutMessagingDesc"),
      },
    ],
    [t],
  );

  const categories = useMemo(
    () => [
      { icon: Building2, label: t("header.houses"), href: "/house-listings" },
      { icon: Car, label: t("header.cars"), href: "/car-listings" },
      {
        icon: Briefcase,
        label: t("header.otherServices"),
        href: "/service-listings",
      },
    ],
    [t],
  );

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[520px] h-[520px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="container relative mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6 order-2 lg:order-1">
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                {t("pages.aboutEyebrow")}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.08] text-foreground tracking-tight">
                {t("pages.aboutLabel")}{" "}
                <span className="text-primary">{t("pages.aboutBrand")}</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed font-medium max-w-xl">
                {t("pages.aboutHero")}
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Link href="/">
                  <Button size="lg" className="gap-2 font-semibold">
                    {t("pages.exploreMarketplace")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="font-semibold">
                    {t("pages.contactSupport")}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 via-transparent to-primary/5 rounded-[2.5rem] blur-2xl pointer-events-none" />
              <div className="relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-border shadow-glass aspect-[4/3]">
                <Image
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=85"
                  alt={t("pages.officeAlt")}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <p className="text-sm font-bold uppercase tracking-widest text-primary-foreground/80 mb-1">
                    {t("pages.aboutBrand")}
                  </p>
                  <p className="text-lg md:text-xl font-bold text-primary-foreground leading-snug max-w-sm">
                    {t("pages.aboutHeroImageCaption")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-6">
              <p className="text-xs font-bold text-primary uppercase tracking-widest">
                {t("pages.ourMission")}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">
                {t("pages.aboutMissionHeading")}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t("pages.aboutMissionText")}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t("pages.aboutMissionP2")}
              </p>
            </div>
            <div className="relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-border shadow-glass aspect-[4/3] lg:aspect-video">
              <Image
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=85"
                alt={t("pages.aboutMissionImageAlt")}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace categories */}
      <section className="py-14 md:py-16 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 tracking-tight">
            {t("pages.aboutMarketplaceTitle")}
          </h2>
          <p className="text-muted-foreground font-medium max-w-xl mx-auto mb-10">
            {t("pages.aboutMarketplaceSubtitle")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map(({ icon: Icon, label, href }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center gap-3 rounded-2xl border border-border bg-card px-6 py-4 text-foreground font-semibold shadow-soft hover:border-primary/30 hover:bg-primary/5 transition-colors"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
              {t("pages.aboutValuesEyebrow")}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
              {t("pages.whyChoose")}
            </h2>
            <p className="text-muted-foreground font-medium leading-relaxed">
              {t("pages.aboutValuesSubtitle")}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="flex flex-col bg-card border border-border rounded-[2rem] p-8 shadow-soft hover:border-primary/20 transition-colors"
                >
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border border-border bg-card px-8 py-14 md:px-16 md:py-20 text-center shadow-soft">
            <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            <div className="relative max-w-2xl mx-auto">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
                {t("pages.aboutEyebrow")}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
                {t("pages.readyToStart")}
              </h2>
              <p className="text-lg text-muted-foreground mb-8 font-medium leading-relaxed">
                {t("pages.joinThousands")}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/">
                  <Button size="lg" className="gap-2 font-semibold">
                    {t("pages.startBrowsing")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 font-semibold"
                  >
                    {t("header.signIn")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
