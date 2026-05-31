import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { feedApi } from '..';
import { queryKeys } from '../../query-keys';

import type {
  CreateCommentRequest,
  CreatePostRequest,
  CreateReelRequest,
  CreateStoryRequest,
  FeedQuery,
  Id,
  PageQuery,
} from '../../types';

export function useFeed(params: FeedQuery = {}) {
  return useQuery({
    queryKey: queryKeys.feed.list(params),
    queryFn: () => feedApi.list(params),
    staleTime: 15_000,
  });
}

export function useFeedReels(params: PageQuery = {}) {
  return useQuery({
    queryKey: queryKeys.feed.reels(params),
    queryFn: () => feedApi.reels(params),
    staleTime: 15_000,
  });
}

export function usePostComments(postId: Id | undefined, params: FeedQuery = {}) {
  return useQuery({
    queryKey: queryKeys.feed.comments(postId, params),
    enabled: !!postId,
    queryFn: () => feedApi.comments(postId!, params),
  });
}

export const useStoriesInbox = () =>
  useQuery({
    queryKey: queryKeys.feed.storiesInbox,
    queryFn: feedApi.storiesInbox,
    staleTime: 15_000,
  });

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePostRequest) => feedApi.createPost(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed'] }),
  });
}

export function useCreateComment(postId: Id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCommentRequest) => feedApi.createComment(postId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts', postId, 'comments'] }),
  });
}

export function useCreateStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStoryRequest) => feedApi.createStory(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.feed.storiesInbox }),
  });
}

export function useCreateReel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReelRequest) => feedApi.createReel(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed', 'reels'] }),
  });
}
