import { z } from "zod";

export const vendorPackageSchema = z.object({
  name: z.string().min(2, "Package name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  currency: z.string().default("INR"),
  inclusions: z.string().optional(), // comma-separated, parsed to JSON array
  duration: z.string().optional(),
  maxGuestCount: z.coerce.number().int().min(1).optional(),
  isActive: z.coerce.boolean().default(true),
});

export const orderSchema = z.object({
  packageId: z.string().min(1),
  listingId: z.string().min(1),
  eventDate: z.string().optional(),
  customerNote: z.string().optional(),
});

export type VendorPackageInput = z.infer<typeof vendorPackageSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
