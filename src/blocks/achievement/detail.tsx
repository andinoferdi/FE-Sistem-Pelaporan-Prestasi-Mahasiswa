"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, ExternalLink, Loader2, RefreshCw } from "lucide-react";

import { PageTitle } from "@/components/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { getAchievementById } from "@/services/achievement";
import type { AchievementStatus } from "@/types/achievement";

type DetailRow = {
  label: string;
  value: string;
};

const getStatusBadge = (status?: AchievementStatus) => {
  const statusConfig: Record<
    string,
    { label: string; variant: "secondary" | "default" | "destructive" }
  > = {
    draft: { label: "Draft", variant: "secondary" },
    submitted: { label: "Terkirim", variant: "default" },
    verified: { label: "Terverifikasi", variant: "default" },
    rejected: { label: "Ditolak", variant: "destructive" },
    deleted: { label: "Dihapus", variant: "destructive" },
  };

  const key = status ?? "draft";
  const config = statusConfig[key] ?? statusConfig.draft;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getTypeLabel = (type?: string) => {
  const typeLabels: Record<string, string> = {
    academic: "Akademik",
    competition: "Kompetisi",
    organization: "Organisasi",
    publication: "Publikasi",
    certification: "Sertifikasi",
    other: "Lainnya",
  };
  if (!type) return "-";
  return typeLabels[type] || type;
};

const getCompetitionLevelLabel = (level?: string) => {
  const levelLabels: Record<string, string> = {
    international: "Internasional",
    national: "Nasional",
    regional: "Regional",
    local: "Lokal",
  };
  if (!level) return "";
  return levelLabels[level] || level;
};

const getPublicationTypeLabel = (type?: string) => {
  const typeLabels: Record<string, string> = {
    journal: "Jurnal",
    conference: "Konferensi",
    book: "Buku",
  };
  if (!type) return "";
  return typeLabels[type] || type;
};

const toText = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const formatDateSafe = (value: unknown) => {
  const text = toText(value);
  if (!text) return "";
  const dt = new Date(text);
  if (Number.isNaN(dt.getTime())) return text;
  try {
    return format(dt, "dd MMM yyyy, HH:mm");
  } catch {
    return text;
  }
};

const buildAbsoluteUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
};

export default function AchievementDetail() {
  const router = useRouter();
  const params = useParams<{ id?: string | string[] }>();

  const achievementId = useMemo(() => {
    const raw = params?.id;
    if (!raw) return "";
    if (Array.isArray(raw)) return raw[0] ?? "";
    return raw;
  }, [params]);

  const {
    data: achievement,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useQuery({
    queryKey: ["achievements", achievementId],
    queryFn: () => getAchievementById(achievementId),
    enabled: Boolean(achievementId),
    refetchOnWindowFocus: false,
  });

  const detailRows = useMemo<DetailRow[]>(() => {
    if (!achievement) return [];

    const details =
      (achievement as unknown as { details?: Record<string, unknown> })
        .details ?? {};
    const rows: DetailRow[] = [];

    const put = (label: string, value: unknown) => {
      const text = toText(value);
      if (!text) return;
      rows.push({ label, value: text });
    };

    put("Nama Kompetisi", details.competitionName);
    if (details.competitionLevel) {
      rows.push({
        label: "Level Kompetisi",
        value: getCompetitionLevelLabel(String(details.competitionLevel)),
      });
    }
    put("Peringkat", details.rank);
    put("Jenis Medali", details.medalType);

    if (details.publicationType) {
      rows.push({
        label: "Tipe Publikasi",
        value: getPublicationTypeLabel(String(details.publicationType)),
      });
    }
    put("Judul Publikasi", details.publicationTitle);
    put("Penulis", details.authors);
    put("Penerbit", details.publisher);
    put("ISSN", details.issn);

    put("Nama Organisasi", details.organizationName);
    put("Posisi", details.position);

    const period = details.period as unknown as
      | { start?: string | null; end?: string | null }
      | null
      | undefined;
    if (period?.start || period?.end) {
      const startText = period.start ? formatDateSafe(period.start) : "-";
      const endText = period.end ? formatDateSafe(period.end) : "-";
      rows.push({ label: "Periode", value: `${startText} sampai ${endText}` });
    }

    put("Nama Sertifikasi", details.certificationName);
    put("Diterbitkan Oleh", details.issuedBy);
    put("Nomor Sertifikasi", details.certificationNumber);

    if (details.validUntil)
      rows.push({
        label: "Berlaku Sampai",
        value: formatDateSafe(details.validUntil),
      });
    if (details.eventDate)
      rows.push({
        label: "Tanggal Kegiatan",
        value: formatDateSafe(details.eventDate),
      });

    put("Lokasi", details.location);
    put("Penyelenggara", details.organizer);
    put("Skor", details.score);

    if (details.customFields)
      rows.push({
        label: "Field Tambahan",
        value: toText(details.customFields),
      });

    return rows;
  }, [achievement]);

  const attachments = useMemo(() => {
    if (!achievement || !achievement.attachments) return [];
    if (!Array.isArray(achievement.attachments)) return [];
    return achievement.attachments;
  }, [achievement]);

  const handleBack = () => router.back();

  const handleRefresh = async () => {
    await refetch();
  };

  if (!achievementId) {
    return (
      <section className="p-4">
        <PageTitle title="Detail Prestasi" />
        <Card className="mt-4">
          <CardContent className="p-4">
            <p className="text-sm">ID tidak valid</p>
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                aria-label="Kembali"
                className="cursor-pointer"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="p-4">
        <PageTitle title="Detail Prestasi" />
        <Card className="mt-4">
          <CardContent className="p-6">
              <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-sm">Memuat...</p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!achievement || error) {
    return (
      <section className="p-4">
        <PageTitle title="Detail Prestasi" />
        <Card className="mt-4">
          <CardContent className="p-4">
            <p className="text-sm">Data tidak ditemukan</p>
            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleBack}
                aria-label="Kembali"
                className="cursor-pointer"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isFetching}
                aria-label="Muat ulang data"
                className="cursor-pointer"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Muat Ulang
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <PageTitle title="Detail Prestasi" />
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleBack} aria-label="Kembali" className="cursor-pointer">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isFetching}
            aria-label="Muat ulang data"
            className="cursor-pointer"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Muat Ulang
          </Button>
        </div>
      </div>

      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-[260px]">
              <p className="text-muted-foreground text-sm">ID</p>
              <p className="font-mono text-sm">
                #{String(achievement.id).slice(-8)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(achievement.status as AchievementStatus | undefined)}
              <Badge variant="secondary">
                {getTypeLabel(achievement.achievementType)}
              </Badge>
            </div>
          </div>

          <div className="mt-4 h-px w-full bg-border" />

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-sm">Judul</p>
              <p className="text-sm font-medium">
                {achievement.title || "-"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Poin</p>
              <p className="text-sm font-medium">
                {String(achievement.points ?? 0)}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-muted-foreground text-sm">Deskripsi</p>
            <p className="text-sm whitespace-pre-line">
              {achievement.description || "-"}
            </p>
          </div>

          <div className="mt-4">
            <p className="text-muted-foreground text-sm">Tag</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {Array.isArray(achievement.tags) &&
              achievement.tags.length > 0 ? (
                achievement.tags.map((t: string) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))
              ) : (
                <p className="text-sm">-</p>
              )}
            </div>
          </div>

          <div className="mt-4 h-px w-full bg-border" />

          <div className="mt-4">
            <p className="text-sm font-medium">Detail</p>
            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
              {detailRows.length > 0 ? (
                detailRows.map((row) => (
                  <div key={row.label} className="rounded-md border p-3">
                    <p className="text-muted-foreground text-sm">{row.label}</p>
                    <p className="text-sm">
                      {row.label.includes("Tanggal") ||
                      row.label.includes("Berlaku")
                        ? formatDateSafe(row.value)
                        : row.value}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm">-</p>
              )}
            </div>
          </div>

          <div className="mt-4 h-px w-full bg-border" />

          <div className="mt-4">
            <p className="text-sm font-medium">Lampiran</p>
            <div className="mt-3 space-y-2">
              {attachments.length > 0 ? (
                attachments.map((a, idx) => {
                  const fileUrl = a.fileUrl ? buildAbsoluteUrl(a.fileUrl) : "";
                  const fileName = a.fileName || `Lampiran ${idx + 1}`;
                  const fileType = a.fileType || "-";
                  const uploadedAt = a.uploadedAt
                    ? formatDateSafe(a.uploadedAt)
                    : "-";

                  return (
                    <div
                      key={`${fileName}.${idx}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
                    >
                      <div className="min-w-[240px]">
                        <p className="text-sm font-medium">{fileName}</p>
                        <p className="text-muted-foreground text-sm">
                          {fileType} · {uploadedAt}
                        </p>
                      </div>

                      {fileUrl ? (
                        <Button
                          asChild
                          variant="outline"
                          aria-label={`Buka ${fileName}`}
                          className="cursor-pointer"
                        >
                          <a href={fileUrl} target="_blank" rel="noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Buka
                          </a>
                        </Button>
                      ) : (
                        <p className="text-sm">URL tidak ada</p>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm">-</p>
              )}
            </div>
          </div>

          <div className="mt-4 h-px w-full bg-border" />

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-sm">Dibuat Pada</p>
              <p className="text-sm">
                {formatDateSafe(achievement.createdAt) || "-"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Diperbarui Pada</p>
              <p className="text-sm">
                {formatDateSafe(achievement.updatedAt) || "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
