"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { api } from "@/lib/api";

const ROTATE_MS = 60_000;
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type IssueTokenResponse = { tokenId: string; businessId: string; issuedAt: number; expiresAt: number };

export function RotatingQr({ businessId }: { businessId: string }) {
  const [tokenId, setTokenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(1); // 1 -> 0 over ROTATE_MS

  const rotate = useCallback(async () => {
    try {
      const res = await api.post<IssueTokenResponse>(
        `/businesses/${businessId}/tokens`,
        undefined,
        true
      );
      setTokenId(res.tokenId);
      setError(null);
    } catch {
      setError("Could not issue a new code. Retrying...");
    }
  }, [businessId]);

  const rotateRef = useRef(rotate);
  rotateRef.current = rotate;

  useEffect(() => {
    rotateRef.current();
    const rotateInterval = setInterval(() => rotateRef.current(), ROTATE_MS);
    return () => clearInterval(rotateInterval);
  }, [businessId]);

  useEffect(() => {
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = (Date.now() - start) % ROTATE_MS;
      setProgress(1 - elapsed / ROTATE_MS);
    }, 200);
    return () => clearInterval(tick);
  }, [tokenId]);

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const qrValue = tokenId ? `${siteUrl}/scan/?token=${tokenId}` : "";
  const offset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex h-56 w-56 items-center justify-center">
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#E8F3EC" strokeWidth="4" />
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke="#0B6B3A"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 200ms linear" }}
          />
        </svg>
        <div className="flex h-44 w-44 items-center justify-center rounded-xl bg-white p-3">
          {qrValue ? (
            <QRCodeSVG value={qrValue} size={168} fgColor="#111827" bgColor="#ffffff" />
          ) : (
            <div className="h-full w-full animate-pulse rounded-lg bg-neutral-100" />
          )}
        </div>
      </div>
      <p className="text-center text-sm text-neutral-500">
        New code every 60 seconds &middot; each code works for one scan
      </p>
      {error && <p className="text-sm text-reject-600">{error}</p>}
    </div>
  );
}
