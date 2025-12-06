"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/home/navbar";
import { Footer } from "@/components/home/footer";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isDashboardPage = pathname?.startsWith("/dashboard");

  if (isLoginPage || isDashboardPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow">{children}</main>
      <Footer />
    </div>
  );
}

