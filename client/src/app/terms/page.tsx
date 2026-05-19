"use client";

import Link from "next/link";

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: March 2026. Please read these terms before using the
          Digital Broker marketplace.
        </p>

        <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              1. Acceptance and use of the platform
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By creating an account or using Digital Broker, you agree to these
              Terms of Service. Digital Broker is a marketplace that connects
              people who want to list or find properties (rent/sale), vehicles
              (rent/hire), and professional services in Ethiopia. You must be at
              least 18 years old and able to enter into a binding contract to
              use the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              2. Accounts and listings
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for keeping your account credentials secure
              and for all activity under your account. When you post a listing
              (property, vehicle, or service), you represent that you have the
              right to offer it and that your description, price, and location
              are accurate. Listings must comply with applicable laws in
              Ethiopia. We may remove or suspend listings that violate our
              policies or the law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              3. Transactions and conduct
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Digital Broker facilitates discovery and contact between users; we
              are not a party to any rental, sale, or service agreement between
              you and another user. You are responsible for your own due
              diligence, negotiations, and any contracts you enter into. You
              agree not to post false or misleading content, harass other users,
              or use the platform for illegal or fraudulent purposes. Users must
              deal fairly and in good faith.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              4. Fees and payments
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our current fee structure for listing or premium features (if any)
              is described on the platform. We may change fees with reasonable
              notice. Any payment between users (e.g. rent, vehicle hire,
              service fees) is solely between those users; Digital Broker is not
              responsible for payment disputes unless we explicitly facilitate
              the payment.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              5. Intellectual property and content
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of content you post. By posting, you grant us
              a license to use, display, and distribute that content in
              connection with operating the marketplace. The Digital Broker
              name, logo, and platform design are our property. You may not copy
              or misuse our branding or the platform’s layout or code.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              6. Disclaimers and limitation of liability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The platform is provided “as is.” We do not guarantee the accuracy
              of listings or the conduct of users. We are not liable for any
              loss or damage arising from your use of the platform or from
              transactions with other users, except where prohibited by law. Our
              total liability is limited to the amount you paid us in the twelve
              months before the claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              7. Termination and changes
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may suspend or terminate your account if you breach these terms
              or for other operational reasons. You may close your account at
              any time. We may update these terms; we will notify you of
              material changes. Continued use after changes means you accept the
              new terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              8. Contact
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms of Service, contact us at
              legal@BrokerConnect.example.com or through the Help Center.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <Link
            href="/privacy"
            className="text-primary font-medium hover:underline"
          >
            Privacy Policy
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
