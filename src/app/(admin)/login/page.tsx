"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, Eye, EyeOff, ShieldAlert, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ADMIN_SESSION_STORAGE_KEY } from "@/components/admin/admin-session-guard";
import { BotanicalCanvas } from "@/components/ambient/botanical-canvas";

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

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-[11px] font-mono text-red-300 flex items-start space-x-2 rounded-[3px]">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              autoFocus
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter admin passkey..."
              className="w-full bg-black/40 border border-white/20 px-3.5 py-2.5 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-white/60 rounded-[3px] pr-10 tracking-widest placeholder:tracking-normal transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors cursor-pointer"
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
            disabled={loading || !passphrase}
            className="w-full h-11 bg-white text-[#041a24] hover:bg-neutral-100 active:scale-[0.99] font-mono text-xs uppercase tracking-[0.15em] font-semibold rounded-[3px] shadow-sm flex items-center justify-center space-x-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {loading ? "Verifying Passkey..." : "Unlock Studio →"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#041a24] text-white flex flex-col justify-center items-center px-4 py-12 selection:bg-white/20 selection:text-white">
      {/* 60fps Ambient Botanical Drift Canvas (Same as Intro) */}
      <BotanicalCanvas />

      <Suspense fallback={<div className="font-mono text-xs text-white/50">Loading Gateway...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
