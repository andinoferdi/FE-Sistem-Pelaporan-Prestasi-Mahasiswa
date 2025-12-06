"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/stores/auth";
import { navbarMenu } from "@/stores/navbar-menu";
import { Button } from "@/components/ui/button";
import { UINavbar, UINavbarContainer } from "@/components/home/ui/ui-navbar";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const filteredMenu = navbarMenu.filter((item) => {
    if (!item.requiresAuth) return true;
    if (!isAuthenticated) return false;
    if (!item.roles) return true;
    return item.roles.includes(user?.role || "");
  });

  return (
    <UINavbar position="sticky" ariaLabel="Navigasi utama">
      <UINavbarContainer size="default">
        <div className="flex justify-between items-center py-6 min-h-[88px]">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden relative bg-transparent">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={36}
                  height={36}
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>
              <span className="text-lg font-bold text-foreground tracking-tight">
                {process.env.NEXT_PUBLIC_APP_NAME || "SPPM"}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {filteredMenu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User section */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
                    <span className="text-sm font-semibold text-primary">
                      {(user?.fullName || user?.username || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {user?.fullName || user?.username}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground cursor-pointer disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button
                  className="bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground cursor-pointer disabled:cursor-not-allowed rounded-lg!"
                  size="default"
                >
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Login
                </Button>
              </Link>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-1">
              {filteredMenu.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted/50 px-4 py-3 rounded-lg text-sm font-medium transition-all"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </UINavbarContainer>
    </UINavbar>
  );
}
