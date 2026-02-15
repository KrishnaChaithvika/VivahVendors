"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateBookingStatus } from "@/actions/booking";

interface BookingStatusActionsProps {
  bookingId: string;
  status: string;
  role: "customer" | "vendor";
}

const CUSTOMER_ACTIONS: Record<string, { label: string; status: string; variant: "default" | "destructive" | "outline" }[]> = {
  QUOTE_SENT: [
    { label: "Accept Quote", status: "ACCEPTED", variant: "default" },
    { label: "Cancel", status: "CANCELLED", variant: "destructive" },
  ],
  INQUIRY: [
    { label: "Cancel", status: "CANCELLED", variant: "destructive" },
  ],
  ACCEPTED: [
    { label: "Cancel", status: "CANCELLED", variant: "destructive" },
  ],
  CONFIRMED: [
    { label: "Cancel", status: "CANCELLED", variant: "destructive" },
  ],
};

const VENDOR_ACTIONS: Record<string, { label: string; status: string; variant: "default" | "destructive" | "outline" }[]> = {
  INQUIRY: [
    { label: "Decline", status: "DECLINED", variant: "destructive" },
  ],
  ACCEPTED: [
    { label: "Confirm", status: "CONFIRMED", variant: "default" },
  ],
  CONFIRMED: [
    { label: "Mark Completed", status: "COMPLETED", variant: "default" },
  ],
};

export function BookingStatusActions({ bookingId, status, role }: BookingStatusActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const actions = role === "customer" ? CUSTOMER_ACTIONS[status] : VENDOR_ACTIONS[status];
  if (!actions || actions.length === 0) return null;

  async function handleAction(newStatus: string) {
    setLoading(newStatus);
    await updateBookingStatus(bookingId, newStatus);
    router.refresh();
    setLoading(null);
  }

  return (
    <div className="flex gap-2">
      {actions.map((action) => (
        <Button
          key={action.status}
          variant={action.variant}
          size="sm"
          onClick={() => handleAction(action.status)}
          disabled={loading !== null}
        >
          {loading === action.status ? "..." : action.label}
        </Button>
      ))}
    </div>
  );
}
