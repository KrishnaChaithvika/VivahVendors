import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  REFUNDED: "bg-blue-100 text-blue-800",
  FAILED: "bg-red-100 text-red-800",
};

export default async function CustomerOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    include: {
      package: { select: { name: true } },
      listing: {
        include: {
          vendorProfile: { select: { businessName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">You don&apos;t have any orders yet.</p>
          <Link href="/vendors">
            <Badge className="cursor-pointer">Browse Vendors</Badge>
          </Link>
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
                      {order.listing.vendorProfile.businessName}
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
