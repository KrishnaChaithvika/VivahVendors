import { z } from "zod";

export const bookingRequestSchema = z.object({
  listingId: z.string().min(1),
  eventDate: z.string().min(1, "Event date is required"),
  eventType: z.string().optional(),
  guestCount: z.coerce.number().int().min(1).optional(),
  eventCity: z.string().optional(),
  eventVenue: z.string().optional(),
  customerNote: z.string().optional(),
});

export const quoteSchema = z.object({
  quotedPrice: z.coerce.number().min(0, "Price must be a positive number"),
  currency: z.string().default("INR"),
  vendorNote: z.string().optional(),
});

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;
export type QuoteInput = z.infer<typeof quoteSchema>;
