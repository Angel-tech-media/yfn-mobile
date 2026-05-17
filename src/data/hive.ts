export type LiveMatch = {
  title: string;
  meta: string;
  status: 'live' | 'finished' | 'upcoming';
  periodLabel?: string;
  home: { name: string; flag: string; scores: number[] };
  away: { name: string; flag: string; scores: number[] };
};

export type HiveNode = {
  slug: string;
  name: string;
  emoji?: string;
  description?: string;
  /** Number of members; only meaningful on community leaves. */
  members?: number;
  /** Currently pinned trending topic the bot has surfaced. */
  pinnedTopic?: string;
  /** Identifier of the AI moderator bot for this community (matches `bots/<id>.md`). */
  bot?: string;
  /** Optional live event (sport communities) — renders the LiveScoreCard. */
  liveMatch?: LiveMatch;
  children?: HiveNode[];
};

/**
 * Hive community tree. Each leaf (no children) is a community styled like a
 * Telegram/WhatsApp group. Branches act like Windows Explorer folders. Bot
 * personas are defined in `bots/<bot>.md` at the repo root.
 */
export const HIVE: HiveNode[] = [
  {
    slug: 'books',
    name: 'Books',
    emoji: '📚',
    description: 'Readers, writers, book clubs',
    children: [
      {
        slug: 'romance',
        name: 'Romance',
        emoji: '💕',
        children: [
          {
            slug: 'christian',
            name: 'Christian Romance',
            emoji: '✝️',
            description: 'Faith-rooted love stories. Book club every Friday.',
            members: 2456,
            pinnedTopic: '"Redeeming Love" by Francine Rivers — week 2 discussion',
            bot: 'bookbot',
          },
          {
            slug: 'historical',
            name: 'Historical Romance',
            emoji: '⏳',
            description: 'Regency, Victorian, and African-historical novels',
            members: 1234,
            pinnedTopic: 'The Bridgerton effect — favourite Regency author?',
            bot: 'bookbot',
          },
          {
            slug: 'contemporary',
            name: 'Contemporary',
            emoji: '☕',
            description: 'Modern love stories, slow-burn and rom-com.',
            members: 3120,
            pinnedTopic: 'Emily Henry vs Tessa Bailey — your verdict',
            bot: 'bookbot',
          },
        ],
      },
      {
        slug: 'scifi',
        name: 'Sci-Fi & Fantasy',
        emoji: '🚀',
        children: [
          {
            slug: 'afrofuturism',
            name: 'Afrofuturism',
            emoji: '🌍',
            description: 'African speculative fiction and futurist worldbuilding.',
            members: 891,
            pinnedTopic: '"Children of Blood and Bone" — film cast reveal',
            bot: 'bookbot',
          },
          {
            slug: 'epic-fantasy',
            name: 'Epic Fantasy',
            emoji: '🐉',
            description: 'Doorstop tomes welcome.',
            members: 1840,
            pinnedTopic: 'Sanderson Cosmere reading order — fight!',
            bot: 'bookbot',
          },
        ],
      },
      {
        slug: 'african-lit',
        name: 'African Literature',
        emoji: '🦁',
        children: [
          {
            slug: 'naija-writers',
            name: 'Naija Writers',
            emoji: '🇳🇬',
            description: 'Adichie, Soyinka, Cole, Onuzo — and the next generation.',
            members: 4210,
            pinnedTopic: 'Best Nigerian novel of the last decade?',
            bot: 'bookbot',
          },
        ],
      },
    ],
  },
  {
    slug: 'sport',
    name: 'Sport',
    emoji: '⚽',
    description: 'Live matches, fan clubs, hot takes',
    children: [
      {
        slug: 'football',
        name: 'Football',
        emoji: '⚽',
        children: [
          {
            slug: 'super-eagles',
            name: 'Super Eagles',
            emoji: '🦅',
            description: 'For the boys in green-white-green.',
            members: 18420,
            pinnedTopic: 'LIVE: Nigeria vs Morocco — AFCON qualifier',
            bot: 'sportbot',
            liveMatch: {
              title: 'AFCON Qualifier · Group D',
              meta: 'Godswill Akpabio Stadium · Uyo',
              status: 'live',
              periodLabel: '78\' — 2nd half',
              home: { name: 'Super Eagles', flag: '🇳🇬', scores: [1, 1] },
              away: { name: 'Atlas Lions', flag: '🇲🇦', scores: [0, 1] },
            },
          },
          {
            slug: 'epl',
            name: 'Premier League',
            emoji: '🏴',
            description: 'Six-pointers, transfer rumours, VAR drama.',
            members: 12030,
            pinnedTopic: 'Arsenal vs Liverpool — Sunday 4 PM',
            bot: 'sportbot',
            liveMatch: {
              title: 'Premier League · Matchweek 32',
              meta: 'Emirates Stadium · 4:00 PM kick-off',
              status: 'upcoming',
              periodLabel: 'Starts in 2h 14m',
              home: { name: 'Arsenal', flag: '🔴', scores: [0, 0] },
              away: { name: 'Liverpool', flag: '🟥', scores: [0, 0] },
            },
          },
          {
            slug: 'champions-league',
            name: 'Champions League',
            emoji: '🏆',
            members: 6520,
            pinnedTopic: 'Group of Death predictions — drop your bracket',
            bot: 'sportbot',
          },
        ],
      },
      {
        slug: 'basketball',
        name: 'Basketball',
        emoji: '🏀',
        children: [
          {
            slug: 'nba',
            name: 'NBA',
            emoji: '🏀',
            members: 4810,
            pinnedTopic: 'Wemby triple-double watch — game thread',
            bot: 'sportbot',
            liveMatch: {
              title: 'NBA · Western Conference',
              meta: 'Frost Bank Center · San Antonio',
              status: 'finished',
              periodLabel: 'Full time',
              home: { name: 'Spurs', flag: '🟣', scores: [28, 24, 30, 32] },
              away: { name: 'Lakers', flag: '🟡', scores: [25, 26, 28, 29] },
            },
          },
        ],
      },
      {
        slug: 'mma',
        name: 'MMA',
        emoji: '🥊',
        children: [
          {
            slug: 'ufc',
            name: 'UFC',
            emoji: '🥊',
            members: 3140,
            pinnedTopic: 'Adesanya return — who should it be?',
            bot: 'sportbot',
          },
        ],
      },
    ],
  },
  {
    slug: 'music',
    name: 'Music',
    emoji: '🎵',
    description: 'Drops, polls, fan clubs',
    children: [
      {
        slug: 'afrobeats',
        name: 'Afrobeats',
        emoji: '🥁',
        children: [
          {
            slug: 'afro-nation',
            name: 'Afro Nation',
            emoji: '🎤',
            description: 'Festival-goers, lineups, vibes.',
            members: 24500,
            pinnedTopic: 'Davido drops "Timeless II" — vote your fav track',
            bot: 'musicbot',
          },
          {
            slug: 'amapiano',
            name: 'Amapiano',
            emoji: '🎹',
            members: 8200,
            pinnedTopic: 'Tyla x Kabza collab — incoming?',
            bot: 'musicbot',
          },
          {
            slug: 'new-releases',
            name: 'New Releases',
            emoji: '🆕',
            members: 11030,
            pinnedTopic: 'Friday drops — 17 May 2026 thread',
            bot: 'musicbot',
          },
        ],
      },
      {
        slug: 'gospel',
        name: 'Gospel',
        emoji: '🙌',
        children: [
          {
            slug: 'naija-gospel',
            name: 'Naija Gospel',
            emoji: '🇳🇬',
            members: 5640,
            pinnedTopic: 'Mercy Chinwo "Excess Love" — anniversary thread',
            bot: 'musicbot',
          },
        ],
      },
    ],
  },
  {
    slug: 'anime',
    name: 'Anime',
    emoji: '🎌',
    description: 'Shonen, slice of life, mecha — pick your shelf',
    children: [
      {
        slug: 'shonen',
        name: 'Shonen',
        emoji: '⚡',
        children: [
          {
            slug: 'one-piece',
            name: 'One Piece',
            emoji: '🏴‍☠️',
            description: 'Strawhats only.',
            members: 14820,
            pinnedTopic: 'Chapter 1116 — Vegapunk reveal reactions',
            bot: 'animebot',
          },
          {
            slug: 'jjk',
            name: 'Jujutsu Kaisen',
            emoji: '👁️',
            members: 9420,
            pinnedTopic: 'Gege Akutami — final arc fan theories',
            bot: 'animebot',
          },
          {
            slug: 'demon-slayer',
            name: 'Demon Slayer',
            emoji: '🗡️',
            members: 6210,
            pinnedTopic: 'Hashira Training arc — episode rankings',
            bot: 'animebot',
          },
        ],
      },
      {
        slug: 'slice-of-life',
        name: 'Slice of Life',
        emoji: '🍵',
        children: [
          {
            slug: 'fruits-basket',
            name: 'Fruits Basket',
            emoji: '🐀',
            members: 1820,
            pinnedTopic: 'Re-watch club — episode 12 tonight',
            bot: 'animebot',
          },
        ],
      },
    ],
  },
  {
    slug: 'tech',
    name: 'Tech',
    emoji: '💻',
    children: [
      {
        slug: 'ai',
        name: 'AI & ML',
        emoji: '🤖',
        children: [
          {
            slug: 'naija-ai-builders',
            name: 'Naija AI Builders',
            emoji: '🇳🇬',
            description: 'Building with LLMs in West Africa.',
            members: 2340,
            pinnedTopic: 'Cheap GPUs in Lagos — supplier thread',
            bot: 'vibebot',
          },
        ],
      },
      {
        slug: 'crypto',
        name: 'Crypto',
        emoji: '₿',
        children: [
          {
            slug: 'naira-defi',
            name: 'Naira × DeFi',
            emoji: '💱',
            members: 4920,
            pinnedTopic: 'CBN guidance update — what changes Jan 1',
            bot: 'vibebot',
          },
        ],
      },
    ],
  },
  {
    slug: 'comics',
    name: 'Comics',
    emoji: '📖',
    description: 'Superhero, indie, faith-based, manga-tinged comics',
    children: [
      {
        slug: 'christian',
        name: 'Christian',
        emoji: '✝️',
        description: 'Faith-based graphic novels and Christian comic series.',
        members: 1840,
        pinnedTopic: 'The Circle Series by Ted Dekker — Black, Red, White, Green',
        bot: 'bookbot',
      },
      {
        slug: 'dc',
        name: 'DC',
        emoji: '🦇',
        description: 'Batman, Superman, Wonder Woman, the Multiverse and beyond.',
        members: 14820,
        pinnedTopic: 'Absolute Batman vol. 2 — drop reactions',
        bot: 'vibebot',
      },
      {
        slug: 'marvel',
        name: 'Marvel',
        emoji: '🕷️',
        description: 'X-Men, Avengers, Spider-Verse and the 616.',
        members: 18920,
        pinnedTopic: 'Ultimate Spider-Man (2024) — issue 18 thread',
        bot: 'vibebot',
      },
    ],
  },
  {
    slug: 'foodies',
    name: 'Foodies',
    emoji: '🍲',
    children: [
      {
        slug: 'naija-kitchen',
        name: 'Naija Kitchen',
        emoji: '🥘',
        children: [
          {
            slug: 'jollof-wars',
            name: 'Jollof Wars',
            emoji: '🍚',
            description: 'Nigerian vs Ghanaian. Smoke vs sauce. Fight.',
            members: 9120,
            pinnedTopic: 'Wood-fire vs gas — taste test results',
            bot: 'foodiebot',
          },
        ],
      },
      {
        slug: 'baking',
        name: 'Baking',
        emoji: '🍰',
        children: [
          {
            slug: 'cake-decorators',
            name: 'Cake Decorators',
            emoji: '🎂',
            members: 3210,
            pinnedTopic: 'Buttercream vs fondant — wedding cake debate',
            bot: 'foodiebot',
          },
        ],
      },
    ],
  },
];

/** Walk the tree using a slug path, returning the matched node and the trail. */
export function findHiveNode(slugPath: string[]): {
  node: HiveNode | null;
  trail: HiveNode[];
} {
  const trail: HiveNode[] = [];
  let nodes = HIVE;
  let node: HiveNode | null = null;
  for (const slug of slugPath) {
    const found = nodes.find((n) => n.slug === slug) ?? null;
    if (!found) return { node: null, trail };
    node = found;
    trail.push(found);
    nodes = found.children ?? [];
  }
  return { node, trail };
}
