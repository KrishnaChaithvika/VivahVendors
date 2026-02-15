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

  async function handleToggle() {
    setLoading(true);
    await toggleListingPublished(listingId);
    router.refresh();
    setLoading(false);
  }

  return (
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

  async function handleDelete() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setLoading(true);
    await deleteListing(listingId);
    router.refresh();
    setLoading(false);
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      className="gap-1"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="h-3 w-3" />
    </Button>
  );
}
