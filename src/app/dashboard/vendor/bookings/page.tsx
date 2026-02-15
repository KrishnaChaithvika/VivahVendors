import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { BookingStatusActions } from "@/components/booking/booking-status-actions";
import { SendQuoteForm } from "@/components/booking/send-quote-form";

const STATUS_COLORS: Record<string, string> = {
  INQUIRY: "bg-blue-100 text-blue-800",
  QUOTE_SENT: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-green-100 text-green-800",
  CONFIRMED: "bg-green-600 text-white",
  COMPLETED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
  DECLINED: "bg-red-100 text-red-800",
};

export default async function VendorBookingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, currency: true },
  });

  if (!profile) redirect("/dashboard/vendor/profile");

  const bookings = await prisma.booking.findMany({
    where: { listing: { vendorProfileId: profile.id } },
    include: {
      customer: { select: { name: true, email: true } },
      listing: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No booking requests yet.</p>
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
                      Customer: {booking.customer.name ?? booking.customer.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Event: {booking.eventDate.toLocaleDateString()}
                      {booking.eventType && ` · ${booking.eventType}`}
                      {booking.guestCount && ` · ${booking.guestCount} guests`}
                      {booking.eventCity && ` · ${booking.eventCity}`}
                    </p>
                    {booking.customerNote && (
                      <p className="text-sm text-muted-foreground mt-1 italic">
                        Customer note: {booking.customerNote}
                      </p>
                    )}
                    {booking.quotedPrice && (
                      <p className="text-sm font-semibold text-primary mt-1">
                        Quoted: {new Intl.NumberFormat(booking.currency === "INR" ? "en-IN" : "en-US", {
                          style: "currency",
                          currency: booking.currency,
                          maximumFractionDigits: 0,
                        }).format(Number(booking.quotedPrice))}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    {booking.status === "INQUIRY" && (
                      <SendQuoteForm
                        bookingId={booking.id}
                        currency={profile.currency}
                      />
                    )}
                    <BookingStatusActions
                      bookingId={booking.id}
                      status={booking.status}
                      role="vendor"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
