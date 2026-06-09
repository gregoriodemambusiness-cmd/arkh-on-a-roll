"use client";
import { Suspense } from "react";
import PaymentSuccess from "@/routes/payment-success";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccess />
    </Suspense>
  );
}
