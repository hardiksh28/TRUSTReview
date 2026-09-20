"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { getAnonIdentity } from "@/lib/anon";
import { getBrowserLocation } from "@/lib/geo";

type RedeemResponse = { redeemed: true; businessId: string; tokenId: string; usedAt: number };
type ProfileResponse = { business: { name: string } };

type State =
  | { status: "loading" }
  | { status: "success"; businessId: string; businessName: string | null }
  | { status: "already_used" }
  | { status: "expired" }
  | { status: "error" };

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <ScanShell tone="neutral">
          <div className="h-16 w-16 animate-pulse rounded-full bg-neutral-200" />
        </ScanShell>
      }
    >
      <ScanContent />
    </Suspense>
  );
}

function ScanContent() {
  const searchParams = useSearchParams();
  const tokenId = searchParams.get("token") ?? "";
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    if (!tokenId) {
      setState({ status: "error" });
      return;
    }
    let cancelled = false;

    async function redeem() {
      const { anonId } = getAnonIdentity();
      // Best-effort: if the browser grants location quickly, it's used as a
      // soft LOCATION_MISMATCH signal later. Never blocks or fails the scan
      // if denied, unavailable, or slow.
      const location = await getBrowserLocation(3000);
      try {
        const res = await api.post<RedeemResponse>(`/tokens/${tokenId}/redeem`, {
          who: anonId,
          ...(location ?? {}),
        });
        if (cancelled) return;

        window.sessionStorage.setItem(
          `trustreview_grant_${res.tokenId}`,
          JSON.stringify({ businessId: res.businessId, tokenId: res.tokenId })
        );

        let businessName: string | null = null;
        try {
          const profile = await api.get<ProfileResponse>(`/businesses/${res.businessId}`);
          businessName = profile.business.name;
        } catch {
          // Non-fatal: the success screen still works without a name.
        }

        if (!cancelled) setState({ status: "success", businessId: res.businessId, businessName });
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 409) {
          setState({ status: err.reason === "ALREADY_USED" ? "already_used" : "expired" });
        } else {
          setState({ status: "error" });
        }
      }
    }

    redeem();
    return () => {
      cancelled = true;
    };
  }, [tokenId]);

  if (state.status === "loading") {
    return (
      <ScanShell tone="neutral">
        <div className="h-16 w-16 animate-pulse rounded-full bg-neutral-200" />
        <p className="mt-6 text-lg font-medium text-neutral-500">Verifying your visit...</p>
      </ScanShell>
    );
  }

  if (state.status === "success") {
    return (
      <ScanShell tone="success">
        <CheckIcon />
        <h1 className="mt-6 text-2xl font-bold text-white">Visit verified</h1>
        <p className="mt-2 text-center text-verified-50">
          {state.businessName ? `Thanks for visiting ${state.businessName}.` : "Thanks for visiting."}{" "}
          You can now leave one review for this visit.
        </p>
        <Link
          href={`/review/?token=${tokenId}`}
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-verified-700 shadow-sm transition hover:bg-verified-50"
        >
          Leave a review
        </Link>
      </ScanShell>
    );
  }

  return (
    <ScanShell tone="reject">
      <CrossIcon />
      <h1 className="mt-6 text-2xl font-bold text-white">
        {state.status === "already_used" ? "This code has already been used" : "This code has expired"}
      </h1>
      <p className="mt-2 max-w-xs text-center text-reject-50">
        {state.status === "already_used"
          ? "Each QR code can verify exactly one visit. This one has already been spent."
          : "This code is no longer valid. Ask the business to show you their current code."}
      </p>
    </ScanShell>
  );
}

function ScanShell({
  tone,
  children,
}: {
  tone: "neutral" | "success" | "reject";
  children: React.ReactNode;
}) {
  const bg =
    tone === "success" ? "bg-verified-600" : tone === "reject" ? "bg-reject-600" : "bg-neutral-100";
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center px-6 text-center ${bg}`}
    >
      {children}
    </main>
  );
}

function CheckIcon() {
  return (
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
  );
}

function CrossIcon() {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15">
      <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-white">
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
