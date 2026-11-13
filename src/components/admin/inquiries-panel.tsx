"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Mail,
  RefreshCw,
  Loader2,
  Trash2,
  MessageSquare,
  Search,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalContent } from "@/components/ui/modal";
import type { InquiryRecord, InquiryStatus } from "@/lib/validators/inquiry";

export function InquiriesPanel() {
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/inquiries");
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.inquiries || []);
      }
    } catch (err) {
      console.error("Failed to load inquiries:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const updateStatus = async (id: string, status: InquiryStatus, notes?: string) => {
    setIsUpdating(id);
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...(notes !== undefined ? { notes } : {}) }),
      });
      if (res.ok) {
        setInquiries((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status, ...(notes !== undefined ? { notes } : {}) } : item
          )
        );
        if (selectedInquiry?.id === id) {
          setSelectedInquiry((prev) =>
            prev ? { ...prev, status, ...(notes !== undefined ? { notes } : {}) } : null
          );
        }
      }
    } catch (err) {
      console.error("Failed to update inquiry:", err);
    } finally {
      setIsUpdating(null);
    }
  };

  const deleteInquiry = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, { method: "DELETE" });
      if (res.ok) {
        setInquiries((prev) => prev.filter((item) => item.id !== id));
        if (selectedInquiry?.id === id) setSelectedInquiry(null);
      }
    } catch (err) {
      console.error("Failed to delete inquiry:", err);
    } finally {
      setDeleteId(null);
    }
  };

  const filteredInquiries = inquiries.filter((item) => {
    const matchesFilter = filterStatus === "all" || item.status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case "new":
        return <Badge variant="default">New</Badge>;
      case "in_review":
        return <Badge variant="subtle">In Review</Badge>;
      case "replied":
        return <Badge variant="outline">Replied</Badge>;
      case "archived":
        return <Badge variant="subtle">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="border border-border bg-bg-raised rounded-[2px] p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-bg border border-border rounded-[2px]">
            <Mail className="w-5 h-5 text-fg" />
          </div>
          <div>
            <h2 className="font-sans text-lg font-bold tracking-tight text-fg flex items-center gap-2">
              Inquiries Inbox
              {inquiries.filter((i) => i.status === "new").length > 0 && (
                <span className="text-xs px-2 py-0.5 bg-fg text-bg font-mono rounded-full">
                  {inquiries.filter((i) => i.status === "new").length} new
                </span>
              )}
            </h2>
            <p className="text-xs text-fg-muted">
              Visitor leads and contact messages received from the public contact portal.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchInquiries}
            disabled={isLoading}
            className="h-8 text-xs font-mono"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-fg-subtle absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search inquiries by name, email, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-bg border border-border rounded-[2px] text-xs font-mono text-fg placeholder:text-fg-subtle focus:outline-none focus:border-fg"
          />
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          {["all", "new", "in_review", "replied", "archived"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-[2px] transition-colors whitespace-nowrap ${
                filterStatus === st
                  ? "bg-fg text-bg font-medium"
                  : "bg-bg text-fg-muted hover:text-fg border border-border"
              }`}
            >
              {st === "all" ? "All" : st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiries List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-fg-muted font-mono text-xs">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Loading inquiries...
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="border border-dashed border-border p-8 text-center rounded-[2px]">
          <MessageSquare className="w-8 h-8 text-fg-subtle mx-auto mb-2 opacity-50" />
          <p className="text-xs font-mono text-fg-muted">
            {inquiries.length === 0
              ? "No visitor inquiries received yet."
              : "No inquiries matching your search filters."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border border border-border rounded-[2px] bg-bg overflow-hidden">
          {filteredInquiries.map((item) => (
            <div
              key={item.id}
              className="p-4 hover:bg-bg-raised transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
              onClick={() => {
                setSelectedInquiry(item);
                setNotesDraft(item.notes || "");
              }}
            >
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-sans text-sm font-semibold text-fg truncate">
                    {item.name}
                  </span>
                  <span className="text-xs text-fg-muted font-mono">
                    &lt;{item.email}&gt;
                  </span>
                  {getStatusBadge(item.status)}
                </div>

                <p className="text-xs text-fg-muted line-clamp-1 font-mono">
                  {item.message}
                </p>

                <div className="flex items-center space-x-3 text-[10px] text-fg-subtle font-mono">
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                  {item.company && <span>• {item.company}</span>}
                  {item.budgetRange && <span>• Budget: {item.budgetRange}</span>}
                </div>
              </div>

              <div
                className="flex items-center space-x-2 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <select
                  value={item.status}
                  onChange={(e) => updateStatus(item.id, e.target.value as InquiryStatus)}
                  disabled={isUpdating === item.id}
                  className="bg-bg border border-border rounded-[2px] text-[11px] font-mono px-2 py-1 text-fg focus:outline-none"
                >
                  <option value="new">New</option>
                  <option value="in_review">In Review</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </select>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteId(item.id)}
                  className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Drawer / Modal */}
      {selectedInquiry && (
        <Modal open={true} onOpenChange={() => setSelectedInquiry(null)}>
          <ModalContent>
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-lg font-bold text-fg">{selectedInquiry.name}</h3>
                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="text-xs font-mono text-fg-muted hover:text-fg inline-flex items-center gap-1"
                  >
                    {selectedInquiry.email}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div>{getStatusBadge(selectedInquiry.status)}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-fg-muted bg-bg p-3 border border-border rounded-[2px]">
                <div>
                  <span className="text-fg-subtle">Received:</span>{" "}
                  {new Date(selectedInquiry.createdAt).toLocaleString()}
                </div>
                {selectedInquiry.phone && (
                  <div>
                    <span className="text-fg-subtle">Phone:</span> {selectedInquiry.phone}
                  </div>
                )}
                {selectedInquiry.company && (
                  <div>
                    <span className="text-fg-subtle">Company:</span> {selectedInquiry.company}
                  </div>
                )}
                {selectedInquiry.budgetRange && (
                  <div>
                    <span className="text-fg-subtle">Budget:</span> {selectedInquiry.budgetRange}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-fg-subtle uppercase tracking-wider">
                  Message
                </label>
                <div className="p-3 bg-bg border border-border rounded-[2px] text-xs font-mono whitespace-pre-wrap text-fg">
                  {selectedInquiry.message}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-fg-subtle uppercase tracking-wider">
                  Internal Notes
                </label>
                <textarea
                  rows={3}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Private admin notes on this inquiry..."
                  className="w-full p-2.5 bg-bg border border-border rounded-[2px] text-xs font-mono text-fg focus:outline-none focus:border-fg"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center space-x-2">
                  <a href={`mailto:${selectedInquiry.email}?subject=Re: Inquiry on JeptahzRepo`}>
                    <Button size="sm">Reply via Email</Button>
                  </a>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateStatus(selectedInquiry.id, selectedInquiry.status, notesDraft)
                    }
                    disabled={isUpdating === selectedInquiry.id}
                  >
                    Save Notes
                  </Button>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedInquiry(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </ModalContent>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <Modal open={true} onOpenChange={() => setDeleteId(null)}>
          <ModalContent>
            <div className="p-6 space-y-4">
              <h3 className="text-base font-bold text-fg">Delete Inquiry</h3>
              <p className="text-xs font-mono text-fg-muted">
                Are you sure you want to permanently delete this visitor inquiry? This action
                cannot be undone.
              </p>
              <div className="flex justify-end space-x-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => setDeleteId(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => deleteInquiry(deleteId)}
                >
                  Confirm Delete
                </Button>
              </div>
            </div>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
