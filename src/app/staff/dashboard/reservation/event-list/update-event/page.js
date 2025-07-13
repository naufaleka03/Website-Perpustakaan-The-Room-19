import { Suspense } from "react";
import UpdateEvent from '@/components/staff/reservation/event-list/UpdateEvent';

export default function UpdateEventPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpdateEvent />
    </Suspense>
  );
}
