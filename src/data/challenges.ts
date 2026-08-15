import { Trick, TrickProgress } from "../types";
import { createRandom, hashSeed, pickOne } from "../utils/seededRandom";
import { generateCombo } from "../utils/comboGenerator";
import { MONTHLY_SAMPLERS } from "./samplers";

/**
 * Bump whenever generation rules change. Challenges are snapshotted into
 * storage for their period, so without a version stamp a challenge issued by
 * older code keeps being served until the period rolls over.
 */
export const GENERATOR_VERSION = 2;

export type ChallengeKind = "reps" | "learn" | "combo" | "watch";

export interface Challenge {
  kind: ChallengeKind;
  /** Generation rules this was built with; see GENERATOR_VERSION. */
  version?: number;
  /** Stable id for the period, so completion survives an app restart. */
  id: string;
  xp: number;
  /** Trick ids involved — the UI resolves these for names and icons. */
  trickIds: string[];
  /** Rep count, only meaningful for the "reps" kind. */
  reps?: number;
  /** Video to watch, only meaningful for the "watch" kind. */
  url?: string;
  /** Video title, only meaningful for the "watch" kind. Not translated. */
  title?: string;
}

const DAILY_XP = 50;
const WEEKLY_XP = 150;
const MONTHLY_XP = 150;

const landedTricksOf = (tricks: Trick[], landed: TrickProgress) =>
  tricks.filter(trick => landed[trick.id]);

const nextLearnsOf = (tricks: Trick[], landed: TrickProgress) =>
  tricks.filter(
    trick => !landed[trick.id] && trick.prerequisites.every(id => landed[id])
  );

/**
 * Daily challenge: something short using what the rider already has, or a
 * nudge toward the next trick they can reach.
 */
export const generateDailyChallenge = (
  tricks: Trick[],
  landed: TrickProgress,
  key: string,
  swapIndex = 0
): Challenge | null => {
  const random = createRandom(hashSeed(`daily-${key}#${swapIndex}`));
  const landedList = landedTricksOf(tricks, landed);
  const nextLearns = nextLearnsOf(tricks, landed);

  // Alternate between drilling and learning, but only offer what is possible.
  const preferLearn = random() < 0.4 && nextLearns.length > 0;

  if (preferLearn) {
    const target = pickOne(nextLearns, random);
    if (target) {
      return {
        kind: "learn",
        version: GENERATOR_VERSION,
        id: `daily-${key}`,
        xp: DAILY_XP,
        trickIds: [target.id],
      };
    }
  }

  const target = pickOne(landedList, random);
  if (target) {
    // Harder tricks get fewer reps.
    const base = 12 - target.difficulty;
    return {
      kind: "reps",
      version: GENERATOR_VERSION,
      id: `daily-${key}`,
      xp: DAILY_XP,
      trickIds: [target.id],
      reps: Math.max(3, base),
    };
  }

  const fallback = pickOne(nextLearns, random);
  return fallback
    ? {
        kind: "learn",
        version: GENERATOR_VERSION,
        id: `daily-${key}`,
        xp: DAILY_XP,
        trickIds: [fallback.id],
      }
    : null;
};

/**
 * Weekly challenge: a combo built by the same generator the Combo Builder's
 * Random button uses, so the rules match exactly. The pool is the rider's
 * landed tricks (minus any excluded from random combos); length is 3-6 rather
 * than the builder's user preference.
 */
export const generateWeeklyChallenge = (
  comboPool: Trick[],
  key: string,
  swapIndex = 0
): Challenge | null => {
  const random = createRandom(hashSeed(`weekly-${key}#${swapIndex}`));
  if (comboPool.length < 3) return null;

  const length = Math.min(comboPool.length, 3 + Math.floor(random() * 4));
  const combo = generateCombo(comboPool, length, random);
  if (!combo || combo.length < 2) return null;

  return {
    kind: "combo",
    version: GENERATOR_VERSION,
    id: `weekly-${key}`,
    xp: WEEKLY_XP,
    trickIds: combo.map(trick => trick.id),
  };
};

/** XP needed for each rider rank; the last threshold repeats every 1000. */
export const xpForRank = (rank: number): number => 250 * rank * (rank + 1) / 2;

export const rankFromXp = (xp: number): number => {
  let rank = 0;
  while (xpForRank(rank + 1) <= xp) rank++;
  return rank;
};

/**
 * Monthly sampler: a hand-picked video rather than anything generated, so it is
 * looked up rather than seeded. Returns null for a month with no entry.
 */
export const generateMonthlyChallenge = (key: string): Challenge | null => {
  const sampler = MONTHLY_SAMPLERS[key];
  if (!sampler) return null;

  return {
    kind: "watch",
    version: GENERATOR_VERSION,
    id: `monthly-${key}`,
    xp: MONTHLY_XP,
    trickIds: [],
    url: sampler.url,
    title: sampler.title,
  };
};
