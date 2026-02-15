"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogOutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-2"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden md:inline">Sign out</span>
    </Button>
  );
}
