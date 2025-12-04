"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Dialog } from "@/components/ui/dialog";
import { Achievement, AchievementStatus } from "@/types/achievement";
import { achievementService } from "@/services/achievement";

interface AchievementCardProps {
  achievement: Achievement;
  status: AchievementStatus;
  onUpdate?: () => void;
}

export function AchievementCard({
  achievement,
  status,
  onUpdate,
}: AchievementCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
      default:
        return status;
    }
  };

  const handleSubmit = async () => {
    if (status !== "draft") return;

    setIsSubmitting(true);
    setError("");

    try {
      await achievementService.submitAchievement(achievement.id);
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal submit prestasi. Silakan coba lagi."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = () => {
    if (status !== "draft") return;
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setError("");
    setShowDeleteDialog(false);

    try {
      await achievementService.deleteAchievement(achievement.id);
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menghapus prestasi. Silakan coba lagi."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card variant="glass" className="border-border/50 hover:border-primary/30">
      <CardHeader padding="default">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-card-foreground">
                {achievement.title}
              </h3>
              <Badge variant={getStatusBadgeVariant(status)}>
                {getStatusLabel(status)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {achievement.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Tipe: {achievement.achievementType}</span>
              <span>Poin: {achievement.points}</span>
              <span>Dibuat: {formatDate(achievement.createdAt)}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent padding="default">
        {error && (
          <Alert variant="error" onClose={() => setError("")} className="mb-4">
            {error}
          </Alert>
        )}

        {achievement.tags && achievement.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {achievement.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {status === "draft" && (
          <div className="flex gap-2 mt-4">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting || isDeleting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Mengirim...
                </>
              ) : (
                <>
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Submit untuk Verifikasi
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteClick}
              disabled={isSubmitting || isDeleting}
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Hapus
            </Button>
          </div>
        )}
      </CardContent>

      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Hapus Prestasi"
        description="Apakah Anda yakin ingin menghapus prestasi ini? Tindakan ini tidak dapat dibatalkan."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDeleteDialog(false)}
          disabled={isDeleting}
        >
          Batal
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDeleteConfirm}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
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

