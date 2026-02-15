import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  REFUNDED: "bg-blue-100 text-blue-800",
  FAILED: "bg-red-100 text-red-800",
};

export default async function VendorOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) redirect("/dashboard/vendor/profile");

  const orders = await prisma.order.findMany({
    where: { listing: { vendorProfileId: profile.id } },
    include: {
      customer: { select: { name: true, email: true } },
      package: { select: { name: true } },
      listing: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">
                        {order.package?.name ?? order.listing.title}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PAYMENT_STATUS_COLORS[order.paymentStatus]}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Customer: {order.customer.name ?? order.customer.email}
                    </p>
                    <p className="text-sm font-semibold text-primary mt-1">
                      {new Intl.NumberFormat(order.currency === "INR" ? "en-IN" : "en-US", {
                        style: "currency",
                        currency: order.currency,
                        maximumFractionDigits: 0,
                      }).format(Number(order.totalAmount))}
                    </p>
                    {order.eventDate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Event: {order.eventDate.toLocaleDateString()}
                      </p>
                    )}
                    {order.customerNote && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        Note: {order.customerNote}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Ordered: {order.createdAt.toLocaleDateString()}
                    </p>
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
