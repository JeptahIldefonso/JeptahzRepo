"use client";

import React, { useState, useEffect, useCallback } from "react";
import { History, RefreshCw, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AuditLogEntry } from "@/lib/audit";

export function AuditPanel() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>("all");

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/audit?limit=50");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to fetch audit trail:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter((log) => {
    if (filterAction === "all") return true;
    return log.action.startsWith(filterAction);
  });

  const getActionBadge = (action: string) => {
    if (action === "publish") return <Badge variant="default">Publish</Badge>;
    if (action === "revert") return <Badge variant="outline">Revert</Badge>;
    if (action.includes("delete")) return <Badge variant="subtle" className="text-red-400">Delete</Badge>;
    return <Badge variant="subtle">{action}</Badge>;
  };

  return (
    <div className="border border-border bg-bg-raised rounded-[2px] p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-bg border border-border rounded-[2px]">
            <History className="w-5 h-5 text-fg" />
          </div>
          <div>
            <h2 className="font-sans text-lg font-bold tracking-tight text-fg flex items-center gap-2">
              System Audit Trail
              <span className="text-[11px] font-mono text-fg-subtle">
                (Immutable Mutation Log)
              </span>
            </h2>
            <p className="text-xs text-fg-muted font-mono">
              Traceable log of all content mutations, publishing commits, reverts, and administrative actions.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={fetchLogs}
          disabled={isLoading}
          className="h-8 text-xs font-mono"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
        {["all", "publish", "revert", "inquiry"].map((filter) => (
          <button
            key={filter}
            onClick={() => setFilterAction(filter)}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-[2px] transition-colors whitespace-nowrap ${
              filterAction === filter
                ? "bg-fg text-bg font-medium"
                : "bg-bg text-fg-muted hover:text-fg border border-border"
            }`}
          >
            {filter === "all" ? "All Operations" : filter.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Audit Log Table / List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-fg-muted font-mono text-xs">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Loading audit entries...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="border border-dashed border-border p-8 text-center rounded-[2px]">
          <ShieldAlert className="w-8 h-8 text-fg-subtle mx-auto mb-2 opacity-50" />
          <p className="text-xs font-mono text-fg-muted">
            {logs.length === 0
              ? "No audit events logged yet. Mutations and publications will appear here automatically."
              : "No logs matching current filter."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border border border-border rounded-[2px] bg-bg overflow-hidden font-mono text-xs">
          {filteredLogs.map((log, idx) => (
            <div
              key={log.id || idx}
              className="p-3.5 hover:bg-bg-raised transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div>{getActionBadge(log.action)}</div>
                <div className="truncate">
                  <span className="text-fg font-medium">{log.entity || "system"}</span>
                  {log.entityId && (
                    <span className="text-fg-subtle text-[11px] ml-1.5">
                      [{log.entityId.slice(0, 10)}]
                    </span>
                  )}
                  {log.meta && (
                    <span className="text-fg-muted text-[11px] ml-2">
                      {JSON.stringify(log.meta).slice(0, 60)}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-[10px] text-fg-subtle shrink-0">
                {new Date(log.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
