import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingStatusActions } from "@/components/booking/booking-status-actions";

const STATUS_COLORS: Record<string, string> = {
  INQUIRY: "bg-blue-100 text-blue-800",
  QUOTE_SENT: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-green-100 text-green-800",
  CONFIRMED: "bg-green-600 text-white",
  COMPLETED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
  DECLINED: "bg-red-100 text-red-800",
};

export default async function CustomerBookingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { customerId: session.user.id },
    include: {
      listing: {
        include: {
          vendorProfile: { select: { businessName: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">You don&apos;t have any bookings yet.</p>
          <Link href="/vendors">
            <Badge className="cursor-pointer">Browse Vendors</Badge>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{booking.listing.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[booking.status]}`}>
                        {booking.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {booking.listing.vendorProfile.businessName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Event: {booking.eventDate.toLocaleDateString()}
                      {booking.eventType && ` · ${booking.eventType}`}
                      {booking.guestCount && ` · ${booking.guestCount} guests`}
                    </p>
                    {booking.quotedPrice && (
                      <p className="text-sm font-semibold text-primary mt-1">
                        Quoted: {new Intl.NumberFormat(booking.currency === "INR" ? "en-IN" : "en-US", {
                          style: "currency",
                          currency: booking.currency,
                          maximumFractionDigits: 0,
                        }).format(Number(booking.quotedPrice))}
                      </p>
                    )}
                    {booking.vendorNote && (
                      <p className="text-sm text-muted-foreground mt-1 italic">
                        Vendor: {booking.vendorNote}
                      </p>
                    )}
                  </div>

                  <BookingStatusActions
                    bookingId={booking.id}
                    status={booking.status}
                    role="customer"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
