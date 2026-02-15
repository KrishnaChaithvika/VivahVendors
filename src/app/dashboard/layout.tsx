import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOutButton } from "@/components/auth/logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role;
  const isVendor = role === "VENDOR";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold text-primary">
              VivahVendors
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              {isVendor ? (
                <>
                  <Link href="/dashboard/vendor" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    Overview
                  </Link>
                  <Link href="/dashboard/vendor/listings" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    My Listings
                  </Link>
                  <Link href="/dashboard/vendor/bookings" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    Bookings
                  </Link>
                  <Link href="/dashboard/vendor/orders" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    Orders
                  </Link>
                  <Link href="/dashboard/vendor/reviews" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    Reviews
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard/customer" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    Overview
                  </Link>
                  <Link href="/dashboard/customer/bookings" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    My Bookings
                  </Link>
                  <Link href="/dashboard/customer/orders" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    My Orders
                  </Link>
                  <Link href="/dashboard/customer/reviews" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    My Reviews
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden md:block">
              {session.user.name ?? session.user.email}
            </span>
            <Link href="/vendors">
              <Button variant="outline" size="sm">Browse Vendors</Button>
            </Link>
            <LogOutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
