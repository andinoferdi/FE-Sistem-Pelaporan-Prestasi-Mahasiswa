"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/stores/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { achievementService } from "@/services/achievement";
import type { Achievement, AchievementStatus } from "@/types/achievement";

export default function DashboardPage() {
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

  return (
    <div className="w-full">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <Link href="/dashboard/achievements">
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
  );
}

