import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">VivahVendors</h3>
            <p className="text-sm text-muted-foreground">
              Find wedding vendors who specialize in your cultural traditions, religion, and ceremony style.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">For Couples</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/vendors" className="hover:text-foreground">Find Vendors</Link></li>
              <li><Link href="/vendors?category=photographers" className="hover:text-foreground">Photographers</Link></li>
              <li><Link href="/vendors?category=venues" className="hover:text-foreground">Venues</Link></li>
              <li><Link href="/vendors?category=caterers" className="hover:text-foreground">Caterers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">For Vendors</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/register" className="hover:text-foreground">List Your Business</Link></li>
              <li><Link href="/login" className="hover:text-foreground">Vendor Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground">About Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} VivahVendors. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
