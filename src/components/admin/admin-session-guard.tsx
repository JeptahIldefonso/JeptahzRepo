"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export const ADMIN_SESSION_STORAGE_KEY = "jeptahz_admin_session_active";

/**
 * Triggers a complete client & server session termination and redirects to login.
 */
export async function logoutAdminStudio() {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // Ignore fetch errors during logout
  } finally {
    window.location.href = "/login?reason=logged_out";
  }
}

/**
 * Client-side session guard that enforces tab-close and window-close logout.
 * sessionStorage is automatically purged by browsers whenever the tab or window is closed.
 */
export function AdminSessionGuard() {
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // Check if the current tab/window has an active session
    const isActive = sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY);

    if (isActive !== "true") {
      // Tab was opened anew or restored after closure: invalidate server session & redirect
      fetch("/api/auth/logout", { method: "POST" }).finally(() => {
        router.replace("/login?reason=session_ended");
      });
      return;
    }

    setVerified(true);

    // Also listen for storage events to synchronize cross-tab logout if desired
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ADMIN_SESSION_STORAGE_KEY && !e.newValue) {
        window.location.href = "/login?reason=logged_out";
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [router]);

  // While checking tab-scoped session, render nothing to prevent UI flashing
  if (!verified) {
    return null;
  }

  return null;
}

/**
 * Interactive Lock Studio / Exit button for the Admin layout
 */
export function AdminExitButton() {
  const [loggingOut, setLoggingOut] = useState(false);

  const handleExit = async () => {
    setLoggingOut(true);
    await logoutAdminStudio();
  };

  return (
    <button
      onClick={handleExit}
      disabled={loggingOut}
      className="inline-flex items-center space-x-1.5 text-fg-subtle hover:text-fg transition-colors disabled:opacity-50 cursor-pointer text-xs sm:text-sm font-mono"
      title="Lock Studio and Log Out"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span>{loggingOut ? "Locking..." : "Lock & Exit"}</span>
    </button>
  );
}
