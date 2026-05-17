import type { ImageSourcePropType } from 'react-native';

import { create } from 'zustand';

export type UserPost = {
  id: string;
  caption: string;
  image: ImageSourcePropType;
  product?: { id: string; name: string; price: string };
  ts: number;
  likes: number;
  comments: number;
};

export type UserStory = {
  id: string;
  image: ImageSourcePropType;
  caption?: string;
  ts: number;
};

export type UserReel = {
  id: string;
  cover: ImageSourcePropType;
  caption: string;
  audio?: string;
  ts: number;
  views: number;
};

export type UserProduct = {
  id: string;
  name: string;
  price: number;
  category: string;
  image: ImageSourcePropType;
  ts: number;
};

type State = {
  posts: UserPost[];
  stories: UserStory[];
  reels: UserReel[];
  products: UserProduct[];
  addPost: (input: Omit<UserPost, 'id' | 'ts' | 'likes' | 'comments'>) => UserPost;
  addStory: (input: Omit<UserStory, 'id' | 'ts'>) => UserStory;
  addReel: (input: Omit<UserReel, 'id' | 'ts' | 'views'>) => UserReel;
  addProduct: (input: Omit<UserProduct, 'id' | 'ts'>) => UserProduct;
};

export const useUserContent = create<State>((set) => ({
  posts: [],
  stories: [],
  reels: [],
  products: [],
  addPost: (input) => {
    const post: UserPost = {
      id: `p-${Date.now()}`,
      ts: Date.now(),
      likes: 0,
      comments: 0,
      ...input,
    };
    set((s) => ({ posts: [post, ...s.posts] }));
    return post;
  },
  addStory: (input) => {
    const story: UserStory = { id: `s-${Date.now()}`, ts: Date.now(), ...input };
    set((s) => ({ stories: [story, ...s.stories] }));
    return story;
  },
  addReel: (input) => {
    const reel: UserReel = {
      id: `r-${Date.now()}`,
      ts: Date.now(),
      views: 0,
      ...input,
    };
    set((s) => ({ reels: [reel, ...s.reels] }));
    return reel;
  },
  addProduct: (input) => {
    const product: UserProduct = { id: `pr-${Date.now()}`, ts: Date.now(), ...input };
    set((s) => ({ products: [product, ...s.products] }));
    return product;
  },
}));
