import Link from "next/link";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { HeroPhones } from "@/components/HeroPhones";
import { HowItWorks } from "@/components/HowItWorks";
import { TrustFeatures } from "@/components/TrustFeatures";
import { Pricing } from "@/components/Pricing";
import { Faq } from "@/components/Faq";
import { Squiggle } from "@/components/Squiggle";
import { Logo, LogoMark } from "@/components/Logo";

const DEMO_BUSINESS_ID = process.env.NEXT_PUBLIC_DEMO_BUSINESS_ID ?? "biz_demo001";

const AMBER = "#F3B94D";
const CORAL = "#FF7A59";
const TEAL = "#14B8A6";
const INDIGO = "#7C6FF0";

export default function LandingPage() {
  return (
    <main className="overflow-x-hidden">
      <nav className="sticky top-0 z-20 border-b border-neutral-200/60 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-3">
            <Link
              href="/browse"
              className="hidden text-sm font-medium text-neutral-600 hover:text-neutral-900 sm:block"
            >
              Browse businesses
            </Link>
            <Link
              href="#pricing"
              className="hidden text-sm font-medium text-neutral-600 hover:text-neutral-900 sm:block"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="hidden text-sm font-medium text-neutral-600 hover:text-neutral-900 sm:block"
            >
              Login
            </Link>
            <Link href="/login" className="btn-primary px-5 py-2.5 text-sm">
              Start free
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative overflow-hidden">
        <Squiggle
          color={AMBER}
          className="pointer-events-none absolute -left-16 -top-16 -z-10 w-40 opacity-90 sm:w-72 lg:w-96"
        />
        <Squiggle
          color={CORAL}
          flip
          className="pointer-events-none absolute -right-16 -top-14 -z-10 w-40 opacity-90 sm:w-72 lg:w-96"
        />

        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-14 sm:py-20 lg:grid-cols-2 lg:gap-8">
          <div>
            <div className="mb-6">
              <VerifiedBadge />
            </div>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-neutral-900 sm:text-5xl">
              Reviews you can&apos;t buy.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-neutral-600">
              Every review on the internet is an unverified claim. TrustReview makes the visit
              itself the proof: a one-time QR code issued at the counter, spent once, tied to
              exactly one review.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="btn-primary">
                Start free
              </Link>
              <Link href={`/b/?id=${DEMO_BUSINESS_ID}`} className="btn-secondary">
                See a live Trust Profile
              </Link>
            </div>

            <p className="mt-8 text-sm text-neutral-400">
              A new caf&eacute; with twelve honest reviews shouldn&apos;t lose to a ghost kitchen
              with four hundred bought ones. Free for one location — no card required.
            </p>
          </div>

          <HeroPhones />
        </section>
      </div>

      <div className="section-tint relative overflow-hidden">
        <Squiggle
          color={TEAL}
          className="pointer-events-none absolute -left-20 bottom-0 -z-10 hidden w-72 opacity-80 sm:block sm:w-80"
        />
        <Squiggle
          color={INDIGO}
          flip
          className="pointer-events-none absolute -right-16 top-10 -z-10 hidden w-64 opacity-80 sm:block sm:w-80"
        />
        <HowItWorks />
      </div>

      <TrustFeatures />

      <Pricing />

      <Faq />

      <footer className="relative overflow-hidden border-t border-neutral-200/70 px-6 py-16">
        <Squiggle
          color={CORAL}
          className="pointer-events-none absolute -left-20 -bottom-10 -z-10 hidden w-72 opacity-60 sm:block"
        />
        <Squiggle
          color={TEAL}
          flip
          className="pointer-events-none absolute -right-16 -bottom-6 -z-10 hidden w-64 opacity-60 sm:block"
        />

        <div className="card mx-auto max-w-xl text-center">
          <div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-verified-600 text-base font-bold text-white"
            style={{ boxShadow: "0 8px 20px -6px rgba(11,107,58,0.5)" }}
          >
            H
          </div>
          <p className="mt-4 text-base font-semibold text-neutral-900">
            Hi, I&apos;m Hardik, the founder of TrustReview.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-500">
            Built to fix a simple problem: reviews that can be bought shouldn&apos;t count.
            Questions, feedback, or want to bring this to your business?
          </p>
          <Link href="/contact" className="btn-secondary mt-5 inline-flex">
            Get in touch
          </Link>
        </div>

        <div className="mx-auto mt-10 flex max-w-2xl flex-col items-center gap-2 text-center">
          <LogoMark className="h-8 w-8" />
          <p className="text-sm text-neutral-400">Proof-of-visit reviews for local businesses.</p>
          <div className="mt-2 flex items-center gap-4 text-sm text-neutral-400">
            <Link href="/contact" className="hover:text-neutral-700">
              Contact
            </Link>
            <Link href="#pricing" className="hover:text-neutral-700">
              Pricing
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
