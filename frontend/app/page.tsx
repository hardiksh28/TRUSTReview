import Link from "next/link";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { HeroPhones } from "@/components/HeroPhones";
import { HowItWorks } from "@/components/HowItWorks";
import { Faq } from "@/components/Faq";

const DEMO_BUSINESS_ID = process.env.NEXT_PUBLIC_DEMO_BUSINESS_ID ?? "biz_demo001";

export default function LandingPage() {
  return (
    <main>
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-lg font-bold tracking-tight text-neutral-900">TrustReview</span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-neutral-600 hover:text-neutral-900 sm:block"
          >
            Login
          </Link>
          <Link href="/login" className="btn-primary px-5 py-2.5 text-sm">
            I&apos;m a business
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-10 sm:py-16 lg:grid-cols-2 lg:gap-8">
        <div>
          <div className="mb-6">
            <VerifiedBadge />
          </div>
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-neutral-900 sm:text-5xl">
            Reviews you can&apos;t buy.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-neutral-600">
            Every review on the internet is an unverified claim. TrustReview makes the visit
            itself the proof — a one-time QR code issued at the counter, spent once, tied to
            exactly one review.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="btn-primary">
              I&apos;m a business
            </Link>
            <Link href={`/b/?id=${DEMO_BUSINESS_ID}`} className="btn-secondary">
              See a live Trust Profile
            </Link>
          </div>

          <p className="mt-8 text-sm text-neutral-400">
            A new caf&eacute; with twelve honest reviews shouldn&apos;t lose to a ghost kitchen
            with four hundred bought ones.
          </p>
        </div>

        <HeroPhones />
      </section>

      <HowItWorks />

      <Faq />

      <footer className="border-t border-neutral-100 px-6 py-14">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-verified-50 text-sm font-bold text-verified-700">
            H
          </div>
          <p className="mt-4 text-base font-semibold text-neutral-900">
            Hi, I&apos;m Hardik — the creator of TrustReview.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-500">
            Built solo over a weekend for the Bharat Builds Tour (WeMakeDevs &times; AWS)
            hackathon. Questions, feedback, or want to bring this to your business?
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
          >
            Get in touch
          </Link>
        </div>

        <div className="mx-auto mt-12 flex max-w-2xl flex-col items-center gap-2 border-t border-neutral-100 pt-8 text-center">
          <p className="text-sm font-semibold text-neutral-900">TrustReview</p>
          <p className="text-sm text-neutral-400">Proof-of-visit reviews for local businesses.</p>
          <div className="mt-2 flex items-center gap-4 text-sm text-neutral-400">
            <Link href="/contact" className="hover:text-neutral-700">
              Contact
            </Link>
            <a
              href="https://github.com/hardiksh28/TRUSTReview"
              target="_blank"
              rel="noreferrer"
              className="hover:text-neutral-700"
            >
              Source on GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
