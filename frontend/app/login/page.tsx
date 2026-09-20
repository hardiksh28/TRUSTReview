"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { confirmPasswordReset, confirmSignUp, requestPasswordReset, signIn, signUp } from "@/lib/auth";
import { Squiggle } from "@/components/Squiggle";
import { Logo } from "@/components/Logo";
import { track } from "@/lib/analytics";

type Mode = "signin" | "signup" | "confirm" | "forgot" | "forgot_confirm";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function switchMode(next: Mode) {
    setError(null);
    setInfo(null);
    setMode(next);
  }

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

  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setInfo("We sent a password reset code to your email.");
      setMode("forgot_confirm");
    } catch (err: any) {
      setError(err?.message ?? "Could not start a password reset.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await confirmPasswordReset(email, code, newPassword);
      setInfo("Password reset. You can sign in now.");
      setPassword("");
      setNewPassword("");
      setCode("");
      setMode("signin");
    } catch (err: any) {
      setError(err?.message ?? "Could not reset your password.");
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
            {mode === "forgot" && "Reset your password"}
            {mode === "forgot_confirm" && "Choose a new password"}
          </h1>
          <p className="mb-6 text-sm text-neutral-500">
            {mode === "confirm" && `Enter the code we sent to ${email}.`}
            {mode === "forgot" && "Enter your email and we'll send you a reset code."}
            {mode === "forgot_confirm" && `Enter the code we sent to ${email} and a new password.`}
            {(mode === "signin" || mode === "signup") &&
              "Owners sign in here to manage their QR code and reviews."}
          </p>

          {(mode === "signin" || mode === "signup") && (
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
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-sm font-medium text-neutral-700">Password</label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      className="text-xs font-medium text-verified-700 hover:underline"
                      onClick={() => switchMode("forgot")}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
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
              {mode === "signup" && (
                <p className="text-center text-xs text-neutral-400">
                  By creating an account you agree to our{" "}
                  <Link href="/terms" className="text-verified-700 hover:underline">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-verified-700 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              )}
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

          {mode === "forgot" && (
            <form onSubmit={handleRequestReset} className="space-y-4">
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
              {error && <p className="text-sm text-reject-600">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Please wait..." : "Send reset code"}
              </button>
            </form>
          )}

          {mode === "forgot_confirm" && (
            <form onSubmit={handleConfirmReset} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Reset code
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  New password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  className="input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              {error && <p className="text-sm text-reject-600">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Please wait..." : "Reset password"}
              </button>
            </form>
          )}

          <button
            type="button"
            className="mt-6 w-full text-center text-sm font-medium text-verified-700 hover:underline"
            onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "New business? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </main>
  );
}
