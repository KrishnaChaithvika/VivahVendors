"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { toggleListingPublished, deleteListing } from "@/actions/vendor";

export function TogglePublishButton({
  listingId,
  isPublished,
}: {
  listingId: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    setLoading(true);
    setError(null);
    try {
      await toggleListingPublished(listingId);
      router.refresh();
    } catch {
      setError("Failed to update listing");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="outline"
        size="sm"
        className="gap-1"
        onClick={handleToggle}
        disabled={loading}
      >
        {isPublished ? (
          <><EyeOff className="h-3 w-3" /> Unpublish</>
        ) : (
          <><Eye className="h-3 w-3" /> Publish</>
        )}
      </Button>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function DeleteListingButton({
  listingId,
  title,
}: {
  listingId: string;
  title: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setLoading(true);
    setError(null);
    try {
      await deleteListing(listingId);
      router.refresh();
    } catch {
      setError("Failed to delete listing");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="destructive"
        size="sm"
        className="gap-1"
        onClick={handleDelete}
        disabled={loading}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
