import { cookies } from "next/headers";

import { requestBackend } from "@/lib/auth/backend";

export type PaymentHistoryItem = {
  id: string;
  publicId: string;
  purpose: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  statusLabel: string;
  failureCode: string | null;
  failureMessage: string | null;
  entitySummary: string | null;
  itemCount: number;
  createdAt: string;
  paidAt: string | null;
  failedAt: string | null;
};

type PaymentHistoryPayload = {
  ok?: boolean;
  payments?: PaymentHistoryItem[];
};

export async function getUserPaymentHistory() {
  const cookieHeader = (await cookies()).toString();
  const response = await requestBackend("/api/v1/payments/history", {
    cookieHeader,
  });
  if (!response.ok) return [];
  const payload = (await response.json().catch(() => null)) as PaymentHistoryPayload | null;
  return payload?.ok && Array.isArray(payload.payments) ? payload.payments : [];
}
