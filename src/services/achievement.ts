import { api } from "@/lib/api";
import { ApiResponse } from "@/types/api";
import {
  CreateAchievementRequest,
  CreateAchievementResponse,
  UpdateAchievementRequest,
  UpdateAchievementResponse,
  GetAchievementByIDResponse,
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

  async getAchievementById(id: string): Promise<GetAchievementByIDResponse> {
    const response = await api.get<GetAchievementByIDResponse["data"]>(
      `/api/v1/achievements/${id}`
    );
    return response as GetAchievementByIDResponse;
  },

  async updateAchievement(
    id: string,
    data: UpdateAchievementRequest
  ): Promise<UpdateAchievementResponse> {
    const response = await api.put<UpdateAchievementResponse["data"]>(
      `/api/v1/achievements/${id}`,
      data
    );
    return response as UpdateAchievementResponse;
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

  async getStats(): Promise<ApiResponse<{ total: number; verified: number; percentage: number }>> {
    const response = await api.get<{ total: number; verified: number; percentage: number }>(
      "/api/v1/achievements/stats",
      { skipAuth: true }
    );
    return response;
  },
};

