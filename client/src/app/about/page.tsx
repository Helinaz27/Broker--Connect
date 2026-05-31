"use client";

import { ShieldCheck, Users, Trophy, Target } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useMemo } from "react";

export default function AboutPage() {
  const { t } = useLanguage();

  const stats = useMemo(
    () => [
      { label: t("pages.activeUsers"), value: "10K+", icon: Users },
      { label: t("pages.verifiedAssets"), value: "5K+", icon: ShieldCheck },
      { label: t("pages.awardsWon"), value: "12", icon: Trophy },
      { label: t("pages.successRate"), value: "98%", icon: Target },
    ],
    [t],
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="container mx-auto px-6 relative">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6">
                {t("pages.redefining")} <br />
                <span className="text-primary italic">
                  {t("pages.brokerageExperience")}
                </span>
              </h1>
              <p className="text-lg text-muted-foreground font-medium leading-relaxed mb-10">
                {t("pages.aboutPageHero")}
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 border-y border-border bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-20 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
                  {t("pages.ourMission")}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {t("pages.aboutMissionP1")}
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {t("pages.aboutMissionP2")}
                </p>
              </div>
              <div className="rounded-[2.5rem] overflow-hidden border border-border shadow-glass aspect-video">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80"
                  alt={t("pages.officeAlt")}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
