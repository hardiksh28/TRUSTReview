import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="mb-8 inline-flex">
        <Logo />
      </Link>

      <div className="card space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Privacy Policy</h1>
          <p className="mt-1 text-sm text-neutral-400">Last updated: September 2026</p>
        </div>

        <p className="text-sm leading-relaxed text-neutral-600">
          This explains what data TrustReview collects, why, and what you can do about it.
        </p>

        <Section title="What we collect">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Business owner accounts:</strong> email address and password (handled by
              Amazon Cognito — we never see or store your raw password), plus business name,
              category, and city.
            </li>
            <li>
              <strong>Optional business location:</strong> GPS coordinates a business owner
              chooses to share at setup, used only to power a fraud-detection signal.
            </li>
            <li>
              <strong>Reviews:</strong> the ratings and text you submit, plus, if you grant
              browser permission, your GPS location at the moment of scanning — used only to
              detect suspicious redemptions, never shown publicly.
            </li>
            <li>
              <strong>Anonymous reviewer identity:</strong> customers don&apos;t need an account.
              We generate a random identifier stored in your browser&apos;s local storage to help
              our fraud checks recognize repeat activity from the same device.
            </li>
            <li>
              <strong>Contact form submissions:</strong> name, email, and message you choose to
              send us.
            </li>
            <li>
              <strong>Usage analytics:</strong> page views and product events (e.g. account
              created, QR scanned, review submitted) via Mixpanel, to understand how the product
              is used.
            </li>
          </ul>
        </Section>

        <Section title="Why we collect it">
          To operate the core service (verifying visits, publishing reviews, letting businesses
          manage their profile), to detect and flag likely-fraudulent activity, to respond to
          contact requests, and to understand product usage so we can improve it.
        </Section>

        <Section title="Who we share it with">
          We use third-party infrastructure providers to run the Service: Amazon Web Services
          (hosting, database, authentication, AI-generated summaries) and Mixpanel (product
          analytics). We do not sell your data to advertisers or data brokers.
        </Section>

        <Section title="How long we keep it">
          Reviews and business data are kept for as long as your account or the relevant business
          profile exists. Redemption tokens expire and are automatically deleted within hours.
          Contact form submissions are kept to respond to and track inquiries.
        </Section>

        <Section title="Cookies and local storage">
          We use your browser&apos;s local storage (not third-party ad-tracking cookies) to keep
          you signed in and to remember your anonymous reviewer identity between visits. You can
          clear this at any time in your browser settings.
        </Section>

        <Section title="Your choices">
          Location sharing is always optional and never blocks a scan or review. You can request
          access to, correction of, or deletion of your data at any time via the{" "}
          <Link href="/contact" className="text-verified-700 hover:underline">
            Contact page
          </Link>
          .
        </Section>

        <Section title="Children">
          The Service is not directed at children under 13, and we do not knowingly collect data
          from them.
        </Section>

        <Section title="Changes to this policy">
          We may update this policy as the Service evolves. We&apos;ll update the date at the top
          of this page when we do.
        </Section>

        <Section title="Contact">
          Questions about this policy or your data? Reach out via the{" "}
          <Link href="/contact" className="text-verified-700 hover:underline">
            Contact page
          </Link>
          .
        </Section>

        <p className="border-t border-neutral-100 pt-4 text-xs text-neutral-400">
          This document is a plain-language summary of our privacy practices and has not been
          reviewed by a lawyer. It is provided in good faith but should not be treated as a
          substitute for professional legal advice, particularly if you operate in a jurisdiction
          with specific data-protection requirements (e.g. GDPR, DPDP Act).
        </p>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-1.5 text-sm font-semibold text-neutral-900">{title}</h2>
      <div className="text-sm leading-relaxed text-neutral-600">{children}</div>
    </div>
  );
}
