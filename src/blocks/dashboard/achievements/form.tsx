"use client";

import { memo, useEffect, useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectOption } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/dashboard/date-picker";
import { achievementService } from "@/services/achievement";
import type {
  Achievement,
  AchievementType,
  AchievementDetails,
  Attachment,
  CreateAchievementRequest,
  UpdateAchievementRequest,
} from "@/types/achievement";

const achievementTypeOptions: SelectOption[] = [
  { value: "competition", label: "Kompetisi" },
  { value: "publication", label: "Publikasi" },
  { value: "organization", label: "Organisasi" },
  { value: "certification", label: "Sertifikasi" },
  { value: "academic", label: "Akademik" },
  { value: "other", label: "Lainnya" },
];

const competitionLevelOptions: SelectOption[] = [
  { value: "international", label: "Internasional" },
  { value: "national", label: "Nasional" },
  { value: "regional", label: "Regional" },
  { value: "local", label: "Lokal" },
];

const publicationTypeOptions: SelectOption[] = [
  { value: "journal", label: "Journal" },
  { value: "conference", label: "Conference" },
  { value: "book", label: "Book" },
];

const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const convertStringToDate = (dateString: string | undefined): Date | null => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  return date;
};

const convertDateToString = (date: Date | null): string => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const convertDateToISO = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toISOString();
};

const achievementSchema = z.object({
  achievementType: z.enum([
    "academic",
    "competition",
    "organization",
    "publication",
    "certification",
    "other",
  ]),
  title: z.string().min(1, "Judul prestasi harus diisi"),
  description: z.string().min(1, "Deskripsi harus diisi"),
  points: z.number().min(1, "Poin harus lebih dari 0"),
  tags: z.array(z.string()).optional(),
  attachments: z.array(z.any()).optional(),
  details: z.any().optional(),
});

type AchievementFormData = z.infer<typeof achievementSchema>;

interface AchievementFormProps {
  achievement?: Achievement | null;
  onSubmit: (data: CreateAchievementRequest | UpdateAchievementRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AchievementForm = memo(function AchievementForm({
  achievement,
  onSubmit,
  onCancel,
  isLoading = false,
}: AchievementFormProps) {
  const [tagInput, setTagInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<Attachment[]>(
    achievement?.attachments || []
  );
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  const form = useForm<AchievementFormData>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      achievementType: achievement?.achievementType || "competition",
      title: achievement?.title || "",
      description: achievement?.description || "",
      points: achievement?.points || 0,
      tags: achievement?.tags || [],
      attachments: achievement?.attachments || [],
      details: achievement?.details || {},
    },
  });

  const achievementType = form.watch("achievementType");
  const watchedTags = form.watch("tags");
  const tagsMemo = useMemo(() => watchedTags || [], [watchedTags]);

  useEffect(() => {
    if (achievement) {
      form.reset({
        achievementType: achievement.achievementType,
        title: achievement.title,
        description: achievement.description,
        points: achievement.points,
        tags: achievement.tags || [],
        attachments: achievement.attachments || [],
        details: achievement.details || {},
      });
      setUploadedFiles(achievement.attachments || []);
    } else {
      form.reset({
        achievementType: "competition",
        title: "",
        description: "",
        points: 0,
        tags: [],
        attachments: [],
        details: {},
      });
      setUploadedFiles([]);
    }
  }, [achievement, form]);

  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !tagsMemo.includes(tagInput.trim())) {
      form.setValue("tags", [...tagsMemo, tagInput.trim()]);
      setTagInput("");
    }
  }, [tagInput, tagsMemo, form]);

  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      form.setValue(
        "tags",
        tagsMemo.filter((tag) => tag !== tagToRemove)
      );
    },
    [tagsMemo, form]
  );

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      if (uploadedFiles.length + files.length > 5) {
        setError("Maksimal 5 file dapat di-upload.");
        return;
      }

      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const maxSize = 10 * 1024 * 1024;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!allowedTypes.includes(file.type)) {
          setError(`File ${file.name} tidak diizinkan. Gunakan PDF, JPG, PNG, DOC, atau DOCX.`);
          continue;
        }

        if (file.size > maxSize) {
          setError(`File ${file.name} terlalu besar. Maksimal 10MB.`);
          continue;
        }

        setUploadingFiles((prev) => new Set(prev).add(file.name));

        try {
          const response = await achievementService.uploadFile(file);
          if (response.status === "success" && response.data) {
            const attachment: Attachment = response.data;
            setUploadedFiles((prev) => [...prev, attachment]);
            form.setValue("attachments", [...uploadedFiles, attachment]);
          }
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : `Gagal mengupload file ${file.name}. Silakan coba lagi.`
          );
        } finally {
          setUploadingFiles((prev) => {
            const newSet = new Set(prev);
            newSet.delete(file.name);
            return newSet;
          });
        }
      }

      e.target.value = "";
    },
    [uploadedFiles, form]
  );

  const handleRemoveFile = useCallback(
    (index: number) => {
      const newFiles = uploadedFiles.filter((_, i) => i !== index);
      setUploadedFiles(newFiles);
      form.setValue("attachments", newFiles);
    },
    [uploadedFiles, form]
  );

  const handleSubmit = form.handleSubmit(async (data) => {
    setError("");

    const details: AchievementDetails = {};

    if (achievementType === "competition") {
      const formDetails = form.getValues("details") || {};
      details.competitionName = formDetails.competitionName;
      details.competitionLevel = formDetails.competitionLevel;
      details.rank = formDetails.rank;
      details.medalType = formDetails.medalType;
      details.eventDate = formDetails.eventDate
        ? convertDateToISO(formDetails.eventDate as string)
        : undefined;
      details.location = formDetails.location;
      details.organizer = formDetails.organizer;
    } else if (achievementType === "publication") {
      const formDetails = form.getValues("details") || {};
      details.publicationType = formDetails.publicationType;
      details.publicationTitle = formDetails.publicationTitle;
      details.publisher = formDetails.publisher;
      details.issn = formDetails.issn;
      details.eventDate = formDetails.eventDate
        ? convertDateToISO(formDetails.eventDate as string)
        : undefined;
    } else if (achievementType === "organization") {
      const formDetails = form.getValues("details") || {};
      details.organizationName = formDetails.organizationName;
      details.position = formDetails.position;
      if (formDetails.period) {
        details.period = {
          start: convertDateToISO((formDetails.period as { start: string }).start),
          end: convertDateToISO((formDetails.period as { end: string }).end),
        };
      }
    } else if (achievementType === "certification") {
      const formDetails = form.getValues("details") || {};
      details.certificationName = formDetails.certificationName;
      details.issuedBy = formDetails.issuedBy;
      details.certificationNumber = formDetails.certificationNumber;
      details.eventDate = formDetails.eventDate
        ? convertDateToISO(formDetails.eventDate as string)
        : undefined;
      details.validUntil = formDetails.validUntil
        ? convertDateToISO(formDetails.validUntil as string)
        : undefined;
    } else if (achievementType === "academic") {
      const formDetails = form.getValues("details") || {};
      details.score = formDetails.score;
      details.eventDate = formDetails.eventDate
        ? convertDateToISO(formDetails.eventDate as string)
        : undefined;
    }

    const submitData = {
      achievementType: data.achievementType,
      title: data.title,
      description: data.description,
      points: data.points,
      tags: data.tags,
      attachments: uploadedFiles,
      details,
    };

    try {
      await onSubmit(submitData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan prestasi. Silakan coba lagi."
      );
    }
  });

  const renderDetailsFields = () => {
    const formDetails = form.watch("details") || {};

    if (achievementType === "competition") {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="competitionName">Nama Kompetisi</Label>
            <Input
              id="competitionName"
              placeholder="Contoh: National Programming Contest 2025"
              value={(formDetails.competitionName as string) || ""}
              onChange={(e) =>
                form.setValue("details", {
                  ...formDetails,
                  competitionName: e.target.value,
                })
              }
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="competitionLevel">Tingkat Kompetisi</Label>
            <Select
              options={competitionLevelOptions}
              value={(formDetails.competitionLevel as string) || ""}
              onChange={(value) =>
                form.setValue("details", {
                  ...formDetails,
                  competitionLevel: value as string,
                })
              }
              placeholder="Pilih tingkat"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rank">Peringkat</Label>
            <Input
              id="rank"
              type="number"
              placeholder="Contoh: 1"
              value={(formDetails.rank as number) || ""}
              onChange={(e) =>
                form.setValue("details", {
                  ...formDetails,
                  rank: parseInt(e.target.value) || 0,
                })
              }
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="medalType">Jenis Medali</Label>
            <Input
              id="medalType"
              placeholder="Contoh: Gold, Silver, Bronze"
              value={(formDetails.medalType as string) || ""}
              onChange={(e) =>
                form.setValue("details", {
                  ...formDetails,
                  medalType: e.target.value,
                })
              }
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventDate">Tanggal Event</Label>
            <DatePicker
              value={convertStringToDate(formDetails.eventDate as string)}
              onChange={(date) =>
                form.setValue("details", {
                  ...formDetails,
                  eventDate: convertDateToString(date),
                })
              }
              placeholder="Pilih tanggal event"
              format={formatDateForDisplay}
              className="w-full"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Lokasi</Label>
            <Input
              id="location"
              placeholder="Contoh: Jakarta"
              value={(formDetails.location as string) || ""}
              onChange={(e) =>
                form.setValue("details", {
                  ...formDetails,
                  location: e.target.value,
                })
              }
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organizer">Penyelenggara</Label>
            <Input
              id="organizer"
              placeholder="Contoh: Kementerian Pendidikan"
              value={(formDetails.organizer as string) || ""}
              onChange={(e) =>
                form.setValue("details", {
                  ...formDetails,
                  organizer: e.target.value,
                })
              }
              disabled={isLoading}
            />
          </div>
        </div>
      );
    }

    if (achievementType === "publication") {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="publicationType">Tipe Publikasi</Label>
            <Select
              options={publicationTypeOptions}
              value={(formDetails.publicationType as string) || ""}
              onChange={(value) =>
                form.setValue("details", {
                  ...formDetails,
                  publicationType: value as string,
                })
              }
              placeholder="Pilih tipe"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="publicationTitle">Judul Publikasi</Label>
            <Input
              id="publicationTitle"
              placeholder="Contoh: Machine Learning Applications in Education"
              value={(formDetails.publicationTitle as string) || ""}
              onChange={(e) =>
                form.setValue("details", {
                  ...formDetails,
                  publicationTitle: e.target.value,
                })
              }
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="publisher">Publisher</Label>
            <Input
              id="publisher"
              placeholder="Contoh: IEEE"
              value={(formDetails.publisher as string) || ""}
              onChange={(e) =>
                form.setValue("details", {
                  ...formDetails,
                  publisher: e.target.value,
                })
              }
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="issn">ISSN</Label>
            <Input
              id="issn"
              placeholder="Contoh: 1234-5678"
              value={(formDetails.issn as string) || ""}
              onChange={(e) =>
                form.setValue("details", {
                  ...formDetails,
                  issn: e.target.value,
                })
              }
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventDate">Tanggal Event</Label>
            <DatePicker
              value={convertStringToDate(formDetails.eventDate as string)}
              onChange={(date) =>
                form.setValue("details", {
                  ...formDetails,
                  eventDate: convertDateToString(date),
                })
              }
              placeholder="Pilih tanggal event"
              format={formatDateForDisplay}
              className="w-full"
              disabled={isLoading}
            />
          </div>
        </div>
      );
    }

    if (achievementType === "organization") {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organizationName">Nama Organisasi</Label>
            <Input
              id="organizationName"
              placeholder="Contoh: Himpunan Mahasiswa Teknik Informatika"
              value={(formDetails.organizationName as string) || ""}
              onChange={(e) =>
                form.setValue("details", {
                  ...formDetails,
                  organizationName: e.target.value,
                })
              }
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Posisi</Label>
            <Input
              id="position"
              placeholder="Contoh: Ketua"
              value={(formDetails.position as string) || ""}
              onChange={(e) =>
                form.setValue("details", {
                  ...formDetails,
                  position: e.target.value,
                })
              }
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="periodStart">Tanggal Mulai</Label>
            <DatePicker
              value={
                formDetails.period
                  ? convertStringToDate(
                      (formDetails.period as { start: string }).start
                    )
                  : null
              }
              onChange={(date) =>
                form.setValue("details", {
                  ...formDetails,
                  period: {
                    start: convertDateToString(date),
                    end: formDetails.period
                      ? (formDetails.period as { end: string }).end
                      : "",
                  },
                })
              }
              placeholder="Pilih tanggal mulai"
              format={formatDateForDisplay}
              className="w-full"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="periodEnd">Tanggal Selesai</Label>
            <DatePicker
              value={
                formDetails.period
                  ? convertStringToDate(
                      (formDetails.period as { end: string }).end
                    )
                  : null
              }
              onChange={(date) =>
                form.setValue("details", {
                  ...formDetails,
                  period: {
                    start: formDetails.period
                      ? (formDetails.period as { start: string }).start
                      : "",
                    end: convertDateToString(date),
                  },
                })
              }
              placeholder="Pilih tanggal selesai"
              format={formatDateForDisplay}
              className="w-full"
              disabled={isLoading}
            />
          </div>
        </div>
      );
    }

    if (achievementType === "certification") {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="certificationName">Nama Sertifikasi</Label>
            <Input
              id="certificationName"
              placeholder="Contoh: AWS Certified Solutions Architect"
              value={(formDetails.certificationName as string) || ""}
              onChange={(e) =>
                form.setValue("details", {
                  ...formDetails,
                  certificationName: e.target.value,
                })
              }
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="issuedBy">Diterbitkan Oleh</Label>
            <Input
              id="issuedBy"
              placeholder="Contoh: Amazon Web Services"
              value={(formDetails.issuedBy as string) || ""}
              onChange={(e) =>
                form.setValue("details", {
                  ...formDetails,
                  issuedBy: e.target.value,
                })
              }
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="certificationNumber">Nomor Sertifikasi</Label>
            <Input
              id="certificationNumber"
              placeholder="Contoh: AWS-123456789"
              value={(formDetails.certificationNumber as string) || ""}
              onChange={(e) =>
                form.setValue("details", {
                  ...formDetails,
                  certificationNumber: e.target.value,
                })
              }
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventDate">Tanggal Event</Label>
            <DatePicker
              value={convertStringToDate(formDetails.eventDate as string)}
              onChange={(date) =>
                form.setValue("details", {
                  ...formDetails,
                  eventDate: convertDateToString(date),
                })
              }
              placeholder="Pilih tanggal event"
              format={formatDateForDisplay}
              className="w-full"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="validUntil">Berlaku Sampai</Label>
            <DatePicker
              value={convertStringToDate(formDetails.validUntil as string)}
              onChange={(date) =>
                form.setValue("details", {
                  ...formDetails,
                  validUntil: convertDateToString(date),
                })
              }
              placeholder="Pilih tanggal berlaku sampai"
              format={formatDateForDisplay}
              className="w-full"
              disabled={isLoading}
            />
          </div>
        </div>
      );
    }

    if (achievementType === "academic") {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="score">Nilai/IPK</Label>
            <Input
              id="score"
              type="number"
              step="0.01"
              placeholder="Contoh: 3.95"
              value={(formDetails.score as number) || ""}
              onChange={(e) =>
                form.setValue("details", {
                  ...formDetails,
                  score: parseFloat(e.target.value) || 0,
                })
              }
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventDate">Tanggal Event</Label>
            <DatePicker
              value={convertStringToDate(formDetails.eventDate as string)}
              onChange={(date) =>
                form.setValue("details", {
                  ...formDetails,
                  eventDate: convertDateToString(date),
                })
              }
              placeholder="Pilih tanggal event"
              format={formatDateForDisplay}
              className="w-full"
              disabled={isLoading}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="achievementType">Tipe Prestasi *</Label>
        <Select
          options={achievementTypeOptions}
          value={form.watch("achievementType")}
          onChange={(value) => {
            form.setValue("achievementType", value as AchievementType);
            form.setValue("details", {});
          }}
          disabled={isLoading}
        />
        {form.formState.errors.achievementType && (
          <p className="text-sm text-destructive">
            {form.formState.errors.achievementType.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Judul Prestasi *</Label>
        <Input
          id="title"
          {...form.register("title")}
          placeholder="Contoh: Juara 1 Lomba Programming Nasional"
          disabled={isLoading}
        />
        {form.formState.errors.title && (
          <p className="text-sm text-destructive">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi *</Label>
        <Textarea
          id="description"
          {...form.register("description")}
          placeholder="Jelaskan prestasi Anda secara detail"
          rows={4}
          disabled={isLoading}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="points">Poin Prestasi *</Label>
        <Input
          id="points"
          type="number"
          {...form.register("points", { valueAsNumber: true })}
          placeholder="Contoh: 100"
          min="1"
          disabled={isLoading}
        />
        {form.formState.errors.points && (
          <p className="text-sm text-destructive">
            {form.formState.errors.points.message}
          </p>
        )}
      </div>

      {renderDetailsFields()}

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <div className="flex gap-2 mb-2">
          <Input
            id="tags"
            placeholder="Tambahkan tag (tekan Enter)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
            disabled={isLoading}
          />
          <Button type="button" onClick={handleAddTag} variant="outline" disabled={isLoading}>
            Tambah
          </Button>
        </div>
        {tagsMemo.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tagsMemo.map((tag, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-2">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-destructive"
                  disabled={isLoading}
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="file-upload">Dokumen Pendukung</Label>
        <div className="space-y-4">
          <div className="relative">
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              disabled={uploadedFiles.length >= 5 || uploadingFiles.size > 0 || isLoading}
            />
            <label
              htmlFor="file-upload"
              className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                uploadedFiles.length >= 5 || uploadingFiles.size > 0 || isLoading
                  ? "border-muted bg-muted/50 cursor-not-allowed opacity-60"
                  : "border-border hover:border-primary hover:bg-primary/5"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
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
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="text-sm text-foreground font-medium">
                  {uploadingFiles.size > 0
                    ? "Mengupload..."
                    : uploadedFiles.length >= 5
                    ? "Maksimal 5 file"
                    : "Klik untuk upload file"}
                </span>
                <span className="text-xs text-muted-foreground">
                  PDF, JPG, PNG, DOC, DOCX (maks. 10MB per file)
                </span>
              </div>
            </label>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-lg shrink-0">
                      {file.fileType.includes("pdf") ? (
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
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                      ) : file.fileType.includes("image") ? (
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
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      ) : (
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file.fileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(file.uploadedAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="ml-3 p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                    disabled={isLoading}
                  >
                    <svg
                      className="w-5 h-5 text-destructive"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {uploadingFiles.size > 0 && (
            <div className="space-y-2">
              {Array.from(uploadingFiles).map((fileName) => (
                <div
                  key={fileName}
                  className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg"
                >
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-foreground">{fileName}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    Mengupload...
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
        <Button type="submit" disabled={isLoading} variant="default">
          {isLoading ? "Menyimpan..." : achievement ? "Update" : "Simpan"}
        </Button>
      </div>
    </form>
  );
});

