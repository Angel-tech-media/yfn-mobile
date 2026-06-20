import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { repostsApi } from '..';
import { queryKeys } from '../../query-keys';

import type { CreateRepostRequest, Id, RepostReelRequest } from '../../types';

export const useMyReposts = () =>
  useQuery({
    queryKey: queryKeys.reposts.me,
    queryFn: repostsApi.mine,
    staleTime: 30_000,
  });

export const useUserReposts = (handle: string) =>
  useQuery({
    queryKey: queryKeys.reposts.user(handle),
    queryFn: () => repostsApi.userReposts(handle),
    staleTime: 30_000,
    enabled: !!handle,
  });

export function useCreateRepost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRepostRequest) => repostsApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.reposts.me });
      qc.invalidateQueries({ queryKey: queryKeys.wallet.referrals });
    },
  });
}

export function useDeleteRepost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: repostsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.reposts.me });
      qc.invalidateQueries({ queryKey: queryKeys.wallet.referrals });
    },
  });
}

export function useRepostReel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reelId, input }: { reelId: Id; input?: RepostReelRequest }) =>
      repostsApi.repostReel(reelId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.reposts.me });
      qc.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}
