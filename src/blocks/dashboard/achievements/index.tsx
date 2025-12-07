"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PaginateTable, PaginateTableRef } from "@/components/dashboard/paginate-table";
import { AchievementForm } from "./form";
import { achievementService } from "@/services/achievement";
import type {
  Achievement,
  AchievementStatus,
  AchievementType,
  CreateAchievementRequest,
  UpdateAchievementRequest,
} from "@/types/achievement";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

const AchievementsPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState<{
    open: boolean;
    achievementId: string | null;
  }>({ open: false, achievementId: null });
  const [showFormDialog, setShowFormDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    achievementId: string | null;
  }>({ open: false, mode: "create", achievementId: null });
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isLoadingAchievement, setIsLoadingAchievement] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const tableRef = useRef<PaginateTableRef | null>(null);

  const canAccess = useMemo(() => {
    if (!isAuthenticated) return false;
    const allowedRoles = ["Mahasiswa", "Dosen Wali", "Admin"];
    return user?.role && allowedRoles.includes(user.role);
  }, [isAuthenticated, user?.role]);

  const isStudent = user?.role === "Mahasiswa";

  const getStatusBadgeVariant = (status: AchievementStatus) => {
    switch (status) {
      case "draft":
        return "outline";
      case "submitted":
        return "secondary";
      case "verified":
        return "default";
      case "rejected":
        return "destructive";
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

  const getTypeLabel = (type: AchievementType) => {
    const labels: Record<AchievementType, string> = {
      academic: "Akademik",
      competition: "Kompetisi",
      organization: "Organisasi",
      publication: "Publikasi",
      certification: "Sertifikasi",
      other: "Lainnya",
    };
    return labels[type] || type;
  };

  const handleViewDetail = useCallback((achievementId: string) => {
    router.push(`/dashboard/achievements/${achievementId}`);
  }, [router]);

  const handleEdit = useCallback(async (achievementId: string) => {
    setIsLoadingAchievement(true);
    setError("");

    try {
      const response = await achievementService.getAchievementById(achievementId);
      if (response.status === "success" && response.data) {
        const data = response.data;

        if (data.status !== "draft") {
          setError("Prestasi hanya dapat diedit jika status adalah draft.");
          setIsLoadingAchievement(false);
          return;
        }

        setSelectedAchievement(data);
        setShowFormDialog({ open: true, mode: "edit", achievementId });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat data prestasi. Silakan coba lagi."
      );
    } finally {
      setIsLoadingAchievement(false);
    }
  }, []);

  const handleSubmit = useCallback(async (achievementId: string) => {
    setIsSubmitting((prev) => ({ ...prev, [achievementId]: true }));
    setError("");

    try {
      await achievementService.submitAchievement(achievementId);
      if (tableRef.current) {
        tableRef.current.refetch();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal submit prestasi. Silakan coba lagi."
      );
    } finally {
      setIsSubmitting((prev) => ({ ...prev, [achievementId]: false }));
    }
  }, [tableRef]);

  const handleDeleteClick = useCallback((achievementId: string) => {
    setShowDeleteDialog({ open: true, achievementId });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!showDeleteDialog.achievementId) return;

    const achievementId = showDeleteDialog.achievementId;
    setIsDeleting((prev) => ({ ...prev, [achievementId]: true }));
    setError("");
    setShowDeleteDialog({ open: false, achievementId: null });

    try {
      await achievementService.deleteAchievement(achievementId);
      if (tableRef.current) {
        tableRef.current.refetch();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menghapus prestasi. Silakan coba lagi."
      );
    } finally {
      setIsDeleting((prev) => ({ ...prev, [achievementId]: false }));
    }
  }, [showDeleteDialog.achievementId, tableRef]);

  const handleCreateClick = useCallback(() => {
    setSelectedAchievement(null);
    setShowFormDialog({ open: true, mode: "create", achievementId: null });
  }, []);

  const handleFormSubmit = useCallback(
    async (data: CreateAchievementRequest | UpdateAchievementRequest) => {
      setIsSaving(true);
      setError("");

      try {
        if (showFormDialog.mode === "create") {
          await achievementService.createAchievement(data as CreateAchievementRequest);
        } else if (showFormDialog.achievementId) {
          await achievementService.updateAchievement(
            showFormDialog.achievementId,
            data as UpdateAchievementRequest
          );
        }

        setShowFormDialog({ open: false, mode: "create", achievementId: null });
        setSelectedAchievement(null);

        if (tableRef.current) {
          tableRef.current.refetch();
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : showFormDialog.mode === "create"
            ? "Gagal membuat prestasi. Silakan coba lagi."
            : "Gagal mengupdate prestasi. Silakan coba lagi."
        );
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [showFormDialog.mode, showFormDialog.achievementId]
  );

  const handleFormCancel = useCallback(() => {
    setShowFormDialog({ open: false, mode: "create", achievementId: null });
    setSelectedAchievement(null);
    setError("");
  }, []);

  const columns: ColumnDef<Achievement>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Judul",
        cell: ({ row }) => {
          const achievement = row.original;
          return (
            <div className="min-w-0">
              <div className="font-medium text-foreground truncate">
                {achievement.title}
              </div>
              <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {achievement.description}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "achievementType",
        header: "Tipe",
        cell: ({ row }) => {
          return (
            <span className="text-sm">{getTypeLabel(row.original.achievementType)}</span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = (row.original.status || "draft") as AchievementStatus;
          return (
            <Badge variant={getStatusBadgeVariant(status)}>
              {getStatusLabel(status)}
            </Badge>
          );
        },
      },
      {
        accessorKey: "points",
        header: "Poin",
        cell: ({ row }) => {
          return <span className="text-sm font-medium">{row.original.points}</span>;
        },
      },
      {
        accessorKey: "createdAt",
        header: "Tanggal Event",
        cell: ({ row }) => {
          return (
            <span className="text-sm text-muted-foreground">
              {format(new Date(row.original.createdAt), "dd MMM yyyy")}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Aksi",
        meta: {
          style: { textAlign: "right" },
        },
        cell: ({ row }) => {
          const achievement = row.original;
          const status = (achievement.status || "draft") as AchievementStatus;
          const isDraft = status === "draft";
          const isBusy =
            isSubmitting[achievement.id] || isDeleting[achievement.id];

          return (
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleViewDetail(achievement.id)}
                disabled={isBusy}
                className="cursor-pointer disabled:cursor-not-allowed"
                aria-label="Lihat detail prestasi"
              >
                <svg
                  className="w-4 h-4"
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
              </Button>
              {isDraft && isStudent && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(achievement.id)}
                    disabled={isBusy}
                    className="cursor-pointer disabled:cursor-not-allowed"
                    aria-label="Edit prestasi"
                  >
                    <svg
                      className="w-4 h-4"
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
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => handleSubmit(achievement.id)}
                    disabled={isBusy}
                    className="cursor-pointer disabled:cursor-not-allowed"
                    aria-label="Submit prestasi"
                  >
                    {isSubmitting[achievement.id] ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                        <span className="hidden sm:inline">Mengirim...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
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
                        <span className="hidden sm:inline">Submit</span>
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(achievement.id)}
                    disabled={isBusy}
                    className="cursor-pointer disabled:cursor-not-allowed"
                    aria-label="Hapus prestasi"
                  >
                    <svg
                      className="w-4 h-4"
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
                  </Button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [isSubmitting, isDeleting, isStudent, handleViewDetail, handleEdit, handleSubmit, handleDeleteClick]
  );

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
  }, [isAuthenticated, isLoading, router, user?.role]);

  if (isLoading) {
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
    <div className="w-full">
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          {user?.role === "Mahasiswa"
            ? "Prestasi Saya"
            : user?.role === "Dosen Wali"
            ? "Prestasi Mahasiswa Bimbingan"
            : "Semua Prestasi"}
        </h1>
        <p className="text-muted-foreground">
          {user?.role === "Mahasiswa"
            ? "Kelola dan submit prestasi Anda untuk verifikasi"
            : user?.role === "Dosen Wali"
            ? "Lihat dan verifikasi prestasi mahasiswa bimbingan Anda"
            : "Lihat semua prestasi mahasiswa"}
        </p>
      </div>

      {error ? (
        <div className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
          {error}
        </div>
      ) : null}

      <PaginateTable<Achievement>
          ref={(ref) => {
            tableRef.current = ref;
          }}
          columns={columns}
          url="/api/v1/achievements"
          id="achievements-table"
          perPage={10}
          queryKey={["achievements", user?.id]}
          Plugin={() =>
            user?.role === "Mahasiswa" ? (
              <Button
                variant="default"
                onClick={handleCreateClick}
                aria-label="Tambah prestasi"
                className="cursor-pointer"
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
            ) : null
          }
        />

      <Dialog
        open={showFormDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            handleFormCancel();
          }
        }}
      >
        <DialogContent className="w-[95vw] sm:max-w-2xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {showFormDialog.mode === "create" ? "Tambah Prestasi Baru" : "Edit Prestasi"}
            </DialogTitle>
            <DialogDescription>
              {showFormDialog.mode === "create"
                ? "Isi form di bawah untuk menambahkan prestasi baru"
                : "Edit informasi prestasi Anda"}
            </DialogDescription>
          </DialogHeader>
          {isLoadingAchievement ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-muted rounded-full animate-spin border-t-primary mx-auto" />
                <p className="mt-4 text-sm text-muted-foreground">Memuat data...</p>
              </div>
            </div>
          ) : (
            <AchievementForm
              achievement={selectedAchievement}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isLoading={isSaving}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={showDeleteDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setShowDeleteDialog({ open: false, achievementId: null });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Prestasi</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus prestasi ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog({ open: false, achievementId: null })}
              disabled={
                showDeleteDialog.achievementId
                  ? isDeleting[showDeleteDialog.achievementId]
                  : false
              }
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
              disabled={
                showDeleteDialog.achievementId
                  ? isDeleting[showDeleteDialog.achievementId]
                  : false
              }
              className="cursor-pointer disabled:cursor-not-allowed"
              aria-label="Konfirmasi hapus prestasi"
            >
              {showDeleteDialog.achievementId &&
              isDeleting[showDeleteDialog.achievementId] ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Menghapus...
                </>
              ) : (
                "Ya, Hapus"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AchievementsPage;
