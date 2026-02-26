"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Search, Menu, X } from "lucide-react";

export function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-1.5" aria-label="VivahVendors Home">
          <span className="text-2xl leading-none">🌸</span>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
            VivahVendors
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          <Link href="/vendors" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Find Vendors
          </Link>
          <Link href="/vendors?category=photographers" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Photographers
          </Link>
          <Link href="/vendors?category=venues" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Venues
          </Link>
          <Link href="/vendors?category=caterers" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Caterers
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/vendors">
            <Button variant="ghost" size="icon" className="hidden md:flex hover:text-primary hover:bg-rose-50" aria-label="Search vendors">
              <Search className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>

          {session?.user ? (
            <Link href="/dashboard" className="hidden md:block">
              <Button variant="default" size="sm">
                Dashboard
              </Button>
            </Link>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hover:text-primary">Log in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}

          <button
            className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="md:hidden border-t bg-background shadow-lg" aria-label="Mobile navigation">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            <Link
              href="/vendors"
              className="text-sm font-medium py-2 px-3 rounded-md hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Find Vendors
            </Link>
            <Link
              href="/vendors?category=photographers"
              className="text-sm font-medium py-2 px-3 rounded-md hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Photographers
            </Link>
            <Link
              href="/vendors?category=venues"
              className="text-sm font-medium py-2 px-3 rounded-md hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Venues
            </Link>
            <Link
              href="/vendors?category=caterers"
              className="text-sm font-medium py-2 px-3 rounded-md hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Caterers
            </Link>

            <div className="border-t pt-3 mt-1 flex flex-col gap-2">
              {session?.user ? (
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="default" size="sm" className="w-full">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full">Log in</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full">Sign up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
