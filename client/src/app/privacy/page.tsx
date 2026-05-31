"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import { privacyContent } from "@/i18n";

export default function PrivacyPage() {
  const { locale, t } = useLanguage();
  const content = privacyContent[locale];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 container px-4 py-12 md:py-16 max-w-3xl">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("common.backToHome")}
          </Link>
        </div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-2">
          {content.title}
        </h1>
        <p className="text-sm text-muted-foreground mb-10">{content.intro}</p>

        <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none space-y-8">
          {content.sections.map((section, index) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                {section.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {section.body}
                {index === content.sections.length - 1 && (
                  <>
                    {" "}
                    <a
                      href={`mailto:${content.contactEmail}`}
                      className="text-primary hover:underline"
                    >
                      {content.contactEmail}
                    </a>
                  </>
                )}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <Link
            href="/terms"
            className="text-primary font-medium hover:underline"
          >
            {t("footer.terms")}
          </Link>
          {" · "}
          <Link
            href="/help"
            className="text-primary font-medium hover:underline"
          >
            {t("footer.helpCenter")}
          </Link>
        </div>
      </main>
    </div>
  );
}
