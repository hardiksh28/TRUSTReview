"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Can't someone just photograph the QR code and share it?",
    a: "They can, and it buys them nothing. Each code is single-use and expires within the hour. The first person to redeem it is the only one who ever can — enforced by a conditional write at the database level, not by application logic that could be bypassed.",
  },
  {
    q: "The business controls the QR code, so can't they only show it to happy customers?",
    a: "That's exactly why review conversion is a public number on every Trust Profile. A business issuing 300 codes and collecting 12 five-star reviews is visible to anyone looking. We surface that selection bias instead of hiding it.",
  },
  {
    q: "Is the fraud detection AI-powered?",
    a: "No, deliberately. It's four transparent, deterministic rules — not a black-box model. A business can see exactly why a review was flagged and contest it. We flag; a human moderator always decides.",
  },
  {
    q: "How is this different from Google or Yelp reviews?",
    a: "Those platforms let anyone write a review for any business with no proof of a visit, and catch fraud after the fact with pattern detection. TrustReview makes the visit itself the prerequisite — a review can't be created without first consuming a proof-of-visit token.",
  },
  {
    q: "What does a business need to get started?",
    a: "Just a screen or tablet at the counter to display the rotating code. No app installs for customers, no account needed to leave a review.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <h2 className="text-center text-2xl font-bold text-neutral-900 sm:text-3xl">
        Frequently asked questions
      </h2>

      <div className="card mt-10 divide-y divide-neutral-100 overflow-hidden p-0">
        {FAQS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-neutral-50"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-semibold text-neutral-900">{item.q}</span>
                <span
                  className={`shrink-0 text-neutral-400 transition-transform ${isOpen ? "rotate-45" : ""}`}
                >
                  <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                    <path
                      d="M10 4v12M4 10h12"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </button>
              {isOpen && (
                <p className="px-6 pb-5 text-sm leading-relaxed text-neutral-600">{item.a}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
