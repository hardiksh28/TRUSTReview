"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Logo } from "@/components/Logo";
import { Squiggle } from "@/components/Squiggle";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import type { BusinessesResponse, BusinessSummary } from "@/lib/types";

export default function BrowsePage() {
  const [state, setState] = useState<
    { status: "loading" } | { status: "error" } | { status: "ready"; businesses: BusinessSummary[] }
  >({ status: "loading" });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<BusinessesResponse>("/businesses");
        setState({ status: "ready", businesses: res.businesses });
      } catch {
        setState({ status: "error" });
      }
    })();
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="dot-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-96" />
      <Squiggle
        color="#F3B94D"
        className="pointer-events-none absolute -left-14 -top-10 hidden w-64 -rotate-6 opacity-20 sm:block"
      />
      <Squiggle
        color="#7C6FF0"
        flip
        className="pointer-events-none absolute -right-14 top-24 hidden w-64 rotate-6 opacity-20 sm:block"
      />

      <nav className="border-b border-neutral-200/60 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/">
            <Logo />
          </Link>
          <Link href="/login" className="btn-primary px-5 py-2.5 text-sm">
            I&apos;m a business
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Browse businesses</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Every Trust Profile on TrustReview. Every review here came from a verified, single-use
          visit code.
        </p>

        {state.status === "loading" && (
          <p className="mt-10 text-sm text-neutral-400">Loading businesses...</p>
        )}
        {state.status === "error" && (
          <p className="mt-10 text-sm text-neutral-400">Could not load businesses.</p>
        )}
        {state.status === "ready" && state.businesses.length === 0 && (
          <p className="mt-10 text-sm text-neutral-400">No businesses yet.</p>
        )}

        {state.status === "ready" && state.businesses.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {state.businesses.map((b) => (
              <Link
                key={b.businessId}
                href={`/b/?id=${b.businessId}`}
                className="card-hover card flex items-start justify-between gap-4"
              >
                <div>
                  <p className="text-sm text-neutral-500">
                    {b.category} &middot; {b.city}
                  </p>
                  <h2 className="mt-0.5 text-lg font-bold text-neutral-900">{b.name}</h2>
                  <div className="mt-3 flex items-center gap-3">
                    <VerifiedBadge />
                    <span className="text-sm text-neutral-500">
                      {b.reviewCount} {b.reviewCount === 1 ? "review" : "reviews"}
                    </span>
                  </div>
                </div>
                <span className="bg-gradient-to-b from-neutral-900 to-neutral-700 bg-clip-text text-3xl font-bold leading-none text-transparent">
                  {b.overall.toFixed(1)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
