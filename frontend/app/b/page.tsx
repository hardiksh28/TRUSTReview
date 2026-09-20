"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { RatingBar } from "@/components/RatingBar";
import { ReviewCard } from "@/components/ReviewCard";
import { Squiggle } from "@/components/Squiggle";
import { api } from "@/lib/api";
import type { ProfileResponse, ReviewsResponse } from "@/lib/types";

export default function TrustProfilePage() {
  return (
    <Suspense fallback={<CenteredMessage>Loading...</CenteredMessage>}>
      <TrustProfileContent />
    </Suspense>
  );
}

function TrustProfileContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "not_found" }
    | { status: "error" }
    | { status: "ready"; profile: ProfileResponse; reviews: ReviewsResponse["reviews"] }
  >({ status: "loading" });

  useEffect(() => {
    if (!id) {
      setState({ status: "not_found" });
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const [profile, reviewsRes] = await Promise.all([
          api.get<ProfileResponse>(`/businesses/${id}`),
          api.get<ReviewsResponse>(`/businesses/${id}/reviews`),
        ]);
        if (!cancelled) setState({ status: "ready", profile, reviews: reviewsRes.reviews });
      } catch (err: any) {
        if (cancelled) return;
        if (err?.status === 404) setState({ status: "not_found" });
        else setState({ status: "error" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state.status === "loading") return <CenteredMessage>Loading...</CenteredMessage>;
  if (state.status === "not_found") return <CenteredMessage>Business not found.</CenteredMessage>;
  if (state.status === "error") return <CenteredMessage>Could not load this Trust Profile.</CenteredMessage>;

  const { business, overall, subRatings, visitCount, reviewCount, conversionPct, summary } =
    state.profile;
  const reviews = state.reviews;

  return (
    <main className="relative overflow-hidden">
      <div className="dot-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-80" />
      <Squiggle
        color="#7C6FF0"
        className="pointer-events-none absolute -left-12 top-0 hidden w-60 -rotate-6 opacity-20 sm:block"
      />
      <Squiggle
        color="#FF7A59"
        flip
        className="pointer-events-none absolute -right-12 top-52 hidden w-60 rotate-6 opacity-20 sm:block"
      />

      <div className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
        {/* Header */}
        <header className="mb-10">
          <p className="text-sm font-medium text-neutral-500">{business.category} &middot; {business.city}</p>
          <h1 className="mt-1 text-3xl font-bold text-neutral-900">{business.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <VerifiedBadge />
            <span className="text-sm text-neutral-500">{visitCount} verified visits</span>
          </div>
        </header>

        {/* Score */}
        <section className="card-hover card mb-6">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center">
              <span className="bg-gradient-to-b from-neutral-900 to-neutral-700 bg-clip-text text-6xl font-bold leading-none text-transparent">
                {overall.toFixed(1)}
              </span>
              <span className="mt-1 text-sm text-neutral-500">out of 5</span>
              <span className="mt-3 text-sm font-medium text-neutral-600">
                {reviewCount} verified {reviewCount === 1 ? "review" : "reviews"}
              </span>
            </div>

            <div className="flex-1 space-y-4">
              <RatingBar label="Food" value={subRatings.food} />
              <RatingBar label="Service" value={subRatings.service} />
              <RatingBar label="Cleanliness" value={subRatings.cleanliness} />
              <RatingBar label="Value" value={subRatings.value} />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3">
            <span className="text-sm text-neutral-600">Review conversion</span>
            <span className="text-sm font-semibold text-neutral-900">
              {conversionPct}%{" "}
              <span className="font-normal text-neutral-400">
                ({reviewCount} of {visitCount} visits)
              </span>
            </span>
          </div>
        </section>

        {/* AI summary */}
        {summary && (
          <section className="card-hover card mb-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              What customers say
            </h2>
            <p className="leading-relaxed text-neutral-800">{summary.summary}</p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-verified-700">
                  Positives
                </p>
                <ul className="space-y-1.5">
                  {summary.positives.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-neutral-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-verified-600" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-600">
                  Concerns
                </p>
                <ul className="space-y-1.5">
                  {summary.concerns.map((c) => (
                    <li key={c} className="flex items-center gap-2 text-sm text-neutral-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className="card-hover card">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Reviews
          </h2>
          {reviews.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-400">No reviews yet.</p>
          ) : (
            <div>
              {reviews.map((review) => (
                <ReviewCard key={review.reviewId} review={review} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-center">
      <p className="text-neutral-500">{children}</p>
    </main>
  );
}
