import { z } from "zod";

export const vendorProfileSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  description: z.string().optional(),
  shortBio: z.string().max(200, "Short bio must be under 200 characters").optional(),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  websiteUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  country: z.string().min(1, "Country is required"),
  state: z.string().optional(),
  city: z.string().min(1, "City is required"),
  addressLine: z.string().optional(),
  postalCode: z.string().optional(),
  yearsInBusiness: z.coerce.number().int().min(0).optional(),
  teamSize: z.coerce.number().int().min(1).optional(),
  currency: z.string().min(1).default("INR"),
  orderMode: z.enum(["PLATFORM", "REDIRECT", "BOTH"]).default("PLATFORM"),
});

export const vendorListingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priceType: z.enum(["FIXED", "STARTING_AT", "RANGE", "ON_REQUEST"]),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  currency: z.string().default("INR"),
  priceUnit: z.string().optional(),
  externalPurchaseUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  categoryIds: z.array(z.string()).min(1, "Select at least one category"),
  culturalTagIds: z.array(z.string()).default([]),
  isPublished: z.coerce.boolean().default(false),
});

export type VendorProfileInput = z.infer<typeof vendorProfileSchema>;
export type VendorListingInput = z.infer<typeof vendorListingSchema>;
