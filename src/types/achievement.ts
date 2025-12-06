import { ApiResponse } from "./api";

export type AchievementType =
  | "academic"
  | "competition"
  | "organization"
  | "publication"
  | "certification"
  | "other";

export type AchievementStatus = "draft" | "submitted" | "verified" | "rejected";

export type CompetitionLevel =
  | "international"
  | "national"
  | "regional"
  | "local";

export type PublicationType = "journal" | "conference" | "book";

export interface Period {
  start: string;
  end: string;
}

export interface Attachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
}

export interface AchievementDetails {
  competitionName?: string;
  competitionLevel?: CompetitionLevel;
  rank?: number;
  medalType?: string;
  publicationType?: PublicationType;
  publicationTitle?: string;
  authors?: string[];
  publisher?: string;
  issn?: string;
  organizationName?: string;
  position?: string;
  period?: Period;
  certificationName?: string;
  issuedBy?: string;
  certificationNumber?: string;
  validUntil?: string;
  eventDate?: string;
  location?: string;
  organizer?: string;
  score?: number;
  customFields?: Record<string, unknown>;
}

export interface Achievement {
  id: string;
  studentId: string;
  achievementType: AchievementType;
  title: string;
  description: string;
  details: AchievementDetails;
  attachments?: Attachment[];
  tags?: string[];
  points: number;
  createdAt: string;
  updatedAt: string;
  status?: AchievementStatus;
}

export interface CreateAchievementRequest {
  achievementType: AchievementType;
  title: string;
  description: string;
  details?: AchievementDetails;
  attachments?: Attachment[];
  tags?: string[];
  points: number;
}

export interface UpdateAchievementRequest {
  achievementType?: AchievementType;
  title?: string;
  description?: string;
  details?: AchievementDetails;
  attachments?: Attachment[];
  tags?: string[];
  points?: number;
}

export interface AchievementReference {
  id: string;
  student_id: string;
  mongo_achievement_id: string;
  status: AchievementStatus;
  submitted_at?: string;
  verified_at?: string;
  verified_by?: string;
  rejection_note?: string;
  created_at: string;
  updated_at: string;
}

export type CreateAchievementResponse = ApiResponse<Achievement>;

export type GetAchievementByIDResponse = ApiResponse<Achievement>;

export type UpdateAchievementResponse = ApiResponse<Achievement>;

export type DeleteAchievementResponse = ApiResponse<null>;

export type SubmitAchievementResponse = ApiResponse<AchievementReference>;

