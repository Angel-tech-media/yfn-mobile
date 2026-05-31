import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { hiveApi } from '..';
import { queryKeys } from '../../query-keys';

import type { CreateHiveMessageRequest, Id, PageQuery, VotePollRequest } from '../../types';

export const useHiveTree = () =>
  useQuery({
    queryKey: queryKeys.hive.tree,
    queryFn: hiveApi.tree,
    staleTime: 60_000,
  });

export function useHiveDetail(slugPath: string | undefined) {
  return useQuery({
    queryKey: queryKeys.hive.detail(slugPath),
    enabled: !!slugPath,
    queryFn: () => hiveApi.detail(slugPath!),
    staleTime: 30_000,
  });
}

export function useHiveMessages(slugPath: string | undefined, params: PageQuery = {}) {
  return useQuery({
    queryKey: queryKeys.hive.messages(slugPath, params),
    enabled: !!slugPath,
    queryFn: () => hiveApi.messages(slugPath!, params),
    refetchInterval: 5000,
  });
}

export function useJoinHive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hiveApi.join,
    onSuccess: (_, slugPath) => {
      qc.invalidateQueries({ queryKey: queryKeys.hive.detail(slugPath) });
      qc.invalidateQueries({ queryKey: queryKeys.hive.tree });
    },
  });
}

export function useSendHiveMessage(slugPath: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateHiveMessageRequest) => {
      if (!slugPath) throw new Error('slugPath required');
      return hiveApi.sendMessage(slugPath, input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hive', slugPath, 'messages'] });
    },
  });
}

export function useVoteHivePoll(slugPath: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: Id; input: VotePollRequest }) => {
      if (!slugPath) throw new Error('slugPath required');
      return hiveApi.vote(slugPath, id, input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hive', slugPath] });
    },
  });
}
