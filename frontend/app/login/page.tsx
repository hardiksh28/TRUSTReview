"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { confirmSignUp, signIn, signUp } from "@/lib/auth";
import { Squiggle } from "@/components/Squiggle";
import { Logo } from "@/components/Logo";
import { track } from "@/lib/analytics";

type Mode = "signin" | "signup" | "confirm";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      track("signed_in");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Could not sign in. Check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signUp(email, password);
      track("signup_started");
      setInfo("We sent a confirmation code to your email.");
      setMode("confirm");
    } catch (err: any) {
      setError(err?.message ?? "Could not create your account.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await confirmSignUp(email, code);
      track("signup_confirmed");
      setInfo("Account confirmed. You can sign in now.");
      setMode("signin");
    } catch (err: any) {
      setError(err?.message ?? "Could not confirm your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div className="dot-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-full" />
      <Squiggle
        color="#F3B94D"
        className="pointer-events-none absolute -left-12 top-8 hidden w-56 -rotate-6 opacity-20 sm:block"
      />
      <Squiggle
        color="#14B8A6"
        flip
        className="pointer-events-none absolute -right-12 bottom-8 hidden w-56 rotate-6 opacity-20 sm:block"
      />

      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>

        <div className="card">
          <h1 className="mb-1 text-xl font-semibold text-neutral-900">
            {mode === "signin" && "Business sign in"}
            {mode === "signup" && "Create your business account"}
            {mode === "confirm" && "Confirm your email"}
          </h1>
          <p className="mb-6 text-sm text-neutral-500">
            {mode === "confirm"
              ? `Enter the code we sent to ${email}.`
              : "Owners sign in here to manage their QR code and reviews."}
          </p>

          {mode !== "confirm" && (
            <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
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
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                />
              </div>
              {error && <p className="text-sm text-reject-600">{error}</p>}
              {info && <p className="text-sm text-verified-700">{info}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>
          )}

          {mode === "confirm" && (
            <form onSubmit={handleConfirm} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Confirmation code
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-reject-600">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Please wait..." : "Confirm"}
              </button>
            </form>
          )}

          <button
            type="button"
            className="mt-6 w-full text-center text-sm font-medium text-verified-700 hover:underline"
            onClick={() => {
              setError(null);
              setInfo(null);
              setMode(mode === "signin" ? "signup" : "signin");
            }}
          >
            {mode === "signin" ? "New business? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </main>
  );
}
