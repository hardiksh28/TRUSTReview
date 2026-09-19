import { VerifiedBadge } from "@/components/VerifiedBadge";
import type { PublicReview } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ReviewCard({ review }: { review: PublicReview }) {
  return (
    <article className="border-b border-neutral-100 py-6 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900">{review.authorName}</span>
            <span className="text-sm text-neutral-400">{formatDate(review.createdAt)}</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-semibold text-verified-700">
              {review.overall.toFixed(1)} / 5
            </span>
            {review.verified && <VerifiedBadge />}
          </div>
        </div>
      </div>

      <p className="mt-3 leading-relaxed text-neutral-700">{review.text}</p>

      {review.response && (
        <div className="mt-4 rounded-xl bg-neutral-50 p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Response from the business
          </p>
          <p className="text-sm text-neutral-700">{review.response.text}</p>
        </div>
      )}
    </article>
  );
}
