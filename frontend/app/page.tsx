import Link from "next/link";
import { VerifiedBadge } from "@/components/VerifiedBadge";

const DEMO_BUSINESS_ID = process.env.NEXT_PUBLIC_DEMO_BUSINESS_ID ?? "biz_demo001";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-2xl text-center">
        <div className="mb-8 flex items-center justify-center gap-2">
          <span className="text-lg font-bold tracking-tight text-neutral-900">TrustReview</span>
          <VerifiedBadge />
        </div>

        <h1 className="text-3xl font-bold leading-snug text-neutral-900 sm:text-4xl">
          Every review on the internet is an unverified claim.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-neutral-600">
          TrustReview makes the visit itself the proof — a one-time QR code issued at the
          counter, spent once, tied to exactly one review. You cannot buy a review you did not
          earn.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/login" className="btn-primary w-full sm:w-auto">
            I&apos;m a business
          </Link>
          <Link href={`/b/${DEMO_BUSINESS_ID}`} className="btn-secondary w-full sm:w-auto">
            See a live Trust Profile
          </Link>
        </div>

        <p className="mt-16 text-sm text-neutral-400">
          A new caf&eacute; with twelve honest reviews shouldn&apos;t lose to a ghost kitchen
          with four hundred bought ones.
        </p>
      </div>
    </main>
  );
}
