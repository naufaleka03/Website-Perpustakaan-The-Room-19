import { Suspense } from "react";
import UpdateItem from "@/components/staff/inventory/update-item";

export default function UpdateItemPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpdateItem />
    </Suspense>
  );
}
