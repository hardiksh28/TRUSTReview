"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { isSignedIn, signOut } from "@/lib/auth";
import { RatingBar } from "@/components/RatingBar";
import { RotatingQr } from "@/components/RotatingQr";
import { FlaggedBadge, VerifiedBadge } from "@/components/VerifiedBadge";
import { Squiggle } from "@/components/Squiggle";
import { Logo } from "@/components/Logo";
import { getBrowserLocation } from "@/lib/geo";
import { track } from "@/lib/analytics";
import type { ProfileResponse, PublicReview, ReviewsResponse } from "@/lib/types";

type MyBusiness = { businessId: string; name: string; category: string; city: string };

const SELECTED_KEY = "trustreview_selected_business";

export default function DashboardPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [businesses, setBusinesses] = useState<MyBusiness[] | undefined>(undefined); // undefined = loading
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addingLocation, setAddingLocation] = useState(false);
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

  const loadBusinesses = useCallback(async () => {
    try {
      const res = await api.get<{ businesses: MyBusiness[] }>("/businesses/mine", true);
      setBusinesses(res.businesses);
      setSelectedId((prev) => {
        if (prev && res.businesses.some((b) => b.businessId === prev)) return prev;
        const stored = window.localStorage.getItem(SELECTED_KEY);
        if (stored && res.businesses.some((b) => b.businessId === stored)) return stored;
        return res.businesses[0]?.businessId ?? null;
      });
    } catch (err) {
      if (!(err instanceof ApiError)) console.error(err);
      setBusinesses([]);
    }
  }, []);

  useEffect(() => {
    if (!checkingAuth) loadBusinesses();
  }, [checkingAuth, loadBusinesses]);

  useEffect(() => {
    if (selectedId) window.localStorage.setItem(SELECTED_KEY, selectedId);
  }, [selectedId]);

  const business = businesses?.find((b) => b.businessId === selectedId) ?? null;

  const loadStats = useCallback(async () => {
    if (!selectedId) return;
    const [profileRes, reviewsRes] = await Promise.all([
      api.get<ProfileResponse>(`/businesses/${selectedId}`),
      api.get<ReviewsResponse>(`/businesses/${selectedId}/reviews`),
    ]);
    setProfile(profileRes);
    setReviews(reviewsRes.reviews);
  }, [selectedId]);

  useEffect(() => {
    if (selectedId) {
      loadStats();
      const interval = setInterval(loadStats, 15_000);
      return () => clearInterval(interval);
    }
  }, [selectedId, loadStats]);

  if (checkingAuth || businesses === undefined) {
    return <CenteredMessage>Loading dashboard...</CenteredMessage>;
  }

  if (businesses.length === 0) {
    return (
      <CreateBusinessForm
        heading="Set up your business"
        onCreated={(newId) => {
          setSelectedId(newId);
          loadBusinesses();
        }}
      />
    );
  }

  return (
    <main className="relative overflow-hidden">
      <div className="dot-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-72" />
      <Squiggle
        color="#F3B94D"
        className="pointer-events-none absolute -left-10 top-4 hidden w-56 -rotate-6 opacity-25 sm:block"
      />
      <Squiggle
        color="#14B8A6"
        flip
        className="pointer-events-none absolute -right-10 top-40 hidden w-56 rotate-6 opacity-20 sm:block"
      />

      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/" className="mb-6 inline-flex opacity-90 transition-opacity hover:opacity-100">
          <Logo markClassName="h-6 w-6" textClassName="text-base font-bold tracking-tight text-neutral-900" />
        </Link>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <select
              className="input w-auto py-2 pr-8 text-sm font-semibold"
              value={selectedId ?? ""}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {businesses.map((b) => (
                <option key={b.businessId} value={b.businessId}>
                  {b.name} &middot; {b.city || "No city set"}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setAddingLocation(true)}
              className="text-sm font-medium text-verified-700 hover:underline"
            >
              + Add location
            </button>
          </div>
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

        {addingLocation ? (
          <AddLocationCard
            onCreated={(newId) => {
              setAddingLocation(false);
              setSelectedId(newId);
              loadBusinesses();
            }}
            onCancel={() => setAddingLocation(false)}
          />
        ) : (
          business && (
            <>
              <div className="mb-8">
                <p className="text-sm text-neutral-500">{business.category} &middot; {business.city}</p>
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-neutral-900">{business.name}</h1>
                  <Link
                    href={`/b/?id=${business.businessId}`}
                    target="_blank"
                    className="text-sm font-medium text-verified-700 hover:underline"
                  >
                    View public profile
                  </Link>
                </div>
              </div>

              <section className="card-hover card mb-6">
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
                <section className="card-hover card mb-6 space-y-4">
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
                <section className="card-hover card mb-6">
                  <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                    AI summary
                  </h2>
                  <p className="text-sm leading-relaxed text-neutral-700">{profile.summary.summary}</p>
                </section>
              )}

              <section className="card-hover card">
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
            </>
          )
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card-hover card text-center">
      <p className="bg-gradient-to-b from-neutral-900 to-neutral-700 bg-clip-text text-3xl font-bold text-transparent">
        {value}
      </p>
      <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
        {label}
      </p>
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

function useLocationFormState() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function captureLocation() {
    setLocating(true);
    setLocationError(false);
    const loc = await getBrowserLocation(6000);
    setLocation(loc);
    setLocationError(!loc);
    setLocating(false);
  }

  async function submit(onCreated: (businessId: string) => void) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post<{ businessId: string }>(
        "/businesses",
        { name, category, city, ...(location ?? {}) },
        true
      );
      track("business_created", { businessId: res.businessId, hasLocation: !!location });
      onCreated(res.businessId);
    } catch {
      setError("Could not create your business. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return {
    name, setName, category, setCategory, city, setCity,
    location, locating, locationError, captureLocation,
    submitting, error, submit,
  };
}

function LocationFields({ f }: { f: ReturnType<typeof useLocationFormState> }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">Business name</label>
        <input required className="input" value={f.name} onChange={(e) => f.setName(e.target.value)} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">Category</label>
        <input
          className="input"
          placeholder="Restaurant, Salon, Cafe..."
          value={f.category}
          onChange={(e) => f.setCategory(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">City</label>
        <input className="input" value={f.city} onChange={(e) => f.setCity(e.target.value)} />
      </div>
      <div>
        <button
          type="button"
          onClick={f.captureLocation}
          disabled={f.locating}
          className="btn-secondary w-full py-2.5 text-xs"
        >
          {f.locating
            ? "Getting your location..."
            : f.location
              ? "Location captured"
              : "Use my current location (optional)"}
        </button>
        <p className="mt-1.5 text-xs text-neutral-400">
          {f.location
            ? "Helps flag reviews scanned far from this location for a moderator to check."
            : f.locationError
              ? "Could not get your location. You can skip this and add it later."
              : "Optional. Powers a soft fraud signal — never blocks a scan."}
        </p>
      </div>
      {f.error && <p className="text-sm text-reject-600">{f.error}</p>}
    </div>
  );
}

function CreateBusinessForm({
  heading,
  onCreated,
}: {
  heading: string;
  onCreated: (businessId: string) => void;
}) {
  const f = useLocationFormState();

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          f.submit(onCreated);
        }}
        className="w-full max-w-sm"
      >
        <h1 className="mb-1 text-xl font-bold text-neutral-900">{heading}</h1>
        <p className="mb-6 text-sm text-neutral-500">This creates your Trust Profile and QR code.</p>
        <div className="card space-y-4">
          <LocationFields f={f} />
          <button type="submit" disabled={f.submitting} className="btn-primary w-full">
            {f.submitting ? "Creating..." : "Create business"}
          </button>
        </div>
      </form>
    </main>
  );
}

function AddLocationCard({
  onCreated,
  onCancel,
}: {
  onCreated: (businessId: string) => void;
  onCancel: () => void;
}) {
  const f = useLocationFormState();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        f.submit(onCreated);
      }}
      className="card-hover card space-y-4"
    >
      <div>
        <h2 className="text-lg font-bold text-neutral-900">Add another location</h2>
        <p className="text-sm text-neutral-500">Each location gets its own QR code and Trust Profile.</p>
      </div>
      <LocationFields f={f} />
      <div className="flex gap-2">
        <button type="submit" disabled={f.submitting} className="btn-primary flex-1">
          {f.submitting ? "Creating..." : "Create location"}
        </button>
        <button type="button" className="btn-secondary flex-1" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-center">
      <p className="text-neutral-500">{children}</p>
    </main>
  );
}
