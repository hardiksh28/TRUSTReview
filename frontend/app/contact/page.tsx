"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { track } from "@/lib/analytics";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post("/contact", { name, email, message });
      track("contact_form_submitted");
      setSent(true);
    } catch {
      setError("Could not send your message. Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center text-lg font-bold text-neutral-900">
          TrustReview
        </Link>

        <div className="card">
          {sent ? (
            <div className="py-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-verified-50">
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-verified-600">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h1 className="mt-4 text-xl font-semibold text-neutral-900">Message sent</h1>
              <p className="mt-2 text-sm text-neutral-500">
                Thanks for reaching out. I&apos;ll get back to you soon.
              </p>
              <Link href="/" className="btn-secondary mt-6 inline-flex">
                Back to home
              </Link>
            </div>
          ) : (
            <>
              <h1 className="mb-1 text-xl font-semibold text-neutral-900">Contact</h1>
              <p className="mb-6 text-sm text-neutral-500">
                Questions, feedback, or want to bring TrustReview to your business? Send a message.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Name</label>
                  <input
                    required
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Email</label>
                  <input
                    type="email"
                    required
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    maxLength={5000}
                    className="input resize-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-reject-600">{error}</p>}
                <button type="submit" disabled={submitting} className="btn-primary w-full">
                  {submitting ? "Sending..." : "Send message"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
