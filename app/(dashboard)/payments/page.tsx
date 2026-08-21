import { PaymentsPage } from "@/components/dashboard/payments/payments-page";
import { getUserPaymentHistory } from "@/lib/payments.server";

export default async function PaymentsRoutePage() {
  const payments = await getUserPaymentHistory();
  return <PaymentsPage payments={payments} />;
}
