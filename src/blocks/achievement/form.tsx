"use client";

import { useState, useMemo, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/ui/file-upload";
import { DatePicker } from "@/components/ui/date-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { FileOrigin, FilePondFile } from "filepond";
import { X } from "lucide-react";
import { type DateRange } from "react-day-picker";

export type AchievementType =
  | "academic"
  | "competition"
  | "organization"
  | "publication"
  | "certification"
  | "other";

export type CompetitionLevel =
  | "international"
  | "national"
  | "regional"
  | "local";

export type PublicationType = "journal" | "conference" | "book";

export interface Period {
  start: string | null; // ISO string (date)
  end: string | null;
}

export interface Attachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
}

export interface AchievementDetails {
  competitionName?: string | null;
  competitionLevel?: CompetitionLevel | null;
  rank?: number | null;
  medalType?: string | null;
  publicationType?: PublicationType | null;
  publicationTitle?: string | null;
  authors?: string[];
  publisher?: string | null;
  issn?: string | null;
  organizationName?: string | null;
  position?: string | null;
  period?: Period | null;
  certificationName?: string | null;
  issuedBy?: string | null;
  certificationNumber?: string | null;
  validUntil?: string | null; // ISO date
  eventDate?: string | null; // ISO date
  location?: string | null;
  organizer?: string | null;
  score?: number | null;
  customFields?: Record<string, unknown>;
}

export interface AchievementFormValues {
  achievementType: AchievementType;
  title: string;
  description: string;
  points: number;
  tags: string[];
  details: AchievementDetails;
  attachments?: Attachment[];
}

export interface AchievementFormProps {
  /**
   * Mode: 'create' atau 'edit'
   */
  mode?: "create" | "edit";
  /**
   * Initial value untuk edit
   */
  initialValues?: Partial<AchievementFormValues>;
  /**
   * Dipanggil ketika submit form sukses.
   * Biar pemanggil yang urus call API (kalau mau).
   */
  onSubmit?: (values: AchievementFormValues) => Promise<void> | void;
  /**
   * Loading external (kalau submit dihandle parent)
   */
  submitting?: boolean;
  /**
   * Callback untuk file yang dipending (belum diupload)
   */
  onPendingFilesChange?: (files: File[]) => void;
}

/**
 * AchievementForm
 * - handle local state values
 * - validasi dasar (required)
 * - panggil onSubmit(values) ketika form submit
 */
export function AchievementForm({
  mode = "create",
  initialValues,
  onSubmit,
  submitting: externalSubmitting,
  onPendingFilesChange,
}: AchievementFormProps) {
  const [achievementType, setAchievementType] = useState<AchievementType>(
    (initialValues?.achievementType as AchievementType) ?? "academic"
  );
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? ""
  );
  const [points, setPoints] = useState<number>(initialValues?.points ?? 0);

  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialValues?.tags ?? []);

  const [details, setDetails] = useState<AchievementDetails>({
    competitionName: initialValues?.details?.competitionName ?? null,
    competitionLevel:
      (initialValues?.details?.competitionLevel as CompetitionLevel) ?? null,
    rank: initialValues?.details?.rank ?? null,
    medalType: initialValues?.details?.medalType ?? null,
    publicationType:
      (initialValues?.details?.publicationType as PublicationType) ?? null,
    publicationTitle: initialValues?.details?.publicationTitle ?? null,
    authors: initialValues?.details?.authors ?? [],
    publisher: initialValues?.details?.publisher ?? null,
    issn: initialValues?.details?.issn ?? null,
    organizationName: initialValues?.details?.organizationName ?? null,
    position: initialValues?.details?.position ?? null,
    period: initialValues?.details?.period ?? {
      start: null,
      end: null,
    },
    certificationName: initialValues?.details?.certificationName ?? null,
    issuedBy: initialValues?.details?.issuedBy ?? null,
    certificationNumber: initialValues?.details?.certificationNumber ?? null,
    validUntil: initialValues?.details?.validUntil ?? null,
    eventDate: initialValues?.details?.eventDate ?? null,
    location: initialValues?.details?.location ?? null,
    organizer: initialValues?.details?.organizer ?? null,
    score: initialValues?.details?.score ?? null,
    customFields: initialValues?.details?.customFields ?? {},
  });

  const [authorInput, setAuthorInput] = useState("");

  const [, setPendingFiles] = useState<File[]>([]);
  const existingAttachments = useMemo(
    () => initialValues?.attachments ?? [],
    [initialValues?.attachments]
  );
  const [attachments, setAttachments] = useState<Attachment[]>(existingAttachments);

  const [localSubmitting, setLocalSubmitting] = useState(false);
  const submitting = externalSubmitting ?? localSubmitting;

  function toAbsoluteUrl(url: string) {
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${url}`;
  }

  const initialPondFiles = useMemo(() => {
    return existingAttachments.map((att) => {
      const abs = toAbsoluteUrl(att.fileUrl);
      return {
        source: abs,
        options: {
          type: "local" as const,
          file: { name: att.fileName, type: att.fileType },
          metadata: {
            poster: abs,
            attachment: att,
          },
        },
      };
    });
  }, [existingAttachments]);

  const isCompetition = useMemo(
    () => achievementType === "competition",
    [achievementType]
  );

  const isPublication = useMemo(
    () => achievementType === "publication",
    [achievementType]
  );

  const isOrganization = useMemo(
    () => achievementType === "organization",
    [achievementType]
  );

  const isCertification = useMemo(
    () => achievementType === "certification",
    [achievementType]
  );

  const showEventDate = useMemo(
    () => achievementType === "competition" || achievementType === "academic",
    [achievementType]
  );

  function handleAddTag() {
    const value = tagsInput.trim();
    if (!value) return;
    if (tags.includes(value)) {
      setTagsInput("");
      return;
    }
    setTags((prev) => [...prev, value]);
    setTagsInput("");
  }

  function handleRemoveTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function handleAddAuthor() {
    const value = authorInput.trim();
    if (!value) return;
    if (details.authors?.includes(value)) {
      setAuthorInput("");
      return;
    }
    setDetails((prev) => ({
      ...prev,
      authors: [...(prev.authors ?? []), value],
    }));
    setAuthorInput("");
  }

  function handleRemoveAuthor(name: string) {
    setDetails((prev) => ({
      ...prev,
      authors: (prev.authors ?? []).filter((a) => a !== name),
    }));
  }

  function updateDetails<K extends keyof AchievementDetails>(
    key: K,
    value: AchievementDetails[K]
  ) {
    setDetails((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function formatDateToLocalString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function parseDateString(dateStr: string | null | undefined): Date | undefined {
    if (!dateStr) return undefined;
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return isNaN(date.getTime()) ? undefined : date;
    }
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? undefined : date;
  }

  function handlePeriodChange(range: DateRange | undefined) {
    setDetails((prev) => ({
      ...prev,
      period: range?.from && range?.to
        ? {
            start: formatDateToLocalString(range.from),
            end: formatDateToLocalString(range.to),
          }
        : null,
    }));
  }

  function getPeriodDateRange(): DateRange | undefined {
    const start = parseDateString(details.period?.start);
    const end = parseDateString(details.period?.end);
    if (start && end) {
      return { from: start, to: end };
    }
    return undefined;
  }

  function handleFileChange(fileItems: FilePondFile[] | null) {
    const items = fileItems ?? [];
    const nextAttachments = items
      .filter((item) => item?.origin === FileOrigin.LOCAL)
      .map((item) => {
        try {
          return item.getMetadata("attachment");
        } catch {
          return null;
        }
      })
      .filter(Boolean) as Attachment[];
    const nextPendingFiles = items
      .filter((item) => item?.origin === FileOrigin.INPUT)
      .map((item) => item.file)
      .filter((file): file is File => file instanceof File);

    setAttachments(nextAttachments);
    setPendingFiles(nextPendingFiles);
    onPendingFilesChange?.(nextPendingFiles);
  }


  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert("Title dan description wajib diisi");
      return;
    }

    const payload: AchievementFormValues = {
      achievementType,
      title: title.trim(),
      description: description.trim(),
      points: Number.isNaN(points) ? 0 : points,
      tags,
      details: {
        ...details,
        // bersihkan string kosong jadi null
        competitionName: details.competitionName?.trim() || null,
        medalType: details.medalType?.trim() || null,
        publicationTitle: details.publicationTitle?.trim() || null,
        publisher: details.publisher?.trim() || null,
        issn: details.issn?.trim() || null,
        organizationName: details.organizationName?.trim() || null,
        position: details.position?.trim() || null,
        certificationName: details.certificationName?.trim() || null,
        issuedBy: details.issuedBy?.trim() || null,
        certificationNumber: details.certificationNumber?.trim() || null,
        location: details.location?.trim() || null,
        organizer: details.organizer?.trim() || null,
      },
      attachments,
    };

    if (!onSubmit) {
      console.warn("AchievementForm di-submit, tapi tidak ada onSubmit prop.");
      return;
    }

    try {
      setLocalSubmitting(true);
      await onSubmit(payload);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data prestasi");
    } finally {
      setLocalSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-lg border p-4 md:p-6"
    >
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">
          {mode === "create" ? "Tambah Prestasi" : "Edit Prestasi"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Isi data prestasi sesuai format yang diminta sistem.
        </p>
      </div>

      {/* Basic Fields */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="achievementType">Jenis Prestasi</Label>
          <Select
            value={achievementType}
            onValueChange={(val) => setAchievementType(val as AchievementType)}
          >
            <SelectTrigger id="achievementType" className="w-full">
              <SelectValue placeholder="Pilih jenis prestasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="academic">Akademik</SelectItem>
              <SelectItem value="competition">Kompetisi</SelectItem>
              <SelectItem value="organization">Organisasi</SelectItem>
              <SelectItem value="publication">Publikasi</SelectItem>
              <SelectItem value="certification">Sertifikasi</SelectItem>
              <SelectItem value="other">Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="points">Poin</Label>
          <Input
            id="points"
            type="number"
            min={0}
            value={points || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                setPoints(0);
                return;
              }
              const cleanedValue = value.replace(/^0+/, "") || "0";
              const numValue = parseInt(cleanedValue, 10);
              if (!isNaN(numValue) && numValue >= 0) {
                setPoints(numValue);
                e.target.value = String(numValue);
              }
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Judul Prestasi</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Juara 1 Lomba Web Development Tingkat Nasional"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Jelaskan detail prestasi, konteks lomba / kegiatan, kontribusi Anda, dll."
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Tambahkan tag lalu tekan Enter / klik Tambah"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <Button type="button" onClick={handleAddTag} variant="outline">
            Tambah
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="flex items-center gap-1"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 inline-flex"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Conditional sections by achievementType */}
      {isCompetition && (
        <div className="space-y-4 rounded-md border p-4">
          <h3 className="text-sm font-semibold">Detail Lomba / Kompetisi</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="competitionName">Nama Kompetisi</Label>
              <Input
                id="competitionName"
                value={details.competitionName ?? ""}
                onChange={(e) =>
                  updateDetails("competitionName", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitionLevel">Level Kompetisi</Label>
              <Select
                value={details.competitionLevel || undefined}
                onValueChange={(val) =>
                  updateDetails("competitionLevel", val as CompetitionLevel)
                }
              >
                <SelectTrigger id="competitionLevel" className="w-full">
                  <SelectValue placeholder="Pilih level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="international">Internasional</SelectItem>
                  <SelectItem value="national">Nasional</SelectItem>
                  <SelectItem value="regional">Regional</SelectItem>
                  <SelectItem value="local">Lokal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rank">Peringkat</Label>
              <Input
                id="rank"
                type="number"
                min={1}
                value={details.rank ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    updateDetails("rank", null);
                    return;
                  }
                  const cleanedValue = value.replace(/^0+/, "");
                  if (cleanedValue === "") {
                    updateDetails("rank", null);
                    return;
                  }
                  const numValue = parseInt(cleanedValue, 10);
                  if (!isNaN(numValue) && numValue >= 1) {
                    updateDetails("rank", numValue);
                    e.target.value = String(numValue);
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medalType">Jenis Medali</Label>
              <Select
                value={details.medalType || undefined}
                onValueChange={(val) => updateDetails("medalType", val)}
              >
                <SelectTrigger id="medalType" className="w-full">
                  <SelectValue placeholder="Pilih jenis medali" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Emas">Emas</SelectItem>
                  <SelectItem value="Perak">Perak</SelectItem>
                  <SelectItem value="Perunggu">Perunggu</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {isPublication && (
        <div className="space-y-4 rounded-md border p-4">
          <h3 className="text-sm font-semibold">Detail Publikasi</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="publicationType">Tipe Publikasi</Label>
              <Select
                value={details.publicationType || undefined}
                onValueChange={(val) =>
                  updateDetails("publicationType", val as PublicationType)
                }
              >
                <SelectTrigger id="publicationType" className="w-full">
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="journal">Jurnal</SelectItem>
                  <SelectItem value="conference">Konferensi</SelectItem>
                  <SelectItem value="book">Buku</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="publicationTitle">Judul Publikasi</Label>
              <Input
                id="publicationTitle"
                value={details.publicationTitle ?? ""}
                onChange={(e) =>
                  updateDetails("publicationTitle", e.target.value)
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Penulis</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nama penulis"
                  value={authorInput}
                  onChange={(e) => setAuthorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddAuthor();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddAuthor}
                >
                  Tambah
                </Button>
              </div>
              {details.authors && details.authors.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {details.authors.map((author) => (
                    <Badge
                      key={author}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <span>{author}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAuthor(author)}
                        className="ml-1 inline-flex"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="publisher">Penerbit</Label>
              <Input
                id="publisher"
                value={details.publisher ?? ""}
                onChange={(e) => updateDetails("publisher", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issn">ISSN</Label>
              <Input
                id="issn"
                value={details.issn ?? ""}
                onChange={(e) => updateDetails("issn", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {isOrganization && (
        <div className="space-y-4 rounded-md border p-4">
          <h3 className="text-sm font-semibold">Detail Organisasi</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Nama Organisasi</Label>
              <Input
                id="organizationName"
                value={details.organizationName ?? ""}
                onChange={(e) =>
                  updateDetails("organizationName", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Jabatan</Label>
              <Input
                id="position"
                value={details.position ?? ""}
                onChange={(e) => updateDetails("position", e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Periode</Label>
              <DateRangePicker
                value={getPeriodDateRange()}
                onChange={handlePeriodChange}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {isCertification && (
        <div className="space-y-4 rounded-md border p-4">
          <h3 className="text-sm font-semibold">Detail Sertifikasi</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="certificationName">Nama Sertifikasi</Label>
              <Input
                id="certificationName"
                value={details.certificationName ?? ""}
                onChange={(e) =>
                  updateDetails("certificationName", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issuedBy">Diterbitkan Oleh</Label>
              <Input
                id="issuedBy"
                value={details.issuedBy ?? ""}
                onChange={(e) => updateDetails("issuedBy", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificationNumber">Nomor Sertifikat</Label>
              <Input
                id="certificationNumber"
                value={details.certificationNumber ?? ""}
                onChange={(e) =>
                  updateDetails("certificationNumber", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil">Berlaku Sampai</Label>
              <DatePicker
                value={parseDateString(details.validUntil)}
                onChange={(date) =>
                  updateDetails(
                    "validUntil",
                    date ? formatDateToLocalString(date) : null
                  )
                }
                placeholder="Pilih tanggal"
                withInput
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Event / Lokasi - bisa dipakai lintas jenis */}
      <div className="space-y-4 rounded-md border p-4">
        <h3 className="text-sm font-semibold">
          Informasi Acara & Skor / Nilai
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {showEventDate && (
            <div className="space-y-2">
              <Label htmlFor="eventDate">Tanggal Acara</Label>
              <DatePicker
                value={parseDateString(details.eventDate)}
                onChange={(date) =>
                  updateDetails(
                    "eventDate",
                    date ? formatDateToLocalString(date) : null
                  )
                }
                placeholder="Pilih tanggal acara"
                withInput
                className="w-full"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="location">Lokasi</Label>
            <Input
              id="location"
              value={details.location ?? ""}
              onChange={(e) => updateDetails("location", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizer">Penyelenggara</Label>
            <Input
              id="organizer"
              value={details.organizer ?? ""}
              onChange={(e) => updateDetails("organizer", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="score">Skor / Nilai (opsional)</Label>
            <Input
              id="score"
              type="number"
              value={details.score ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  updateDetails("score", null);
                  return;
                }
                const numValue = Number(value);
                if (!isNaN(numValue)) {
                  updateDetails("score", numValue);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Attachments */}
      <div className="space-y-4 rounded-md border p-4">
        <h3 className="text-sm font-semibold">Attachments</h3>
        
          <div className="space-y-2">
          <Label>Unggah File</Label>
          <FileUpload
            allowMultiple
            maxFiles={10}
            instantUpload={false}
            allowProcess={false}
            allowRevert={false}
            acceptedFileTypes={[
              "application/pdf",
              "image/jpeg",
              "image/jpg",
              "image/png",
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ]}
            initialFiles={initialPondFiles}
            onupdatefiles={handleFileChange}
          />
          <p className="text-xs text-muted-foreground">
            Format yang didukung: PDF, JPG, PNG, DOC, DOCX. Maksimal 10MB per
            file.
          </p>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting
            ? "Menyimpan..."
            : mode === "create"
            ? "Simpan Prestasi"
            : "Update Prestasi"}
        </Button>
      </div>
    </form>
  );
}
