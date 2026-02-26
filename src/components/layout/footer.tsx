import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-gradient-to-br from-rose-50 to-amber-50/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <span>🌸</span>
              <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
                VivahVendors
              </span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Find wedding vendors who specialize in your cultural traditions, religion, and ceremony style.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">For Couples 💑</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/vendors" className="hover:text-primary transition-colors">Find Vendors</Link></li>
              <li><Link href="/vendors?category=photographers" className="hover:text-primary transition-colors">Photographers</Link></li>
              <li><Link href="/vendors?category=venues" className="hover:text-primary transition-colors">Venues</Link></li>
              <li><Link href="/vendors?category=caterers" className="hover:text-primary transition-colors">Caterers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">For Vendors 🎪</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/register" className="hover:text-primary transition-colors">List Your Business</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Vendor Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-rose-200/60 text-center text-sm text-muted-foreground">
          <p>Made with ❤️ for couples everywhere · &copy; {new Date().getFullYear()} VivahVendors. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
