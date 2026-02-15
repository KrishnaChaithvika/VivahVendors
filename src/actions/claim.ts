"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function submitClaimRequest(
  vendorProfileId: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Please log in to claim a business" };

  const role = (session.user as { role?: string }).role;
  if (role !== "VENDOR") {
    return { success: false, error: "Only vendor accounts can claim businesses" };
  }

  // Check profile exists and is unclaimed
  const profile = await prisma.vendorProfile.findUnique({
    where: { id: vendorProfileId },
    select: { isClaimed: true },
  });
  if (!profile) return { success: false, error: "Business not found" };
  if (profile.isClaimed) return { success: false, error: "This business has already been claimed" };

  // Check for existing pending claim
  const existingClaim = await prisma.vendorClaimRequest.findFirst({
    where: {
      vendorProfileId,
      claimantUserId: session.user.id,
      status: "PENDING",
    },
  });
  if (existingClaim) {
    return { success: false, error: "You already have a pending claim for this business" };
  }

  const verificationMethod = formData.get("verificationMethod") as string;
  const notes = formData.get("notes") as string;

  await prisma.vendorClaimRequest.create({
    data: {
      vendorProfileId,
      claimantUserId: session.user.id,
      verificationMethod: verificationMethod || "email",
      notes: notes || null,
      status: "PENDING",
    },
  });

  return { success: true };
}

export async function approveClaimRequest(claimRequestId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") {
    return { success: false, error: "Only admins can approve claims" };
  }

  const claim = await prisma.vendorClaimRequest.findUnique({
    where: { id: claimRequestId },
    include: { vendorProfile: { select: { userId: true } } },
  });
  if (!claim) return { success: false, error: "Claim not found" };
  if (claim.status !== "PENDING") return { success: false, error: "Claim is not pending" };

  await prisma.$transaction([
    // Update claim status
    prisma.vendorClaimRequest.update({
      where: { id: claimRequestId },
      data: { status: "APPROVED" },
    }),
    // Transfer profile ownership to the claimant
    prisma.vendorProfile.update({
      where: { id: claim.vendorProfileId },
      data: {
        userId: claim.claimantUserId,
        isClaimed: true,
      },
    }),
  ]);

  return { success: true };
}
