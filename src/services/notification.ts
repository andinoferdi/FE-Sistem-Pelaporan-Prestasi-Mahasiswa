import axios from "@/lib/axios";
import type {
  GetNotificationsResponse,
  GetUnreadCountResponse,
  MarkAsReadResponse,
  MarkAllAsReadResponse,
} from "@/types/notification";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const notificationService = {
  getNotifications: async (page: number = 1, limit: number = 10): Promise<GetNotificationsResponse> => {
    const response = await axios.get<GetNotificationsResponse>("/notifications", {
      params: { page, limit },
    });
    return response.data;
  },

  getUnreadCount: async (): Promise<GetUnreadCountResponse> => {
    const response = await axios.get<GetUnreadCountResponse>("/notifications/unread-count");
    return response.data;
  },

  markAsRead: async (id: string): Promise<MarkAsReadResponse> => {
    const response = await axios.put<MarkAsReadResponse>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<MarkAllAsReadResponse> => {
    const response = await axios.put<MarkAllAsReadResponse>("/notifications/read-all");
    return response.data;
  },
};

export const useNotifications = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["notifications", page, limit],
    queryFn: () => notificationService.getNotifications(page, limit),
    refetchOnWindowFocus: false,
    staleTime: 30000,
    refetchInterval: 30000,
  });
};

export const useNotificationCount = () => {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationService.getUnreadCount(),
    refetchOnWindowFocus: false,
    staleTime: 10000,
    refetchInterval: 30000,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

