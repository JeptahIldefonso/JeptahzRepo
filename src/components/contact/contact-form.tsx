"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
    website: "", // Honeypot field
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({
          type: "success",
          message: "Thank you! Your message has been dispatched to the repository maintainer.",
        });
        setFormData({ name: "", email: "", company: "", message: "", website: "" });
      } else {
        setStatus({
          type: "error",
          message: data.error || "Failed to deliver message. Please try again or reach out directly.",
        });
      }
    } catch {
      setStatus({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-border bg-bg-raised p-5 sm:p-6 rounded-[2px] space-y-4">
      <div className="border-b border-border pb-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-fg-subtle">
          Direct Transmission (Discreet Dispatch)
        </h2>
        <p className="text-xs text-fg-muted mt-1 font-mono">
          Inquiries are encrypted and routed directly to the system inbox.
        </p>
      </div>

      {status && (
        <div
          className={`p-3 rounded-[2px] flex items-start space-x-2 text-xs font-mono border ${
            status.type === "success"
              ? "bg-green-950/20 text-green-400 border-green-800/40"
              : "bg-red-950/20 text-red-400 border-red-800/40"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Anti-spam honeypot (hidden from human visitors) */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-fg uppercase tracking-wider">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ada Lovelace"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-bg border border-border rounded-[2px] text-xs font-mono text-fg placeholder:text-fg-subtle focus:outline-none focus:border-fg transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono text-fg uppercase tracking-wider">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="ada@analytical-engine.org"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-bg border border-border rounded-[2px] text-xs font-mono text-fg placeholder:text-fg-subtle focus:outline-none focus:border-fg transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-mono text-fg uppercase tracking-wider">
            Organization / Institution (Optional)
          </label>
          <input
            type="text"
            placeholder="MIT CSAIL / Independent"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-3 py-2 bg-bg border border-border rounded-[2px] text-xs font-mono text-fg placeholder:text-fg-subtle focus:outline-none focus:border-fg transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-mono text-fg uppercase tracking-wider">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            placeholder="Brief inquiry or research collaboration proposal..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-3 py-2 bg-bg border border-border rounded-[2px] text-xs font-mono text-fg placeholder:text-fg-subtle focus:outline-none focus:border-fg transition-colors resize-none"
          />
        </div>

        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="font-mono text-xs h-9 px-5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                Dispatching...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 mr-2" />
                Send Inquiry
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
