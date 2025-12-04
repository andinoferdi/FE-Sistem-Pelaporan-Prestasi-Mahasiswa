"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth";
import { AchievementCard } from "@/components/achievement-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { achievementService } from "@/services/achievement";
import { Achievement, AchievementStatus } from "@/types/achievement";

export default function AchievementsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AchievementStatus>>(
    {}
  );
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated && user?.role !== "Mahasiswa") {
      router.push("/");
      return;
    }

    if (isAuthenticated) {
      loadAchievements();
    }
  }, [isAuthenticated, isLoading, user, router]);

  const loadAchievements = async () => {
    setIsLoadingData(true);
    setError("");

    try {
      const response = await achievementService.getAchievements();
      if (response.status === "success" && response.data) {
        setAchievements(response.data);
        const statusMap: Record<string, AchievementStatus> = {};
        response.data.forEach((achievement: Achievement & { status?: AchievementStatus }) => {
          statusMap[achievement.id] = achievement.status || "draft";
        });
        setStatuses(statusMap);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat data prestasi. Silakan coba lagi."
      );
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleUpdate = () => {
    loadAchievements();
  };

  if (isLoading || isLoadingData) {
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
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Prestasi Saya
              </h1>
              <p className="text-muted-foreground">
                Kelola dan submit prestasi Anda untuk verifikasi
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => router.push("/achievements/create")}
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Tambah Prestasi
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
            {error}
          </div>
        )}

        {achievements.length === 0 ? (
          <Card variant="glass" className="border-border/50">
            <CardContent padding="default" className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Belum Ada Prestasi
              </h3>
              <p className="text-muted-foreground mb-6">
                Mulai dengan menambahkan prestasi pertama Anda
              </p>
              <Button
                variant="primary"
                onClick={() => router.push("/achievements/create")}
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Tambah Prestasi
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
}

