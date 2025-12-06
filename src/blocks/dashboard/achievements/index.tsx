"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth";
import { AchievementCard } from "@/components/dashboard/achievement-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { achievementService } from "@/services/achievement";
import type { Achievement, AchievementStatus } from "@/types/achievement";

const AchievementsPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AchievementStatus>>(
    {}
  );
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState("");

  const canAccess = useMemo(() => {
    if (!isAuthenticated) return false;
    const allowedRoles = ["Mahasiswa", "Dosen Wali", "Admin"];
    return user?.role && allowedRoles.includes(user.role);
  }, [isAuthenticated, user?.role]);

  const loadAchievements = useCallback(async () => {
    setIsLoadingData(true);
    setError("");

    try {
      const response = await achievementService.getAchievements();
      if (response.status !== "success" || !response.data) {
        setAchievements([]);
        setStatuses({});
        return;
      }

        setAchievements(response.data);
        const statusMap: Record<string, AchievementStatus> = {};
      response.data.forEach(
        (achievement: Achievement & { status?: AchievementStatus }) => {
          statusMap[achievement.id] = achievement.status || "draft";
        }
      );
        setStatuses(statusMap);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat data prestasi. Silakan coba lagi."
      );
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const allowedRoles = ["Mahasiswa", "Dosen Wali", "Admin"];
    if (isAuthenticated && user?.role && !allowedRoles.includes(user.role)) {
      router.push("/");
      return;
    }

    loadAchievements();
  }, [isAuthenticated, isLoading, loadAchievements, router, user?.role]);

  const handleUpdate = useCallback(() => {
    loadAchievements();
  }, [loadAchievements]);

  const handleCreateClick = useCallback(() => {
    router.push("/dashboard/achievements/create");
  }, [router]);

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <div className="relative mx-auto">
            <div className="w-16 h-16 border-4 border-muted rounded-full animate-spin border-t-primary" />
          </div>
          <p className="mt-6 text-muted-foreground font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (!canAccess) return null;

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight wrap-break-word">
                {user?.role === "Mahasiswa" ? "Prestasi Saya" : user?.role === "Dosen Wali" ? "Prestasi Mahasiswa Bimbingan" : "Semua Prestasi"}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground wrap-break-word">
                {user?.role === "Mahasiswa" ? "Kelola dan submit prestasi Anda untuk verifikasi" : user?.role === "Dosen Wali" ? "Lihat dan verifikasi prestasi mahasiswa bimbingan Anda" : "Lihat semua prestasi mahasiswa"}
              </p>
            </div>
            {user?.role === "Mahasiswa" && (
              <Button
                variant="primary"
                onClick={handleCreateClick}
                aria-label="Tambah prestasi"
                className="w-full sm:w-auto sm:shrink-0 cursor-pointer"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Tambah Prestasi
              </Button>
            )}
          </div>
        </header>

        {error ? (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
            {error}
          </div>
        ) : null}

        {achievements.length === 0 ? (
          <Card variant="glass" className="border-border/50">
            <CardContent padding="default" className="text-center py-10 sm:py-12">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                Belum Ada Prestasi
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-6">
                Mulai dengan menambahkan prestasi pertama Anda
              </p>
              <Button
                variant="primary"
                onClick={handleCreateClick}
                aria-label="Tambah prestasi"
                className="w-full sm:w-auto"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Tambah Prestasi
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {achievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                status={statuses[achievement.id] || "draft"}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsPage;

