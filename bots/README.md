# Vibe AI Bots

Each Markdown file in this folder defines the persona and instructions for one
AI bot in the Vibe app. Bots act as moderators inside Hive communities, news
generators, and escrow communicators — see `app/architecture.md` for where each
one runs.

## Authoring a bot

The frontmatter is parsed by the runtime; the body is the persona prompt the
LLM receives. Fill in each section before shipping. Anything in `<!-- TODO -->`
is a placeholder for you.

```yaml
---
id: bookbot              # matches HiveNode.bot in src/data/hive.ts
name: BookBot            # display name shown on the avatar
scope: books             # top-level Hive category this bot owns
voice: warm, well-read   # how it sounds
capabilities:
  - greet_new_members
  - pin_trending_topic
  - run_polls
  - revive_dry_chat
  - cite_external_sources
data_sources:            # optional: pull live data
  - goodreads
  - x.com
---
```

## Bot manifest (current)

| File              | Persona       | Owns                      | Notes                                 |
|-------------------|---------------|---------------------------|---------------------------------------|
| `vibebot.md`      | VibeBot       | Anywhere not specialised  | Default moderator                     |
| `bookbot.md`      | BookBot       | Hive › Books              | Reading lists, polls, club scheduling |
| `sportbot.md`     | SportBot      | Hive › Sport              | Live match feeds, fixtures            |
| `musicbot.md`     | MusicBot      | Hive › Music              | New drops, festival lineups           |
| `animebot.md`     | AnimeBot      | Hive › Anime              | Episode threads, manga discussion     |
| `foodiebot.md`    | FoodieBot     | Hive › Foodies            | Recipe weeks, taste polls             |
| `newsbot.md`      | NewsBot       | News tab                  | Generates Vibe News from poll trends  |
| `escrowbot.md`    | EscrowBot     | Wallet / order lifecycle  | Tells vendor each escrow state        |
| `marketbot.md`    | MarketBot     | Market reels              | Surfaces trending vendors near you    |

## How bots show up in the app

- **Pinned topic banner** at the top of every community — the bot weighs the
  semantic activity of the chat and decides which topic is the current trend.
- **Bot bubble** in the chat thread — orange-tinted, sparkles avatar, named.
- **Polls** — the bot can post a poll and tally votes; results are also fed into
  NewsBot for personalised news generation.
- **Dry-chat prompts** — when activity drops below a threshold the bot drops a
  conversation starter scoped to the community.

## Trend weighting (shared across bots)

The trend score for a topic should combine:

1. Semantic novelty — is this a new theme vs the last 24h baseline?
2. Voice diversity — how many distinct members are talking?
3. Velocity — message rate vs the community's typical baseline.
4. External signal — live event (match underway, album drop, breaking news).
5. Quality — penalises spam / single-member dominance / bot replies.

Each bot may tune the weights for its community type — SportBot leans on
external signal during live games, BookBot leans on voice diversity.
