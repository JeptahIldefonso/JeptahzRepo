"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, Eye, EyeOff, ShieldAlert, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ADMIN_SESSION_STORAGE_KEY } from "@/components/admin/admin-session-guard";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";
  const reason = searchParams.get("reason");

  const [passphrase, setPassphrase] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Authentication failed. Check your passphrase.");
        setLoading(false);
        return;
      }

      // Initialize tab-scoped session token in sessionStorage
      sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, "true");

      // Redirect into the protected admin studio
      router.push(from);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to reach authentication service.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <Link
        href="/home"
        className="inline-flex items-center space-x-1.5 font-mono text-xs text-fg-subtle hover:text-fg transition-colors mb-2"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Public Archive</span>
      </Link>

      <div className="border border-border bg-bg-raised p-8 sm:p-10 rounded-[2px] shadow-xl space-y-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-fg-subtle">
            <Lock className="w-3.5 h-3.5 text-accent" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
              Restricted Area
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-medium text-fg tracking-tight">
            Curator Access
          </h1>
          <p className="text-xs text-fg-muted leading-relaxed">
            Enter the master passkey to unlock the{" "}
            <span className="font-editorial italic text-sm text-fg font-normal">
              JeptahzRepo
            </span>{" "}
            curation studio.
          </p>
        </div>

        {/* Reason Notices */}
        {reason === "session_ended" && !error && (
          <div className="p-3 bg-bg border border-border/80 text-[11px] font-mono text-fg-muted flex items-start space-x-2 rounded-[2px]">
            <KeyRound className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <span>
              Session closed. Browsers reset authentication upon window or tab closure.
            </span>
          </div>
        )}

        {reason === "logged_out" && !error && (
          <div className="p-3 bg-bg border border-border/80 text-[11px] font-mono text-fg-muted flex items-start space-x-2 rounded-[2px]">
            <Lock className="w-4 h-4 text-fg-subtle shrink-0 mt-0.5" />
            <span>Studio successfully locked. Re-authenticate to access.</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 text-[11px] font-mono text-destructive flex items-start space-x-2 rounded-[2px]">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-fg-subtle block">
              Master Passphrase
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoFocus
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter admin passkey..."
                className="w-full bg-bg border border-border px-3.5 py-2.5 text-xs font-mono text-fg focus:outline-none focus:border-fg rounded-[2px] pr-10 tracking-widest placeholder:tracking-normal placeholder:text-fg-subtle/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle hover:text-fg transition-colors"
                title={showPassword ? "Hide passkey" : "Reveal passkey"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !passphrase}
            className="w-full font-mono text-xs tracking-wider uppercase py-5"
            size="md"
          >
            {loading ? "Verifying Passkey..." : "Unlock Studio →"}
          </Button>
        </form>

        <div className="pt-2 border-t border-border/50 text-center">
          <p className="font-mono text-[9px] text-fg-subtle uppercase tracking-wider">
            Protected by Session-Only Cryptographic Signature
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center items-center px-4 py-12">
      <Suspense fallback={<div className="font-mono text-xs text-fg-subtle">Loading Gateway...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
