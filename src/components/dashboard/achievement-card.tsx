"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Dialog } from "@/components/ui/dialog";
import type { Achievement, AchievementStatus } from "@/types/achievement";
import { achievementService } from "@/services/achievement";

interface AchievementCardProps {
  achievement: Achievement;
  status: AchievementStatus;
  onUpdate?: () => void;
}

export function AchievementCard({ achievement, status, onUpdate }: AchievementCardProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isBusy = isSubmitting || isDeleting;
  const isDraft = status === "draft";
  const isDeleted = status === "deleted";

  const statusBadgeVariant = useMemo(() => {
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
  }, [status]);

  const statusLabel = useMemo(() => {
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
  }, [status]);

  const formattedDate = useMemo(() => {
    return new Date(achievement.createdAt).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [achievement.createdAt]);

  const handleViewDetailClick = useCallback(() => {
    router.push(`/achievements/${achievement.id}`);
  }, [achievement.id, router]);

  const handleEditClick = useCallback(() => {
    router.push(`/achievements/${achievement.id}/edit`);
  }, [achievement.id, router]);

  const handleSubmit = useCallback(async () => {
    if (!isDraft) return;

    setIsSubmitting(true);
    setError("");

    try {
      await achievementService.submitAchievement(achievement.id);
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal submit prestasi. Silakan coba lagi."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [achievement.id, isDraft, onUpdate]);

  const handleDeleteClick = useCallback(() => {
    if (!isDraft) return;
    setShowDeleteDialog(true);
  }, [isDraft]);

  const handleDeleteConfirm = useCallback(async () => {
    setIsDeleting(true);
    setError("");
    setShowDeleteDialog(false);

    try {
      await achievementService.deleteAchievement(achievement.id);
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menghapus prestasi. Silakan coba lagi."
      );
    } finally {
      setIsDeleting(false);
    }
  }, [achievement.id, onUpdate]);

  const handleCloseError = useCallback(() => setError(""), []);

  return (
    <Card 
      variant="glass" 
      className="border-border/50 shadow-md hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
    >
      <CardHeader padding="default">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 text-base sm:text-lg font-semibold text-card-foreground wrap-break-word leading-snug">
                {achievement.title}
              </h3>
            <Badge variant={statusBadgeVariant}>{statusLabel}</Badge>
            </div>
          <p className="mt-2 text-sm text-muted-foreground wrap-break-word">
              {achievement.description}
            </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="wrap-break-word">Tipe: {achievement.achievementType}</span>
              <span>Poin: {achievement.points}</span>
            <span className="wrap-break-word">Dibuat: {formattedDate}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent padding="default">
        {error ? (
          <Alert variant="error" onClose={handleCloseError} className="mb-4">
            {error}
          </Alert>
        ) : null}

        {achievement.tags?.length ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {achievement.tags.map((tag, index) => (
              <Badge key={`${tag}-${index}`} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleViewDetailClick}
            disabled={isBusy}
            className="w-full sm:w-auto cursor-pointer disabled:cursor-not-allowed"
            aria-label="Lihat detail prestasi"
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Lihat Detail
          </Button>
          {isDraft && !isDeleted ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEditClick}
                disabled={isBusy}
                className="w-full sm:w-auto cursor-pointer disabled:cursor-not-allowed"
                aria-label="Edit prestasi"
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
                Edit
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                disabled={isBusy}
                className="w-full sm:w-auto cursor-pointer disabled:cursor-not-allowed"
                aria-label="Submit prestasi"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Mengirim...
                  </>
                ) : (
                  <>
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Submit
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDeleteClick}
                disabled={isBusy}
                className="w-full sm:w-auto cursor-pointer disabled:cursor-not-allowed"
                aria-label="Hapus prestasi"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Hapus
              </Button>
            </>
          ) : null}
        </div>
      </CardContent>

      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Hapus Prestasi"
        description="Apakah Anda yakin ingin menghapus prestasi ini? Tindakan ini tidak dapat dibatalkan."
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowDeleteDialog(false)}
          disabled={isDeleting}
          className="cursor-pointer disabled:cursor-not-allowed"
          aria-label="Batal hapus prestasi"
        >
          Batal
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleDeleteConfirm}
          disabled={isDeleting}
          className="cursor-pointer disabled:cursor-not-allowed"
          aria-label="Konfirmasi hapus prestasi"
        >
          {isDeleting ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
              Menghapus...
            </>
          ) : (
            "Ya, Hapus"
          )}
        </Button>
      </Dialog>
    </Card>
  );
}

