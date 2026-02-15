import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function VendorNotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Vendor Not Found</h1>
          <p className="text-muted-foreground mb-8">
            This vendor listing doesn&apos;t exist or may have been removed.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/vendors">
              <Button>Browse Vendors</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Go Home</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
