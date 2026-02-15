"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createListing, updateListing } from "@/actions/vendor";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface TaxonomyTerm {
  id: string;
  name: string;
  slug: string;
  typeName: string;
}

interface ListingData {
  id: string;
  title: string;
  description: string;
  priceType: string;
  priceMin: number | null;
  priceMax: number | null;
  currency: string;
  priceUnit: string | null;
  externalPurchaseUrl: string | null;
  isPublished: boolean;
  categoryIds: string[];
  culturalTagIds: string[];
}

interface ListingFormProps {
  categories: Category[];
  taxonomyTerms: TaxonomyTerm[];
  existing?: ListingData;
  defaultCurrency?: string;
}

export function ListingForm({
  categories,
  taxonomyTerms,
  existing,
  defaultCurrency = "INR",
}: ListingFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    existing?.categoryIds ?? []
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    existing?.culturalTagIds ?? []
  );
  const [priceType, setPriceType] = useState(existing?.priceType ?? "STARTING_AT");

  const religionTerms = taxonomyTerms.filter((t) => t.typeName === "religion");
  const traditionTerms = taxonomyTerms.filter((t) => t.typeName === "cultural_tradition");
  const styleTerms = taxonomyTerms.filter((t) => t.typeName === "ceremony_style");

  function toggleCategory(id: string) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function toggleTag(id: string) {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSaving(true);

    // Append multi-select values
    formData.delete("categoryIds");
    formData.delete("culturalTagIds");
    selectedCategories.forEach((id) => formData.append("categoryIds", id));
    selectedTags.forEach((id) => formData.append("culturalTagIds", id));

    try {
      const result = existing
        ? await updateListing(existing.id, formData)
        : await createListing(formData);

      if (result.success) {
        router.push("/dashboard/vendor/listings");
        router.refresh();
      } else {
        setError(result.error ?? "Failed to save listing");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Listing Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              defaultValue={existing?.title ?? ""}
              placeholder="e.g., Wedding Photography — Full Day Coverage"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              name="description"
              defaultValue={existing?.description ?? ""}
              rows={5}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Describe your service in detail"
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categories *</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
              >
                <Badge
                  variant={selectedCategories.includes(cat.id) ? "default" : "outline"}
                  className="cursor-pointer"
                >
                  {cat.name}
                </Badge>
              </button>
            ))}
          </div>
          {selectedCategories.length === 0 && (
            <p className="text-xs text-destructive mt-2">
              Select at least one category
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cultural Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {religionTerms.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2 text-muted-foreground">Religion</p>
              <div className="flex flex-wrap gap-2">
                {religionTerms.map((term) => (
                  <button key={term.id} type="button" onClick={() => toggleTag(term.id)}>
                    <Badge
                      variant={selectedTags.includes(term.id) ? "default" : "outline"}
                      className="cursor-pointer"
                    >
                      {term.name}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}
          {traditionTerms.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2 text-muted-foreground">
                Cultural Tradition
              </p>
              <div className="flex flex-wrap gap-2">
                {traditionTerms.map((term) => (
                  <button key={term.id} type="button" onClick={() => toggleTag(term.id)}>
                    <Badge
                      variant={selectedTags.includes(term.id) ? "default" : "outline"}
                      className="cursor-pointer"
                    >
                      {term.name}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}
          {styleTerms.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2 text-muted-foreground">
                Ceremony Style
              </p>
              <div className="flex flex-wrap gap-2">
                {styleTerms.map((term) => (
                  <button key={term.id} type="button" onClick={() => toggleTag(term.id)}>
                    <Badge
                      variant={selectedTags.includes(term.id) ? "default" : "outline"}
                      className="cursor-pointer"
                    >
                      {term.name}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="priceType">Price Type</Label>
            <select
              id="priceType"
              name="priceType"
              value={priceType}
              onChange={(e) => setPriceType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="STARTING_AT">Starting At</option>
              <option value="FIXED">Fixed Price</option>
              <option value="RANGE">Price Range</option>
              <option value="ON_REQUEST">Price on Request</option>
            </select>
          </div>

          {priceType !== "ON_REQUEST" && (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceMin">
                  {priceType === "RANGE" ? "Min Price" : "Price"}
                </Label>
                <Input
                  id="priceMin"
                  name="priceMin"
                  type="number"
                  min={0}
                  step={100}
                  defaultValue={existing?.priceMin ?? ""}
                />
              </div>
              {priceType === "RANGE" && (
                <div className="space-y-2">
                  <Label htmlFor="priceMax">Max Price</Label>
                  <Input
                    id="priceMax"
                    name="priceMax"
                    type="number"
                    min={0}
                    step={100}
                    defaultValue={existing?.priceMax ?? ""}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  name="currency"
                  defaultValue={existing?.currency ?? defaultCurrency}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="priceUnit">Price Unit</Label>
            <Input
              id="priceUnit"
              name="priceUnit"
              defaultValue={existing?.priceUnit ?? ""}
              placeholder="e.g., per event, per day, per plate"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>External Purchase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="externalPurchaseUrl">External Purchase URL</Label>
            <Input
              id="externalPurchaseUrl"
              name="externalPurchaseUrl"
              type="url"
              defaultValue={existing?.externalPurchaseUrl ?? ""}
              placeholder="https://your-website.com/book"
            />
            <p className="text-xs text-muted-foreground">
              If you want customers to be redirected to your own website for ordering
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publishing</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isPublished"
              value="true"
              defaultChecked={existing?.isPublished ?? false}
              className="rounded border-input"
            />
            <span className="text-sm">Publish this listing (visible to customers)</span>
          </label>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving} className="flex-1">
          {saving
            ? "Saving..."
            : existing
              ? "Update Listing"
              : "Create Listing"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
