import { Trick, TrickProgress } from "../types";

/** Tricks a rider must land in a tier before they count as being at that level. */
export const TRICKS_PER_LEVEL = 4;

/**
 * Highest tier where the rider has landed enough tricks, or -1 when unranked.
 * This is the single definition of "current level" for the profile, the
 * progress screen, and level-up celebrations.
 */
export const getCurrentLevelIndex = (
  landedTricks: TrickProgress,
  tricks: Trick[]
): number => {
  const countByTier: Record<number, number> = {};

  tricks.forEach(trick => {
    if (landedTricks[trick.id]) {
      countByTier[trick.difficulty] = (countByTier[trick.difficulty] || 0) + 1;
    }
  });

  for (let tier = 7; tier >= 0; tier--) {
    if ((countByTier[tier] || 0) >= TRICKS_PER_LEVEL) return tier;
  }
  return -1;
};

/** A trick is available once every prerequisite is landed and it is not. */
const isAvailable = (trick: Trick, landed: TrickProgress): boolean =>
  !landed[trick.id] && trick.prerequisites.every(id => landed[id]);

/**
 * Tricks that became available between two progress states — what landing a
 * trick just "unlocked". Returns an empty array when nothing opened up.
 */
export const getNewlyUnlockedTricks = (
  before: TrickProgress,
  after: TrickProgress,
  tricks: Trick[]
): Trick[] =>
  tricks.filter(
    trick => isAvailable(trick, after) && !isAvailable(trick, before)
  );
