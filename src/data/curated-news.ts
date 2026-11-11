import type { Article } from '@/src/api/types';

/**
 * Curated Lagos & youth commerce stories from Lovable (`yfnisaktive/src/lib/data.ts`),
 * used as fallback / seed stories whenever the backend news feed is empty.
 */
export const CURATED_NEWS: Article[] = [
  {
    id: 'n1',
    title: "Lagos startups just had their biggest quarter ever — here's who's hiring",
    category: 'Tech',
    coverUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
    author: { name: 'Kelechi Nwosu', handle: 'kelechi' },
    publishedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    readMin: 4,
    claps: 142,
    comments: 28,
    excerpt: 'Fintech still leads, but creator tools and logistics are catching up fast.',
    paragraphs: [
      'Young founders in Lagos raised more in the last three months than in all of last year, with fintech, creator tools and last-mile logistics leading the pack.',
      'Most of the money went to early-stage teams with fewer than 20 people — which means a lot of junior roles are opening up for designers, developers and community managers.',
      'We spoke to five founders about what they look for when hiring. The short version: show your work, ship something, and be online where your users are.',
    ],
    tags: ['Tech', 'Lagos', 'Startups'],
    savedByMe: false,
    clappedByMe: false,
  },
  {
    id: 'n2',
    title: 'The Afrobeats summer tour dates are out. Lagos gets two nights',
    category: 'Music',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
    author: { name: 'Tobi Adeyemi', handle: 'tobi' },
    publishedAt: new Date(Date.now() - 18 * 3600_000).toISOString(),
    readMin: 3,
    claps: 310,
    comments: 64,
    excerpt: "Tickets drop Friday at noon. Here's how to not get scammed.",
    paragraphs: [
      'The biggest names in Afrobeats are bringing the summer tour home, with two back-to-back nights at Eko Convention Centre.',
      'Tickets go on sale Friday at noon. Only buy from the official link — resellers on social media have already started posting fake listings.',
    ],
    tags: ['Music', 'Afrobeats', 'Events'],
    savedByMe: false,
    clappedByMe: false,
  },
  {
    id: 'n3',
    title: 'Thrift is the new luxury: how Gen Z is rewriting Yaba market',
    category: 'Style',
    coverUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80',
    author: { name: 'Amara Eze', handle: 'amara' },
    publishedAt: new Date(Date.now() - 36 * 3600_000).toISOString(),
    readMin: 5,
    claps: 218,
    comments: 41,
    excerpt: 'Okrika, upcycling and the designers turning bale finds into runway looks.',
    paragraphs: [
      "Walk through Yaba market on a Saturday and you'll see it: stylists with ring lights, resellers with QR codes, and designers hunting for the perfect bale.",
      'Upcycling has gone from side hustle to full-blown movement, and local brands are leaning in.',
    ],
    tags: ['Style', 'Yaba', 'Creators'],
    savedByMe: false,
    clappedByMe: false,
  },
];

export function findCuratedNews(id: string | undefined): Article | undefined {
  if (!id) return undefined;
  return CURATED_NEWS.find((item) => item.id === id);
}
