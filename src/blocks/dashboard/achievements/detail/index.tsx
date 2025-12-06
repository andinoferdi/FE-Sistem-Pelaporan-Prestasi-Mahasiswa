"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/stores/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { achievementService } from "@/services/achievement";
import { Achievement, AchievementStatus } from "@/types/achievement";

export default function DetailAchievementPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState("");

  const loadAchievement = useCallback(async () => {
    setIsLoadingData(true);
    setError("");

    try {
      const response = await achievementService.getAchievementById(
        params.id as string
      );
      if (response.status === "success" && response.data) {
        setAchievement(response.data);
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
  }, [params.id]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    const allowedRoles = ["Mahasiswa", "Dosen Wali", "Admin"];
    if (isAuthenticated && user?.role && !allowedRoles.includes(user.role)) {
      router.push("/");
      return;
    }

    if (isAuthenticated && params.id) {
      loadAchievement();
    }
  }, [isAuthenticated, isLoading, user, router, params.id, loadAchievement]);

  const getStatusBadgeVariant = (status: AchievementStatus) => {
    switch (status) {
      case "draft":
        return "outline";
      case "submitted":
        return "info";
      case "verified":
        return "success";
      case "rejected":
        return "danger";
      case "deleted":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: AchievementStatus) => {
    switch (status) {
      case "draft":
        return "Draft";
      case "submitted":
        return "Menunggu Verifikasi";
      case "verified":
        return "Terverifikasi";
      case "rejected":
        return "Ditolak";
      case "deleted":
        return "Dihapus";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getFileDownloadUrl = (fileUrl: string): string => {
    if (fileUrl.startsWith("http")) {
      return fileUrl;
    }
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
    return `${apiBaseUrl}${fileUrl}`;
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const fullUrl = getFileDownloadUrl(fileUrl);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      const response = await fetch(fullUrl, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      
      if (!response.ok) {
        throw new Error("Gagal mengunduh file");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Gagal mengunduh file");
    }
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

  if (!achievement) {
    return (
      <div className="min-h-screen bg-background py-8 lg:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="glass" className="border-border/50">
            <CardContent padding="default" className="text-center py-12">
              <p className="text-muted-foreground">
                Prestasi tidak ditemukan atau Anda tidak memiliki akses.
              </p>
              <Button
                variant="outline"
                className="mt-4 cursor-pointer disabled:cursor-not-allowed"
                onClick={() => router.push("/dashboard/achievements")}
              >
                Kembali ke Daftar Prestasi
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/achievements")}
            className="mb-4 cursor-pointer disabled:cursor-not-allowed"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Kembali
          </Button>
        </div>

        {error && (
          <Alert variant="error" onClose={() => setError("")} className="mb-6">
            {error}
          </Alert>
        )}

        <Card variant="glass" className="border-border/50">
          <CardHeader padding="default">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-foreground">
                    {achievement.title}
                  </h1>
                  <Badge variant={getStatusBadgeVariant(achievement.status || "draft")}>
                    {getStatusLabel(achievement.status || "draft")}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Tipe: {achievement.achievementType}</span>
                  <span>Poin: {achievement.points}</span>
                  <span>Dibuat: {formatDate(achievement.createdAt)}</span>
                  <span>Diupdate: {formatDate(achievement.updatedAt)}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent padding="default">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  Deskripsi
                </h2>
                <p className="text-muted-foreground">{achievement.description}</p>
              </div>

              {achievement.details && Object.keys(achievement.details).length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-2">
                    Detail
                  </h2>
                  <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                    {achievement.details.competitionName && (
                      <div>
                        <span className="font-medium">Nama Kompetisi: </span>
                        <span>{achievement.details.competitionName}</span>
                      </div>
                    )}
                    {achievement.details.competitionLevel && (
                      <div>
                        <span className="font-medium">Tingkat: </span>
                        <span>{achievement.details.competitionLevel}</span>
                      </div>
                    )}
                    {achievement.details.rank && (
                      <div>
                        <span className="font-medium">Peringkat: </span>
                        <span>{achievement.details.rank}</span>
                      </div>
                    )}
                    {achievement.details.medalType && (
                      <div>
                        <span className="font-medium">Jenis Medali: </span>
                        <span>{achievement.details.medalType}</span>
                      </div>
                    )}
                    {achievement.details.publicationType && (
                      <div>
                        <span className="font-medium">Jenis Publikasi: </span>
                        <span>{achievement.details.publicationType}</span>
                      </div>
                    )}
                    {achievement.details.publicationTitle && (
                      <div>
                        <span className="font-medium">Judul Publikasi: </span>
                        <span>{achievement.details.publicationTitle}</span>
                      </div>
                    )}
                    {achievement.details.authors && achievement.details.authors.length > 0 && (
                      <div>
                        <span className="font-medium">Penulis: </span>
                        <span>{achievement.details.authors.join(", ")}</span>
                      </div>
                    )}
                    {achievement.details.publisher && (
                      <div>
                        <span className="font-medium">Penerbit: </span>
                        <span>{achievement.details.publisher}</span>
                      </div>
                    )}
                    {achievement.details.issn && (
                      <div>
                        <span className="font-medium">ISSN: </span>
                        <span>{achievement.details.issn}</span>
                      </div>
                    )}
                    {achievement.details.organizationName && (
                      <div>
                        <span className="font-medium">Nama Organisasi: </span>
                        <span>{achievement.details.organizationName}</span>
                      </div>
                    )}
                    {achievement.details.position && (
                      <div>
                        <span className="font-medium">Posisi: </span>
                        <span>{achievement.details.position}</span>
                      </div>
                    )}
                    {achievement.details.period && (
                      <div>
                        <span className="font-medium">Periode: </span>
                        <span>
                          {formatDate(achievement.details.period.start)} -{" "}
                          {formatDate(achievement.details.period.end)}
                        </span>
                      </div>
                    )}
                    {achievement.details.certificationName && (
                      <div>
                        <span className="font-medium">Nama Sertifikasi: </span>
                        <span>{achievement.details.certificationName}</span>
                      </div>
                    )}
                    {achievement.details.issuedBy && (
                      <div>
                        <span className="font-medium">Diterbitkan Oleh: </span>
                        <span>{achievement.details.issuedBy}</span>
                      </div>
                    )}
                    {achievement.details.certificationNumber && (
                      <div>
                        <span className="font-medium">Nomor Sertifikasi: </span>
                        <span>{achievement.details.certificationNumber}</span>
                      </div>
                    )}
                    {achievement.details.validUntil && (
                      <div>
                        <span className="font-medium">Berlaku Hingga: </span>
                        <span>{formatDate(achievement.details.validUntil)}</span>
                      </div>
                    )}
                    {achievement.details.eventDate && (
                      <div>
                        <span className="font-medium">Tanggal Acara: </span>
                        <span>{formatDate(achievement.details.eventDate)}</span>
                      </div>
                    )}
                    {achievement.details.location && (
                      <div>
                        <span className="font-medium">Lokasi: </span>
                        <span>{achievement.details.location}</span>
                      </div>
                    )}
                    {achievement.details.organizer && (
                      <div>
                        <span className="font-medium">Penyelenggara: </span>
                        <span>{achievement.details.organizer}</span>
                      </div>
                    )}
                    {achievement.details.score && (
                      <div>
                        <span className="font-medium">Skor: </span>
                        <span>{achievement.details.score}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {achievement.tags && achievement.tags.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-2">
                    Tag
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {achievement.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {achievement.attachments && achievement.attachments.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-2">
                    Lampiran
                  </h2>
                  <div className="space-y-2">
                    {achievement.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-muted/30 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-3">
                          <svg
                            className="w-5 h-5 text-muted-foreground"
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
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span className="text-sm text-foreground">
                            {attachment.fileName}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(attachment.fileUrl, attachment.fileName)}
                          className="cursor-pointer"
                        >
                          Unduh
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {achievement.status === "draft" && user?.role === "Mahasiswa" && (
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="primary"
                    onClick={() => router.push(`/dashboard/achievements/${achievement.id}/edit`)}
                    className="cursor-pointer disabled:cursor-not-allowed"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Prestasi
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

