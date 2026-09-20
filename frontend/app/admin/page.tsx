"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { isAdmin, isSignedIn } from "@/lib/auth";

type FlaggedReview = {
  reviewId: string;
  businessId: string;
  authorName: string;
  text: string;
  overall: number;
  riskScore: number;
  riskSignals: string[];
  hidden: boolean;
  createdAt: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [reviews, setReviews] = useState<FlaggedReview[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get<{ reviews: FlaggedReview[] }>("/admin/flagged", true);
      setReviews(res.reviews);
    } catch {
      setError("Could not load flagged reviews.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      const signedIn = await isSignedIn();
      if (!signedIn) {
        router.push("/login");
        return;
      }
      const admin = await isAdmin();
      if (!admin) {
        setError("This account does not have admin access.");
        setChecking(false);
        return;
      }
      setChecking(false);
      load();
    })();
  }, [router, load]);

  async function setHidden(reviewId: string, hidden: boolean) {
    setReviews((prev) =>
      prev ? prev.map((r) => (r.reviewId === reviewId ? { ...r, hidden } : r)) : prev
    );
    try {
      await api.patch(`/admin/reviews/${reviewId}`, { hidden }, true);
    } catch {
      load();
    }
  }

  if (checking) return <CenteredMessage>Loading...</CenteredMessage>;
  if (error) return <CenteredMessage>{error}</CenteredMessage>;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-1 text-2xl font-bold text-neutral-900">Flagged reviews</h1>
      <p className="mb-8 text-sm text-neutral-500">
        Reviews with two or more risk signals. We flag, you decide. Nothing is auto-hidden.
      </p>

      {reviews === null && <p className="text-sm text-neutral-400">Loading...</p>}
      {reviews?.length === 0 && (
        <p className="text-sm text-neutral-400">No flagged reviews right now.</p>
      )}

      <div className="space-y-4">
        {reviews?.map((review) => (
          <div key={review.reviewId} className="card">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-neutral-900">{review.authorName}</span>
              <span className="text-sm font-semibold text-neutral-700">
                {review.overall.toFixed(1)}/5
              </span>
              <span className="rounded-full bg-reject-50 px-2.5 py-1 text-xs font-semibold text-reject-700">
                Risk {review.riskScore}
              </span>
              {review.riskSignals.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
                >
                  {s}
                </span>
              ))}
              {review.hidden && (
                <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500">
                  Hidden
                </span>
              )}
            </div>

            <p className="mt-3 text-sm leading-relaxed text-neutral-700">{review.text}</p>
            <p className="mt-2 text-xs text-neutral-400">Business: {review.businessId}</p>

            <div className="mt-4 flex gap-2">
              {review.hidden ? (
                <button className="btn-secondary py-2 text-xs" onClick={() => setHidden(review.reviewId, false)}>
                  Keep visible
                </button>
              ) : (
                <button
                  className="rounded-xl bg-reject-600 px-4 py-2 text-xs font-semibold text-white hover:bg-reject-700"
                  onClick={() => setHidden(review.reviewId, true)}
                >
                  Hide review
                </button>
              )}
            </div>
          </div>
        ))}
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
