"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-2xl leading-none">🌸</span>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
            VivahVendors
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
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
            <Button variant="ghost" size="icon" className="hidden md:flex hover:text-primary hover:bg-rose-50">
              <Search className="h-4 w-4" />
            </Button>
          </Link>

          {session?.user ? (
            <Link href="/dashboard">
              <Button variant="default" size="sm">
                Dashboard
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hover:text-primary">Log in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
