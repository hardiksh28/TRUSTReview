"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { getAnonIdentity } from "@/lib/anon";
import { RatingSlider } from "@/components/RatingSlider";
import { track } from "@/lib/analytics";

type Grant = { businessId: string; tokenId: string };

export default function ReviewPage() {
  return (
    <Suspense fallback={<CenteredMessage>Loading...</CenteredMessage>}>
      <ReviewContent />
    </Suspense>
  );
}

function ReviewContent() {
  const searchParams = useSearchParams();
  const tokenId = searchParams.get("token") ?? "";
  const router = useRouter();

  const [grant, setGrant] = useState<Grant | null | undefined>(undefined); // undefined = checking
  const [food, setFood] = useState(4);
  const [service, setService] = useState(4);
  const [cleanliness, setCleanliness] = useState(4);
  const [value, setValue] = useState(4);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!tokenId) {
      setGrant(null);
      return;
    }
    const raw = window.sessionStorage.getItem(`trustreview_grant_${tokenId}`);
    setGrant(raw ? JSON.parse(raw) : null);
  }, [tokenId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!grant) return;
    if (text.trim().length === 0) {
      setError("Please add a few words about your visit.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const { anonId, anonSince } = getAnonIdentity();
      await api.post("/reviews", {
        tokenId: grant.tokenId,
        businessId: grant.businessId,
        ratings: { food, service, cleanliness, value },
        text: text.trim(),
        anonId,
        anonSince,
      });
      track("review_submitted", { businessId: grant.businessId });
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError && err.reason === "ALREADY_REVIEWED") {
        setError("A review has already been submitted for this visit.");
      } else {
        setError("Could not submit your review. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (grant === undefined) {
    return <CenteredMessage>Loading...</CenteredMessage>;
  }

  if (grant === null) {
    return (
      <CenteredMessage>
        Scan the QR code at the business to start your review. This page only works right after a
        code is verified.
      </CenteredMessage>
    );
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-verified-600 px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15">
          <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-white">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="mt-6 text-2xl font-bold text-white">Thanks for your review</h1>
        <p className="mt-2 text-verified-50">It&apos;s live on the business&apos;s Trust Profile now.</p>
        <button
          onClick={() => router.push(`/b/?id=${grant.businessId}`)}
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-verified-700 shadow-sm transition hover:bg-verified-50"
        >
          View Trust Profile
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-8">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <h1 className="mb-1 text-xl font-bold text-neutral-900">How was your visit?</h1>
        <p className="mb-6 text-sm text-neutral-500">
          Your review is tied to a verified visit and cannot be edited later.
        </p>

        <div className="card space-y-5">
          <RatingSlider label="Food" value={food} onChange={setFood} />
          <RatingSlider label="Service" value={service} onChange={setService} />
          <RatingSlider label="Cleanliness" value={cleanliness} onChange={setCleanliness} />
          <RatingSlider label="Value" value={value} onChange={setValue} />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Tell us about it
            </label>
            <textarea
              required
              rows={4}
              maxLength={2000}
              className="input resize-none"
              placeholder="What stood out about the food, service, cleanliness or value?"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-reject-600">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Submitting..." : "Submit review"}
          </button>
        </div>
      </form>
    </main>
  );
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-center">
      <p className="max-w-xs text-neutral-500">{children}</p>
    </main>
  );
}
