"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth";
import { achievementService } from "@/services/achievement";
import type { Achievement } from "@/types/achievement";
import MetricCards from "./metric-cards";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const loadAchievements = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const response = await achievementService.getAchievements();
      if (response.status === "success" && response.data) {
        setAchievements(response.data);
      }
    } catch (err) {
      console.error("Failed to load achievements:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    if (user && user.role !== "Admin") {
      router.push("/dashboard/achievements");
      return;
    }

    if (user && user.role === "Admin") {
      loadAchievements();
    }
  }, [user, isAuthenticated, isLoading, router, loadAchievements]);

  const totalCount = achievements.length;

  const submittedCount = achievements.filter(
    (achievement) => achievement.status === "submitted"
  ).length;

  const verifiedCount = achievements.filter(
    (achievement) => achievement.status === "verified"
  ).length;

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

  if (!isAuthenticated || (user && user.role !== "Admin")) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Ringkasan prestasi mahasiswa
        </p>
      </div>
      <MetricCards
        totalCount={totalCount}
        submittedCount={submittedCount}
        verifiedCount={verifiedCount}
        isLoading={isLoadingData}
      />
    </div>
  );
}

