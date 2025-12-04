import { api } from "@/lib/api";
import { ApiResponse } from "@/types/api";
import {
  CreateAchievementRequest,
  CreateAchievementResponse,
  SubmitAchievementResponse,
  DeleteAchievementResponse,
  Achievement,
  Attachment,
} from "@/types/achievement";

export const achievementService = {
  async createAchievement(
    data: CreateAchievementRequest
  ): Promise<CreateAchievementResponse> {
    const response = await api.post<CreateAchievementResponse["data"]>(
      "/api/v1/achievements",
      data
    );
    return response as CreateAchievementResponse;
  },

  async submitAchievement(id: string): Promise<SubmitAchievementResponse> {
    const response = await api.post<SubmitAchievementResponse["data"]>(
      `/api/v1/achievements/${id}/submit`
    );
    return response as SubmitAchievementResponse;
  },

  async deleteAchievement(id: string): Promise<DeleteAchievementResponse> {
    const response = await api.delete<DeleteAchievementResponse["data"]>(
      `/api/v1/achievements/${id}`
    );
    return response as DeleteAchievementResponse;
  },

  async getAchievements(): Promise<ApiResponse<Achievement[]>> {
    const response = await api.get<Achievement[]>("/api/v1/achievements");
    return response;
  },

  async uploadFile(file: File): Promise<ApiResponse<Attachment>> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.upload<Attachment>(
      "/api/v1/achievements/upload",
      formData
    );
    return response;
  },
};

