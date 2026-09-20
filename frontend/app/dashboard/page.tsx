"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { isSignedIn, signOut } from "@/lib/auth";
import { RatingBar } from "@/components/RatingBar";
import { RotatingQr } from "@/components/RotatingQr";
import { FlaggedBadge, VerifiedBadge } from "@/components/VerifiedBadge";
import type { ProfileResponse, PublicReview, ReviewsResponse } from "@/lib/types";

type MyBusiness = { businessId: string; name: string; category: string; city: string };

export default function DashboardPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [business, setBusiness] = useState<MyBusiness | null | undefined>(undefined); // undefined = loading
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [reviews, setReviews] = useState<PublicReview[]>([]);

  useEffect(() => {
    (async () => {
      const signedIn = await isSignedIn();
      if (!signedIn) {
        router.push("/login");
        return;
      }
      setCheckingAuth(false);
    })();
  }, [router]);

  const loadBusiness = useCallback(async () => {
    try {
      const res = await api.get<{ business: MyBusiness }>("/businesses/mine", true);
      setBusiness(res.business);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setBusiness(null);
      } else {
        setBusiness(null);
      }
    }
  }, []);

  useEffect(() => {
    if (!checkingAuth) loadBusiness();
  }, [checkingAuth, loadBusiness]);

  const loadStats = useCallback(async () => {
    if (!business) return;
    const [profileRes, reviewsRes] = await Promise.all([
      api.get<ProfileResponse>(`/businesses/${business.businessId}`),
      api.get<ReviewsResponse>(`/businesses/${business.businessId}/reviews`),
    ]);
    setProfile(profileRes);
    setReviews(reviewsRes.reviews);
  }, [business]);

  useEffect(() => {
    if (business) {
      loadStats();
      const interval = setInterval(loadStats, 15_000);
      return () => clearInterval(interval);
    }
  }, [business, loadStats]);

  if (checkingAuth || business === undefined) {
    return <CenteredMessage>Loading dashboard...</CenteredMessage>;
  }

  if (business === null) {
    return <CreateBusinessForm onCreated={loadBusiness} />;
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">{business.category} &middot; {business.city}</p>
          <h1 className="text-2xl font-bold text-neutral-900">{business.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/b/?id=${business.businessId}`}
            target="_blank"
            className="text-sm font-medium text-verified-700 hover:underline"
          >
            View public profile
          </Link>
          <button
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
            className="text-sm font-medium text-neutral-400 hover:text-neutral-600"
          >
            Sign out
          </button>
        </div>
      </div>

      <section className="card mb-6">
        <RotatingQr businessId={business.businessId} />
      </section>

      {profile && (
        <section className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Stat label="Verified visits" value={profile.visitCount} />
          <Stat label="Reviews" value={profile.reviewCount} />
          <Stat label="Conversion" value={`${profile.conversionPct}%`} />
        </section>
      )}

      {profile && (
        <section className="card mb-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Rating breakdown
          </h2>
          <RatingBar label="Food" value={profile.subRatings.food} />
          <RatingBar label="Service" value={profile.subRatings.service} />
          <RatingBar label="Cleanliness" value={profile.subRatings.cleanliness} />
          <RatingBar label="Value" value={profile.subRatings.value} />
        </section>
      )}

      {profile?.summary && (
        <section className="card mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            AI summary
          </h2>
          <p className="text-sm leading-relaxed text-neutral-700">{profile.summary.summary}</p>
        </section>
      )}

      <section className="card">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Recent reviews
        </h2>
        {reviews.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-400">No reviews yet.</p>
        ) : (
          <div>
            {reviews.map((review) => (
              <OwnerReviewRow key={review.reviewId} review={review} onResponded={loadStats} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card text-center">
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
    </div>
  );
}

function OwnerReviewRow({
  review,
  onResponded,
}: {
  review: PublicReview;
  onResponded: () => void;
}) {
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/reviews/${review.reviewId}/response`, { text: text.trim() }, true);
      setReplying(false);
      onResponded();
    } catch {
      setError("Could not send your reply.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <article className="border-b border-neutral-100 py-5 last:border-0">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-neutral-900">{review.authorName}</span>
        <span className="text-sm font-semibold text-verified-700">{review.overall.toFixed(1)}/5</span>
        <VerifiedBadge />
        {review.flagged && <FlaggedBadge />}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-neutral-700">{review.text}</p>

      {review.response ? (
        <div className="mt-3 rounded-xl bg-neutral-50 p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Your response
          </p>
          <p className="text-sm text-neutral-700">{review.response.text}</p>
        </div>
      ) : replying ? (
        <form onSubmit={submitReply} className="mt-3 space-y-2">
          <textarea
            rows={2}
            className="input resize-none"
            placeholder="Reply once, publicly, as the business."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {error && <p className="text-xs text-reject-600">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="btn-primary py-2 text-xs">
              {submitting ? "Sending..." : "Send reply"}
            </button>
            <button
              type="button"
              className="btn-secondary py-2 text-xs"
              onClick={() => setReplying(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          className="mt-2 text-xs font-medium text-verified-700 hover:underline"
          onClick={() => setReplying(true)}
        >
          Reply
        </button>
      )}
    </article>
  );
}

function CreateBusinessForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post("/businesses", { name, category, city }, true);
      onCreated();
    } catch {
      setError("Could not create your business. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h1 className="mb-1 text-xl font-bold text-neutral-900">Set up your business</h1>
        <p className="mb-6 text-sm text-neutral-500">
          This creates your Trust Profile and QR code.
        </p>
        <div className="card space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Business name
            </label>
            <input required className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Category</label>
            <input
              className="input"
              placeholder="Restaurant, Salon, Cafe..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">City</label>
            <input className="input" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          {error && <p className="text-sm text-reject-600">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Creating..." : "Create business"}
          </button>
        </div>
      </form>
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
