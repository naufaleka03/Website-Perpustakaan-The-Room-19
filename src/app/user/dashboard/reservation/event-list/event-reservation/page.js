"use client"
import { Suspense } from "react";
import EventReservation from '@/components/user/reservation/EventReservation';

export default function EventReservationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventReservation />
    </Suspense>
  );
}
