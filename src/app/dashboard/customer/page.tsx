import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Star } from "lucide-react";

export default async function CustomerDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">
        Welcome, {session.user.name ?? "there"}!
      </h1>
      <p className="text-muted-foreground mb-8">
        Manage your wedding planning from here.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5 text-primary" />
              Find Vendors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Browse photographers, caterers, decorators and more for your cultural traditions.
            </p>
            <Link href="/vendors">
              <Button className="w-full">Browse Vendors</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              My Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View and manage your booking requests and confirmed bookings.
            </p>
            <Link href="/dashboard/customer/bookings">
              <Button variant="outline" className="w-full">View Bookings</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-5 w-5 text-primary" />
              My Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              See the reviews you&apos;ve left for vendors you&apos;ve worked with.
            </p>
            <Link href="/dashboard/customer/reviews">
              <Button variant="outline" className="w-full">View Reviews</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
