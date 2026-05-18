"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 container px-4 py-12 md:py-16 max-w-3xl">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </Link>
        </div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: March 2026. Digital Broker (“we”, “our”) operates the
          Digital Broker marketplace for properties, vehicles, and services in
          Ethiopia.
        </p>

        <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              1. Information we collect
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information you provide when you register, list a
              property or vehicle, offer a service, or contact other users. This
              includes your name, email, phone number, location (e.g. Addis
              Ababa, district), and any content you post (listings,
              descriptions, photos). We also collect usage data such as pages
              visited and search queries to improve the marketplace.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              2. How we use your information
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We use your information to run the Digital Broker platform: to
              display your listings to other users, to facilitate messaging
              between buyers and sellers, to process payments where applicable,
              and to send you service-related notices (e.g. new messages,
              listing status). We may use aggregated, non-personal data to
              improve our services and for analytics.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              3. Sharing and disclosure
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Your listing details (title, description, price, location, photos)
              are visible to other users as part of the marketplace. We do not
              sell your personal data. We may share data with service providers
              that help us operate the platform (e.g. hosting, analytics) under
              strict confidentiality. We may disclose information if required by
              law or to protect the rights and safety of our users.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              4. Data security and retention
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We use industry-standard measures to protect your data. We retain
              your account and listing data for as long as your account is
              active and as needed to provide the service and comply with legal
              obligations. You may request deletion of your account and
              associated data by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              5. Your rights
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You can access and update your profile and listings from your
              account. You may request a copy of your data or request correction
              or deletion. To exercise these rights or ask questions about this
              policy, contact us at privacy@digitalbroker.example.com.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              6. Changes
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will
              notify you of material changes by posting the updated policy on
              this page and updating the “Last updated” date. Continued use of
              Digital Broker after changes constitutes acceptance.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <Link
            href="/terms"
            className="text-primary font-medium hover:underline"
          >
            View Terms of Service
          </Link>
          {" · "}
          <Link
            href="/help"
            className="text-primary font-medium hover:underline"
          >
            Help Center
          </Link>
        </div>
      </main>
    </div>
  );
}
