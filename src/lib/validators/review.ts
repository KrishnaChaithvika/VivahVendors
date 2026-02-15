import { z } from "zod";

export const reviewSchema = z.object({
  listingId: z.string().min(1),
  bookingId: z.string().optional(),
  rating: z.coerce.number().int().min(1, "Please select a rating").max(5),
  title: z.string().optional(),
  content: z.string().min(10, "Review must be at least 10 characters"),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
