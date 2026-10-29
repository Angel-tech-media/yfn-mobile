import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { moderationApi, type SubmitReportInput } from './index';

export function useSubmitReport() {
  return useMutation({
    mutationFn: (input: SubmitReportInput) => moderationApi.submitReport(input),
  });
}

export function useBlockedUsers() {
  return useQuery({
    queryKey: ['me', 'blocks'],
    queryFn: () => moderationApi.listBlockedUsers(),
  });
}

export function useBlockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => moderationApi.blockUser(userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['me', 'blocks'] });
    },
  });
}

export function useUnblockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => moderationApi.unblockUser(userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['me', 'blocks'] });
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => moderationApi.deleteAccount(),
  });
}
