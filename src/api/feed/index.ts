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
  PostActionState,
  Reel,
  Story,
} from '../types';

export const feedApi = {
  list(query: FeedQuery = {}) {
    return http.get<FeedResponse>('/feed', { query });
  },

  getPost(postId: Id) {
    return http.get<Post>(`/posts/${postId}`);
  },

  reels(query: PageQuery = {}) {
    return http.get<Reel[]>('/feed/reels', { query });
  },

  myBookmarks(query: PageQuery = {}) {
    return http.get<FeedResponse>('/posts/bookmarks/me', { query });
  },

  myReposts(query: PageQuery = {}) {
    return http.get<FeedResponse>('/posts/reposts/me', { query });
  },

  userReposts(handle: string, query: PageQuery = {}) {
    return http.get<FeedResponse>(`/users/${handle}/posts/reposts`, { query });
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

  viewStory(storyId: Id) {
    return http.post<{ success: boolean }>(`/stories/${storyId}/view`);
  },

  likeStory(storyId: Id) {
    return http.post<{ success: boolean }>(`/stories/${storyId}/like`);
  },

  unlikeStory(storyId: Id) {
    return http.delete<{ success: boolean }>(`/stories/${storyId}/like`);
  },

  editStory(storyId: Id, input: { caption?: string }) {
    return http.patch<{ success: boolean }>(`/stories/${storyId}`, input);
  },

  deleteStory(storyId: Id) {
    return http.delete<{ success: boolean }>(`/stories/${storyId}`);
  },

  createReel(input: CreateReelRequest) {
    return http.post<Reel>('/reels', input);
  },

  likePost(postId: Id) {
    return http.post<PostActionState>(`/posts/${postId}/like`);
  },

  unlikePost(postId: Id) {
    return http.delete<PostActionState>(`/posts/${postId}/like`);
  },

  deletePost(postId: Id) {
    return http.delete<{ success: boolean }>(`/posts/${postId}`);
  },

  editPost(postId: Id, input: { caption?: string; mediaIds?: string[]; productId?: string | null }) {
    return http.patch<Post>(`/posts/${postId}`, input);
  },

  bookmarkPost(postId: Id) {
    return http.post<PostActionState>(`/posts/${postId}/bookmark`);
  },

  unbookmarkPost(postId: Id) {
    return http.delete<PostActionState>(`/posts/${postId}/bookmark`);
  },

  repostPost(postId: Id, input?: { caption?: string; visibility?: 'public' | 'mutuals' | 'close-friends' }) {
    return http.post<PostActionState>(`/posts/${postId}/repost`, input);
  },

  unrepostPost(postId: Id) {
    return http.delete<PostActionState>(`/posts/${postId}/repost`);
  },
};
