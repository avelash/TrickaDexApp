/**
 * Deterministic RNG so a given day always produces the same challenge.
 * Without a seed the challenge would reshuffle on every app launch and the
 * rider could reroll anything they did not like.
 */
export const hashSeed = (value: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

/** mulberry32 — small, fast, good enough for picking challenges. */
export const createRandom = (seed: number) => {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const pickOne = <T>(items: T[], random: () => number): T | null =>
  items.length === 0 ? null : items[Math.floor(random() * items.length)];

/** Local-date key, so the day rolls over at the rider's midnight, not UTC. */
export const dayKey = (date = new Date()): string =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

/** ISO-ish week key used for the weekly challenge. */
export const weekKey = (date = new Date()): string => {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // Roll back to Sunday so the week matches the local calendar week.
  copy.setDate(copy.getDate() - copy.getDay());
  return `${copy.getFullYear()}-${copy.getMonth() + 1}-${copy.getDate()}`;
};
