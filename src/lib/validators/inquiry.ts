import { z } from "zod";

/**
 * Inquiry Input Validation Schema (Blueprint Section 14)
 * - website: Hidden honeypot field. Bots fill it, humans don't.
 * - message: Limit to 5,000 characters to prevent database exhaustion.
 * - email: Validated & trimmed.
 */
export const inquiryInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name too long"),
  email: z.string().trim().email("Invalid email address").max(180, "Email too long"),
  phone: z.string().trim().max(50, "Phone number too long").optional().nullable(),
  company: z.string().trim().max(120, "Company name too long").optional().nullable(),
  budgetRange: z.string().trim().max(80, "Budget range too long").optional().nullable(),
  message: z
    .string()
    .trim()
    .min(5, "Message must be at least 5 characters")
    .max(5000, "Message must not exceed 5,000 characters"),
  website: z.string().optional(), // Honeypot field
});

export type InquiryInput = z.infer<typeof inquiryInputSchema>;

export type InquiryStatus = "new" | "in_review" | "replied" | "archived";

export interface InquiryRecord {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  budgetRange?: string | null;
  message: string;
  status: InquiryStatus;
  notes?: string | null;
  createdAt: string;
}
