"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import { submitClaimRequest } from "@/actions/claim";

interface ClaimButtonProps {
  vendorProfileId: string;
  isLoggedIn: boolean;
}

export function ClaimButton({ vendorProfileId, isLoggedIn }: ClaimButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (success) {
    return (
      <Badge variant="secondary" className="gap-1">
        <ShieldCheck className="h-3 w-3" /> Claim Submitted
      </Badge>
    );
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-1"
        onClick={() => {
          if (!isLoggedIn) {
            router.push("/login");
            return;
          }
          setIsOpen(true);
        }}
      >
        <ShieldCheck className="h-4 w-4" /> Claim This Business
      </Button>
    );
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    try {
      const result = await submitClaimRequest(vendorProfileId, formData);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error ?? "Failed to submit claim");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="border rounded-lg p-4 space-y-3 bg-muted/30">
      <h4 className="font-semibold text-sm">Claim This Business</h4>
      <p className="text-xs text-muted-foreground">
        If this is your business, claim it to manage your profile and listings.
      </p>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      <div className="space-y-2">
        <Label htmlFor="verificationMethod" className="text-xs">
          How can we verify you own this business?
        </Label>
        <select
          id="verificationMethod"
          name="verificationMethod"
          className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs"
        >
          <option value="email">I have access to the business email</option>
          <option value="phone">I have access to the business phone</option>
          <option value="document">I can provide business documents</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-xs">Additional Notes</Label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs"
          placeholder="Any details to help verify your ownership"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading} className="flex-1">
          {loading ? "Submitting..." : "Submit Claim"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
