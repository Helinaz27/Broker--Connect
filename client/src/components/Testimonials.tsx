"use client";

import { Quote, Star } from "lucide-react";
import { useMemo } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";

const TESTIMONIAL_IDS = ["1", "2", "3"] as const;

export default function Testimonials() {
  const { t } = useLanguage();

  const testimonials = useMemo(
    () =>
      TESTIMONIAL_IDS.map((id) => ({
        id,
        quote: t(`home.testimonials.${id}.quote`),
        name: t(`home.testimonials.${id}.name`),
        role: t(`home.testimonials.${id}.role`),
      })),
    [t],
  );

  return (
    <section className="py-20 md:py-24 border-t border-border bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
            {t("home.testimonials.eyebrow")}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
            {t("home.testimonials.title")}
          </h2>
          <p className="text-muted-foreground font-medium leading-relaxed">
            {t("home.testimonials.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((item) => (
            <article
              key={item.id}
              className="flex flex-col bg-card border border-border rounded-[2rem] p-8 shadow-soft"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Quote className="h-5 w-5" />
                </div>
                <div className="flex gap-0.5 text-primary" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
              <blockquote className="flex-1 text-foreground leading-relaxed font-medium mb-8">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <footer className="pt-6 border-t border-border">
                <p className="font-bold text-foreground">{item.name}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {item.role}
                </p>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
