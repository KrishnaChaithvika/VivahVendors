"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBookingRequest } from "@/actions/booking";

interface BookingRequestFormProps {
  listingId: string;
  listingTitle: string;
}

export function BookingRequestForm({ listingId, listingTitle }: BookingRequestFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    try {
      const result = await createBookingRequest(formData);
      if (result.success) {
        setSuccess(true);
        setIsOpen(false);
      } else {
        setError(result.error ?? "Failed to submit request");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
        Booking request sent! The vendor will get back to you soon.
      </div>
    );
  }

  if (!isOpen) {
    return (
      <Button size="lg" className="w-full" onClick={() => setIsOpen(true)}>
        Request Quote
      </Button>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="listingId" value={listingId} />

      <h3 className="font-semibold">Request Quote — {listingTitle}</h3>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="eventDate">Event Date *</Label>
        <Input id="eventDate" name="eventDate" type="date" required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="eventType">Event Type</Label>
          <Input id="eventType" name="eventType" placeholder="e.g., Wedding" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="guestCount">Guest Count</Label>
          <Input id="guestCount" name="guestCount" type="number" min={1} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="eventCity">Event City</Label>
          <Input id="eventCity" name="eventCity" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="eventVenue">Venue</Label>
          <Input id="eventVenue" name="eventVenue" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerNote">Message to Vendor</Label>
        <textarea
          id="customerNote"
          name="customerNote"
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Tell the vendor about your requirements"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Sending..." : "Send Request"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
