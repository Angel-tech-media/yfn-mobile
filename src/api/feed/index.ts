import { http } from '@/src/lib/http';

import type {
  Comment,
  CommentsResponse,
  CreateCommentRequest,
  CreatePostRequest,
  CreateReelRequest,
  CreateStoryRequest,
  FeedQuery,
  FeedResponse,
  Id,
  PageQuery,
  Post,
  Reel,
  Story,
} from '../types';

export const feedApi = {
  list(query: FeedQuery = {}) {
    return http.get<FeedResponse>('/feed', { query });
  },

  reels(query: PageQuery = {}) {
    return http.get<Reel[]>('/feed/reels', { query });
  },

  createPost(input: CreatePostRequest) {
    return http.post<Post>('/posts', input);
  },

  comments(postId: Id, query: FeedQuery = {}) {
    return http.get<CommentsResponse>(`/posts/${postId}/comments`, { query });
  },

  createComment(postId: Id, input: CreateCommentRequest) {
    return http.post<Comment>(`/posts/${postId}/comments`, input);
  },

  createStory(input: CreateStoryRequest) {
    return http.post<Story>('/stories', input);
  },

  storiesInbox() {
    return http.get<Story[]>('/stories/inbox');
  },

  createReel(input: CreateReelRequest) {
    return http.post<Reel>('/reels', input);
  },
};
