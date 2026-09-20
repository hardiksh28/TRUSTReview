import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="mb-8 inline-flex">
        <Logo />
      </Link>

      <div className="card space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Terms of Service</h1>
          <p className="mt-1 text-sm text-neutral-400">Last updated: September 2026</p>
        </div>

        <p className="text-sm leading-relaxed text-neutral-600">
          These Terms govern your use of TrustReview (&quot;the Service&quot;), operated by
          Hardik (&quot;we&quot;, &quot;us&quot;). By creating an account, scanning a code, or
          submitting a review, you agree to these Terms.
        </p>

        <Section title="1. What the Service does">
          TrustReview lets a business display a rotating QR code that a customer scans in person
          to unlock exactly one review. We run automated fraud-detection checks on submitted
          reviews and flag suspicious ones for human review; we do not automatically remove any
          review without a moderator&apos;s decision.
        </Section>

        <Section title="2. Business accounts">
          If you create a business account, you&apos;re responsible for keeping your login
          credentials secure and for all activity under your account, including QR codes you
          display and locations you register. You may only create a business profile for a
          business you own or are authorized to represent.
        </Section>

        <Section title="3. Acceptable use">
          You agree not to: attempt to redeem the same QR code more than once through any means
          other than the intended single scan; submit fake or manipulated reviews; use the
          service to harass, defame, or collect data about individuals; attempt to circumvent the
          fraud-detection or rate-limiting systems; or use automated tools to scrape or abuse the
          public API.
        </Section>

        <Section title="4. Review content">
          You retain ownership of any review text you submit. By submitting a review, you grant us
          a worldwide, royalty-free license to display, store, and process it as part of the
          Service, including showing it publicly on the relevant business&apos;s Trust Profile. We
          may remove content that violates these Terms.
        </Section>

        <Section title="5. Fraud detection is a signal, not a verdict">
          Our risk signals (e.g. flags for new accounts, duplicate text, location mismatches, or
          unusual review bursts) are automated heuristics intended to assist human moderators.
          They are not a guarantee that any review is genuine or fraudulent, and a flagged review
          is never hidden automatically.
        </Section>

        <Section title="6. Service availability">
          The Service is provided &quot;as is&quot; without warranties of any kind. We do not
          guarantee uninterrupted availability and may modify, suspend, or discontinue any part of
          the Service at any time.
        </Section>

        <Section title="7. Limitation of liability">
          To the maximum extent permitted by law, we are not liable for any indirect, incidental,
          or consequential damages arising from your use of the Service, including reliance on any
          review, rating, or fraud-detection outcome.
        </Section>

        <Section title="8. Payment (if applicable)">
          Paid plans, when available, will be billed through a third-party payment processor. We
          never store your full card details on our own servers.
        </Section>

        <Section title="9. Termination">
          We may suspend or terminate an account that violates these Terms. You may stop using the
          Service and request account deletion at any time via the Contact page.
        </Section>

        <Section title="10. Changes to these Terms">
          We may update these Terms from time to time. Continued use of the Service after a change
          takes effect constitutes acceptance of the revised Terms.
        </Section>

        <Section title="11. Governing law">
          These Terms are governed by the laws of India, without regard to conflict-of-law
          principles.
        </Section>

        <Section title="12. Contact">
          Questions about these Terms? Reach out via the{" "}
          <Link href="/contact" className="text-verified-700 hover:underline">
            Contact page
          </Link>
          .
        </Section>

        <p className="border-t border-neutral-100 pt-4 text-xs text-neutral-400">
          This document is a plain-language summary of our terms and has not been reviewed by a
          lawyer. It is provided in good faith but should not be treated as a substitute for
          professional legal advice.
        </p>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-1.5 text-sm font-semibold text-neutral-900">{title}</h2>
      <p className="text-sm leading-relaxed text-neutral-600">{children}</p>
    </div>
  );
}
