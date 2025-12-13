"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";

import { PageTitle } from "@/components/layouts/page-title";
import { usePermissions } from "@/services/auth";
import { getStudentByUserId, getLecturerByUserId } from "@/services/user";
import AchievementTypeCards from "./achievement-type-cards";
import AchievementPeriodChart from "./achievement-period-chart";
import TopStudentsCard from "./top-students-card";
import CompetitionLevelChart from "./competition-level-chart";
import StudentReportCard from "./student-report-card";
import LecturerReportCard from "./lecturer-report-card";

export default function HomePage() {
  const { userData } = usePermissions();
  const userRole = userData?.role || "";
  const userId = userData?.user_id || "";

  const { data: student } = useQuery({
    queryKey: ['student', 'byUserId', userId],
    queryFn: () => getStudentByUserId(userId),
    enabled: !!userId && userRole === "Mahasiswa",
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const { data: lecturer } = useQuery({
    queryKey: ['lecturer', 'byUserId', userId],
    queryFn: () => getLecturerByUserId(userId),
    enabled: !!userId && userRole === "Dosen Wali",
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  if (userRole === "Mahasiswa" && student) {
    return (
      <section className="space-y-6">
        <PageTitle title="Laporan Prestasi Saya" />
        <StudentReportCard studentId={student.id} />
      </section>
    );
  }

  if (userRole === "Dosen Wali" && lecturer) {
    return (
      <section className="space-y-6">
        <PageTitle title="Laporan Dosen Wali" />
        <LecturerReportCard lecturerId={lecturer.id} />
      </section>
    );
  }

  if (userRole === "Admin" || !userRole) {
    return (
      <section className="space-y-6">
        <PageTitle title="Dashboard Statistik Prestasi" />

        <div className="space-y-6">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Total Prestasi per Tipe
            </h2>
            <AchievementTypeCards />
          </div>

          <div>
            <AchievementPeriodChart />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TopStudentsCard />
            <CompetitionLevelChart />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageTitle title="Dashboard" />
      <div className="rounded-lg border p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Memuat data...
        </p>
      </div>
    </section>
  );
}
