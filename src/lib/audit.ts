import "server-only";
import { getFirebaseAdmin } from "@/lib/firebase/admin";

export interface AuditLogEntry {
  id?: string;
  userId: string;
  action: string; // e.g. 'app.create', 'entry.update', 'publish', 'revert', 'inquiry.status'
  entity?: string;
  entityId?: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

/**
 * Universal Audit Logger (Blueprint Section 7 & 10.1)
 * Records mutations, publishes, reverts, and administrative actions into Firestore.
 */
export async function writeAudit(params: {
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  meta?: Record<string, unknown>;
}) {
  const timestamp = new Date().toISOString();
  const entry: AuditLogEntry = {
    userId: params.userId || "admin-master",
    action: params.action,
    entity: params.entity,
    entityId: params.entityId,
    meta: params.meta,
    createdAt: timestamp,
  };

  try {
    const { db } = getFirebaseAdmin();
    if (db) {
      await db.collection("audit_log").add(entry);
    }
  } catch (err) {
    console.warn("[audit_log_write_fallback]", err);
  }
}

/**
 * Fetches recent audit logs for the audit trail viewer.
 */
export async function getAuditLogs(limitCount = 50): Promise<AuditLogEntry[]> {
  try {
    const { db } = getFirebaseAdmin();
    if (db) {
      const snap = await db
        .collection("audit_log")
        .orderBy("createdAt", "desc")
        .limit(limitCount)
        .get();

      return snap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId || "admin-master",
          action: data.action || "unknown",
          entity: data.entity,
          entityId: data.entityId,
          meta: data.meta,
          createdAt: data.createdAt || new Date().toISOString(),
        };
      });
    }
  } catch (err) {
    console.warn("[get_audit_logs_fallback]", err);
  }
  return [];
}
