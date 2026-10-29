import { http } from '@/src/lib/http';

export type ReportTargetType = 'user' | 'post' | 'reel' | 'comment' | 'product';

export interface SubmitReportInput {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details?: string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporterUsername: string;
  reporterName?: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
  actionTaken?: string;
  reviewedAt?: string | null;
  createdAt: string;
}

export interface BlockedUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  blockedAt: string;
}

export const moderationApi = {
  submitReport(input: SubmitReportInput) {
    return http.post<{ success: boolean; reportId: string; message: string }>('/reports', input);
  },

  listReports(params: { status?: string; targetType?: string; page?: number; limit?: number } = {}) {
    return http.get<ReportItem[]>('/admin/reports', { query: params });
  },

  updateReport(id: string, input: { status: string; actionTaken?: string }) {
    return http.patch<{ success: boolean; report: ReportItem }>(`/admin/reports/${id}`, input);
  },

  blockUser(userId: string) {
    return http.post<{ blocked: boolean; userId: string }>(`/users/${userId}/block`);
  },

  unblockUser(userId: string) {
    return http.delete<{ blocked: boolean; userId: string }>(`/users/${userId}/block`);
  },

  listBlockedUsers() {
    return http.get<BlockedUser[]>('/me/blocks');
  },

  deleteAccount() {
    return http.delete<{ success: boolean; message: string }>('/me');
  },
};
