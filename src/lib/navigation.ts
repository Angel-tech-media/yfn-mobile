import { router } from 'expo-router';

type Href = Parameters<typeof router.push>[0];

const DUPLICATE_WINDOW_MS = 650;

let lastKey = '';
let lastAt = 0;

/** Returns false when the same navigation was already triggered a moment ago. */
function accept(key: string): boolean {
  const now = Date.now();
  if (key === lastKey && now - lastAt < DUPLICATE_WINDOW_MS) return false;
  lastKey = key;
  lastAt = now;
  return true;
}

const keyFor = (kind: string, href?: Href) =>
  `${kind}:${typeof href === 'string' ? href : JSON.stringify(href ?? '')}`;

/**
 * Drop-in replacement for `router.push/replace/back` that ignores accidental double-taps.
 * Without it, a fast double-tap on a card pushes the same screen onto the stack twice.
 */
export const nav = {
  push(href: Href) {
    if (accept(keyFor('push', href))) router.push(href);
  },
  replace(href: Href) {
    if (accept(keyFor('replace', href))) router.replace(href);
  },
  back() {
    if (accept('back')) router.back();
  },
};
