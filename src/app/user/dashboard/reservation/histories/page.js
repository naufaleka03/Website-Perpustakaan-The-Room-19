"use client"
import { Suspense } from "react";
import Histories, { ReservationHistorySkeleton } from '@/components/user/reservation/Histories';

export default function ReservationHistoryCard() {
  return (
    <Suspense fallback={<ReservationHistorySkeleton />}>
      <Histories />
    </Suspense>
  );
}
