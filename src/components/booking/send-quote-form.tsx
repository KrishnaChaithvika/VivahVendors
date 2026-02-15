"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendQuote } from "@/actions/booking";

interface SendQuoteFormProps {
  bookingId: string;
  currency: string;
}

export function SendQuoteForm({ bookingId, currency }: SendQuoteFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    try {
      const result = await sendQuote(bookingId, formData);
      if (result.success) {
        setIsOpen(false);
        router.refresh();
      } else {
        setError(result.error ?? "Failed to send quote");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <Button size="sm" onClick={() => setIsOpen(true)}>
        Send Quote
      </Button>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-3 p-3 border rounded-lg bg-muted/30 min-w-[250px]">
      <input type="hidden" name="currency" value={currency} />

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      <div className="space-y-1">
        <Label htmlFor={`price-${bookingId}`} className="text-xs">
          Price ({currency})
        </Label>
        <Input
          id={`price-${bookingId}`}
          name="quotedPrice"
          type="number"
          min={0}
          step={100}
          required
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor={`note-${bookingId}`} className="text-xs">
          Note (optional)
        </Label>
        <textarea
          id={`note-${bookingId}`}
          name="vendorNote"
          rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Additional details about the quote"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading} className="flex-1">
          {loading ? "Sending..." : "Send Quote"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
