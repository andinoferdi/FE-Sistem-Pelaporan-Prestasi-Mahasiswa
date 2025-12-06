"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { useAuth } from "@/stores/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { achievementService } from "@/services/achievement";
import type { Achievement, AchievementStatus } from "@/types/achievement";

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AchievementStatus>>({});
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(false);

  const loadAchievements = useCallback(async () => {
    const allowedRoles = ["Mahasiswa", "Dosen Wali", "Admin"];
    if (!isAuthenticated || !user?.role || !allowedRoles.includes(user.role)) return;
    
    setIsLoadingAchievements(true);
    try {
      const response = await achievementService.getAchievements();
      if (response.status === "success" && response.data) {
        setAchievements(response.data);
        const statusMap: Record<string, AchievementStatus> = {};
        response.data.forEach(
          (achievement: Achievement & { status?: AchievementStatus }) => {
            statusMap[achievement.id] = achievement.status || "draft";
          }
        );
        setStatuses(statusMap);
      }
    } catch (err) {
      console.error("Failed to load achievements:", err);
    } finally {
      setIsLoadingAchievements(false);
    }
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    const allowedRoles = ["Mahasiswa", "Dosen Wali", "Admin"];
    if (isAuthenticated && user?.role && allowedRoles.includes(user.role)) {
      loadAchievements();
    }
  }, [isAuthenticated, user?.role, loadAchievements]);

  const achievementStats = useMemo(() => {
    const total = achievements.length;
    const verified = achievements.filter(
      (achievement) => statuses[achievement.id] === "verified"
    ).length;
    const percentage = total > 0 ? Math.round((verified / total) * 100) : 0;
    return { total, verified, percentage };
  }, [achievements, statuses]);

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

  if (!isAuthenticated) {
    return (
      <div className="bg-background">
        {/* Hero Section - Split Layout */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-8 sm:pb-12 lg:pb-16 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Section - Content */}
              <div className="text-left">
                {/* Headline */}
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

                {/* Sub-headline */}
                <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
                  Bikin prestasi kamu terdokumentasi dengan baik demi masa depan kamu.
                </p>

                {/* CTA Buttons */}
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

              {/* Right Section - Illustration */}
              <div className="relative hidden lg:block">
                <div className="relative">
                  {/* Background shape */}
                  <div className="absolute inset-0 bg-primary/5 rounded-3xl transform rotate-6 blur-3xl" />
                  
                  {/* Main illustration container */}
                  <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-2xl">
                    {/* Mockup Dashboard */}
                    <div className="space-y-4">
                      {/* Header */}
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

                      {/* Stats Cards */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                          <p className="text-xs text-muted-foreground mb-1">Total Prestasi</p>
                          <p className="text-2xl font-bold text-primary">
                            {isLoadingAchievements ? (
                              <span className="text-sm">...</span>
                            ) : (
                              achievementStats.total
                            )}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                          <p className="text-xs text-muted-foreground mb-1">Terverifikasi</p>
                          <p className="text-2xl font-bold text-success">
                            {isLoadingAchievements ? (
                              <span className="text-sm">...</span>
                            ) : (
                              achievementStats.verified
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Status Verifikasi</span>
                          <span className="font-medium text-foreground">
                            {isLoadingAchievements ? "..." : `${achievementStats.percentage}%`}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-primary to-primary/80 rounded-full transition-all duration-300"
                            style={{
                              width: isLoadingAchievements
                                ? "0%"
                                : `${achievementStats.percentage}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Action Button */}
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

                  {/* Decorative icons */}
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

  // Authenticated user view - Dashboard
  return (
    <div className="min-h-screen bg-background py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
              <span className="text-xl font-bold text-primary">
                {(user?.fullName || user?.username || "U")
                  .charAt(0)
                  .toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Selamat Datang, {user?.fullName || user?.username}!
              </h1>
              <p className="text-muted-foreground">
                Kelola dan laporkan prestasi Anda dengan mudah.
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Account Info Card */}
          <Card
            variant="glass"
            className="border-border/50 hover:border-primary/30 transition-colors"
          >
            <CardHeader padding="default">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-card-foreground">
                  Informasi Akun
                </h2>
              </div>
            </CardHeader>
            <CardContent padding="default" className="space-y-4">
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Username
                </p>
                <p className="font-medium text-foreground">{user?.username}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Nama Lengkap
                </p>
                <p className="font-medium text-foreground">{user?.fullName}</p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Role
                </p>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  {user?.role}
                </Badge>
              </div>
              {user?.permissions && user.permissions.length > 0 && (
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Permissions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user.permissions.map((perm) => (
                      <Badge
                        key={perm}
                        variant="outline"
                        className="border-border/50"
                      >
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements Card */}
          <Card
            variant="glass"
            className="border-border/50 hover:border-primary/30 transition-colors"
          >
            <CardHeader padding="default">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-success"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-card-foreground">
                  Prestasi
                </h2>
              </div>
            </CardHeader>
            <CardContent padding="default">
              {isLoadingAchievements ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-muted rounded-full animate-spin border-t-primary" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                      <p className="text-xs text-muted-foreground mb-1">Total</p>
                      <p className="text-xl font-bold text-primary">
                        {achievementStats.total}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-success/10 border border-success/20">
                      <p className="text-xs text-muted-foreground mb-1">Terverifikasi</p>
                      <p className="text-xl font-bold text-success">
                        {achievementStats.verified}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
                    Kelola prestasi Anda, buat laporan baru, dan lihat status
                    verifikasi.
                  </p>
                </>
              )}
              <Link href="/achievements">
                <Button className="w-full bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground cursor-pointer disabled:cursor-not-allowed">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Kelola Prestasi
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Reports Card */}
          <Card
            variant="glass"
            className="border-border/50 hover:border-primary/30 transition-colors"
          >
            <CardHeader padding="default">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-warning"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-card-foreground">
                  Laporan
                </h2>
              </div>
            </CardHeader>
            <CardContent padding="default">
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Lihat laporan prestasi mahasiswa dan lakukan verifikasi.
              </p>
              <Link href="/reports">
                <Button
                  variant="secondary"
                  className="w-full border-border/50 bg-card/50 hover:bg-card cursor-pointer disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Lihat Laporan
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
