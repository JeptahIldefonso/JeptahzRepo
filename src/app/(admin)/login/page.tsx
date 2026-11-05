"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldAlert,
  KeyRound,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ADMIN_SESSION_STORAGE_KEY } from "@/components/admin/admin-session-guard";
import { AmbientBackground } from "@/components/ambient/ambient-background";

function LoginForm() {
  const searchParams = useSearchParams();
  const rawFrom = searchParams.get("from");
  // Validate relative path to prevent open redirect vulnerabilities and redirect loops
  const from =
    rawFrom &&
    rawFrom.startsWith("/") &&
    !rawFrom.startsWith("//") &&
    !rawFrom.startsWith("/\\") &&
    !rawFrom.startsWith("/login")
      ? rawFrom
      : "/admin";
  const reason = searchParams.get("reason");

  const [passphrase, setPassphrase] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Synchronous submission lock ref to prevent double-submitting even on rapid Enter keypresses
  const isSubmittingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on initial mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent any duplicate requests or interrupted checking
    if (isSubmittingRef.current || isChecking || isSuccess) {
      return;
    }

    const trimmedPass = passphrase.trim();
    if (!trimmedPass) {
      setError("Please enter your admin passkey.");
      inputRef.current?.focus();
      return;
    }

    // Lock synchronous ref and set checking state
    isSubmittingRef.current = true;
    setIsChecking(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase: trimmedPass }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Wrong password or rate limit
        const remaining = data.remainingAttempts;
        const remainingNotice =
          typeof remaining === "number" && remaining < 5
            ? ` (${remaining} attempt${remaining === 1 ? "" : "s"} left)`
            : "";

        if (res.status === 401) {
          setError(
            `Wrong passkey entered. Please try again.${remainingNotice}`
          );
        } else if (res.status === 429) {
          setError(
            data.error || "Too many failed attempts. Please wait before trying again."
          );
        } else {
          setError(data.error || "Authentication failed. Check your passkey.");
        }

        // Reset password field so user can re-enter immediately without backspacing
        setPassphrase("");
        setIsChecking(false);
        isSubmittingRef.current = false;

        // Auto-refocus the input field
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
        return;
      }

      // Passkey verified successfully
      setIsSuccess(true);

      // Initialize tab-scoped session token in sessionStorage
      try {
        sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, "true");
      } catch {
        // Graceful fallback if sessionStorage is restricted by browser policy
      }

      // Automatically navigate / refresh directly into the admin studio.
      // Full document location change ensures the newly set HttpOnly auth cookie
      // is transmitted in the top-level request, cleanly bypassing any cached redirects.
      window.location.href = from;

      // Fallback timer ensures navigation executes even if initial trigger is delayed
      setTimeout(() => {
        window.location.assign(from);
      }, 400);
    } catch (err: any) {
      setError(
        err.message || "Failed to reach authentication service. Please check your connection."
      );
      setIsChecking(false);
      isSubmittingRef.current = false;
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-md space-y-6">
      <Link
        href="/home"
        className="inline-flex items-center space-x-1.5 font-mono text-xs text-white/70 hover:text-white transition-colors mb-2"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Public Archive</span>
      </Link>

      <div className="relative w-full bg-[#041a24]/85 hover:bg-[#041a24]/95 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-[6px] p-8 sm:p-10 space-y-6 transition-all duration-300 before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent overflow-hidden">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-white/60">
            <Lock className="w-3.5 h-3.5 text-white/80" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
              Restricted Area
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-medium text-white tracking-tight">
            Jeptah <span className="font-mono text-lg sm:text-xl font-normal text-white/70">(adminPanel)</span>
          </h1>
          <p className="text-xs text-white/70 leading-relaxed">
            Enter the master passkey to unlock the{" "}
            <span className="font-editorial italic text-sm text-white font-normal">
              JeptahzRepo
            </span>{" "}
            curation studio.
          </p>
        </div>

        {/* Reason Notices */}
        {reason === "session_ended" && !error && (
          <div className="p-3 bg-white/5 border border-white/15 text-[11px] font-mono text-white/80 flex items-start space-x-2 rounded-[3px]">
            <KeyRound className="w-4 h-4 text-white/90 shrink-0 mt-0.5" />
            <span>
              Session closed. Browsers reset authentication upon window or tab closure.
            </span>
          </div>
        )}

        {reason === "logged_out" && !error && (
          <div className="p-3 bg-white/5 border border-white/15 text-[11px] font-mono text-white/80 flex items-start space-x-2 rounded-[3px]">
            <Lock className="w-4 h-4 text-white/70 shrink-0 mt-0.5" />
            <span>Studio successfully locked. Re-authenticate to access.</span>
          </div>
        )}

        {/* Wrong Password / Error message */}
        {error && (
          <div className="p-3.5 bg-red-500/15 border border-red-500/40 text-xs font-mono text-red-200 flex items-start space-x-2.5 rounded-[3px] animate-in fade-in slide-in-from-top-1 duration-200">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <input
              ref={inputRef}
              type={showPassword ? "text" : "password"}
              required
              disabled={isChecking || isSuccess}
              value={passphrase}
              onChange={(e) => {
                setPassphrase(e.target.value);
                if (error) setError(null);
              }}
              placeholder={isChecking ? "Checking passkey..." : "Enter admin passkey..."}
              className={`w-full bg-black/40 border px-3.5 py-2.5 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none rounded-[3px] pr-10 tracking-widest placeholder:tracking-normal transition-all ${
                error
                  ? "border-red-500/60 focus:border-red-400 bg-red-950/20"
                  : isSuccess
                  ? "border-emerald-500/60 focus:border-emerald-400 bg-emerald-950/20"
                  : "border-white/20 focus:border-white/60"
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              disabled={isChecking || isSuccess}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
              title={showPassword ? "Hide passkey" : "Reveal passkey"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          <Button
            type="submit"
            disabled={isChecking || isSuccess || !passphrase.trim()}
            className={`w-full h-11 font-mono text-xs uppercase tracking-[0.15em] font-semibold rounded-[3px] shadow-sm flex items-center justify-center space-x-2 transition-all ${
              isSuccess
                ? "bg-emerald-600 hover:bg-emerald-600 text-white cursor-wait"
                : isChecking
                ? "bg-white/90 text-[#041a24] cursor-wait"
                : "bg-white text-[#041a24] hover:bg-neutral-100 active:scale-[0.99] cursor-pointer"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Authorized • Opening Studio...</span>
              </>
            ) : isChecking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#041a24]" />
                <span>Checking Passkey...</span>
              </>
            ) : (
              <span>Unlock Studio →</span>
            )}
          </Button>

          {isSuccess && (
            <p className="text-center text-[11px] font-mono text-emerald-300/90 animate-pulse">
              ✓ Verified! Auto-refreshing into Curator Studio...
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#041a24] text-white flex flex-col justify-center items-center px-4 py-12 selection:bg-white/20 selection:text-white">
      {/* 60fps Ambient Botanical Drift Canvas */}
      <AmbientBackground />

      <Suspense fallback={<div className="font-mono text-xs text-white/50">Loading Gateway...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
