"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { achievementService } from "@/services/achievement";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [stats, setStats] = useState({ total: 0, verified: 0, percentage: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const loadStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const response = await achievementService.getStats();
      if (response.status === "success" && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (storedUser.role === "Admin") {
        router.push("/dashboard");
      } else {
        router.push("/dashboard/achievements");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-muted rounded-full animate-spin border-t-primary" />
          </div>
          <p className="mt-6 text-muted-foreground font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-background">
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-8 sm:pb-12 lg:pb-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
                Sistem Pelaporan Prestasi{" "}
                <span className="relative inline-block">
                  <span className="text-primary">Mahasiswa</span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-primary"
                    viewBox="0 0 200 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 8C50 4 100 2 198 8"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
                Bikin prestasi kamu terdokumentasi dengan baik demi masa depan kamu.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/login">
                  <Button
                    className="bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/25 cursor-pointer disabled:cursor-not-allowed w-full sm:w-auto"
                    size="lg"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
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
                    Masuk ke Sistem
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  size="lg"
                  className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card cursor-pointer disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Pelajari Lebih Lanjut
                </Button>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/5 rounded-3xl transform rotate-6 blur-3xl" />
                
                <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-2xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                          <Image
                            src="/images/logo.png"
                            alt="Logo"
                            width={32}
                            height={32}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="font-semibold text-foreground">SPPM</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Dashboard</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                        <p className="text-xs text-muted-foreground mb-1">Total Prestasi</p>
                        <p className="text-2xl font-bold text-primary">
                          {isLoadingStats ? (
                            <span className="text-sm">...</span>
                          ) : (
                            stats.total
                          )}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                        <p className="text-xs text-muted-foreground mb-1">Terverifikasi</p>
                        <p className="text-2xl font-bold text-success">
                          {isLoadingStats ? (
                            <span className="text-sm">...</span>
                          ) : (
                            stats.verified
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Status Verifikasi</span>
                        <span className="font-medium text-foreground">
                          {isLoadingStats ? "..." : `${stats.percentage}%`}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-primary to-primary/80 rounded-full transition-all duration-300"
                          style={{
                            width: isLoadingStats ? "0%" : `${stats.percentage}%`,
                          }}
                        />
                      </div>
                    </div>

                    <Link href="/login" className="w-full">
                      <Button
                        className="w-full bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground cursor-pointer"
                        size="sm"
                      >
                        Kelola Prestasi
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 w-16 h-16 text-primary/20">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 text-primary/20">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
