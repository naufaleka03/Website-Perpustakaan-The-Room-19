import { Suspense } from "react";
import PaymentFinishSession from '@/components/payment/payment-finish-session';

export default function PaymentFinishSessionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentFinishSession />
    </Suspense>
  );
}