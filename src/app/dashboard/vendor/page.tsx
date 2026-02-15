import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutList, Calendar, Star, Settings } from "lucide-react";

export default async function VendorDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as { role?: string }).role;
  if (role !== "VENDOR") redirect("/dashboard/customer");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">
        Vendor Dashboard
      </h1>
      <p className="text-muted-foreground mb-8">
        Manage your listings, bookings, and profile.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <LayoutList className="h-5 w-5 text-primary" />
              My Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Create and manage your service listings.
            </p>
            <Link href="/dashboard/vendor/listings">
              <Button className="w-full">Manage Listings</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View and respond to booking requests.
            </p>
            <Link href="/dashboard/vendor/bookings">
              <Button variant="outline" className="w-full">View Bookings</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-5 w-5 text-primary" />
              Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              See what customers are saying about you.
            </p>
            <Link href="/dashboard/vendor/reviews">
              <Button variant="outline" className="w-full">View Reviews</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5 text-primary" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Update your business profile and settings.
            </p>
            <Link href="/dashboard/vendor/profile">
              <Button variant="outline" className="w-full">Edit Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
