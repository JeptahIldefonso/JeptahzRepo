"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    if (supabase) {
      try {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }

        router.push("/admin");
        return;
      } catch (err: any) {
        setError(err.message || "Failed to authenticate with Supabase");
        setLoading(false);
        return;
      }
    }

    // Mock authentication bypass if Supabase is not configured
    setTimeout(() => {
      setLoading(false);
      router.push("/admin");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <Link
          href="/home"
          className="inline-flex items-center space-x-1.5 font-mono text-xs text-fg-subtle hover:text-fg transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Blog Archive</span>
        </Link>

        <div className="border border-border bg-bg-raised p-8 rounded-[2px] shadow-sm space-y-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-1.5 text-fg-subtle">
              <Lock className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
                Restricted Surface
              </span>
            </div>
            <h1 className="font-display text-2xl font-medium text-fg">
              Admin Gateway
            </h1>
            <p className="text-xs text-fg-muted">
              Enter your credentials to access the <span className="font-editorial italic text-sm text-fg font-normal">JeptahzRepo</span> curation studio.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="font-mono text-[10px] uppercase tracking-wider text-fg-subtle block">
                Administrator Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jeptahzrepo.io"
                className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg focus:outline-none focus:border-fg rounded-[2px]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-mono text-[10px] uppercase tracking-wider text-fg-subtle block">
                Passphrase
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg focus:outline-none focus:border-fg rounded-[2px]"
              />
            </div>

            {error && (
              <div className="p-2.5 bg-bg border border-border text-[11px] font-mono text-fg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="md"
            >
              {loading ? "Authenticating..." : "Authorize Access →"}
            </Button>
          </form>

          {/* Instant Studio Entry */}
          <div className="border-t border-border pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin")}
              className="w-full"
            >
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
              <span>Enter Studio (Resilience Mode)</span>
            </Button>
            <p className="font-mono text-[9px] text-fg-subtle text-center mt-2">
              LOCAL DEMO & RESILIENCE BYPASS ENABLED
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
