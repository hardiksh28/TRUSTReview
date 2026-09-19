import { notFound } from "next/navigation";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { RatingBar } from "@/components/RatingBar";
import { ReviewCard } from "@/components/ReviewCard";
import type { ProfileResponse, ReviewsResponse } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

async function getProfile(id: string): Promise<ProfileResponse | null> {
  const res = await fetch(`${API_URL}/businesses/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load business profile");
  return res.json();
}

async function getReviews(id: string): Promise<ReviewsResponse> {
  const res = await fetch(`${API_URL}/businesses/${id}/reviews`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load reviews");
  return res.json();
}

export default async function TrustProfilePage({ params }: { params: { id: string } }) {
  const profile = await getProfile(params.id);
  if (!profile) notFound();

  const { reviews } = await getReviews(params.id);

  const { business, overall, subRatings, visitCount, reviewCount, conversionPct, summary } =
    profile;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
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
      <section className="card mb-6">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center">
            <span className="text-6xl font-bold leading-none text-neutral-900">
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
        <section className="card mb-6">
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
      <section className="card">
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
    </main>
  );
}
