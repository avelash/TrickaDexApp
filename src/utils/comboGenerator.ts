import { Trick } from "../types";
import { allowedAfterLandings, transitions } from "../data/stances";

const MAX_ATTEMPTS = 3000;
const BEST_POOL_MIN_SIZE = 10;
const BEST_POOL_CHANCE = 0.65;
const TRANSITION_BEFORE_FLIP_CHANCE = 0.8;

/** The only tricks that can carry a hyper landing into a cart full. */
const CART_FULL_ENTRIES = new Set(["cartwheel", "one_handed_cartwheel", "tricker_aerial"]);

/** Cart fulls: "Full ..." tricks (Full Twist, Full Hyper, ...) and Double Full. */
const isCartFull = (trick: Trick) => /^(Double )?Full\b/.test(trick.name);

/**
 * Rules that depend on the tricks themselves, not just their stances: out of a
 * hyper landing a cart full needs a cartwheel-family entry, so Aerial → Full
 * Twist is out but Aerial → Cartwheel → Full Twist is fine.
 */
const canPrecede = (candidate: Trick, next: Trick): boolean => {
  if (isCartFull(next) && candidate.landingStance === "hyper") {
    return CART_FULL_ENTRIES.has(candidate.id);
  }
  return true;
};

/**
 * The strongest tricks available: walk difficulty levels from the top until
 * there are enough, so the pool stays weighted to the rider's hardest tricks.
 */
const buildBestTricksPool = (pool: Trick[]): Trick[] => {
  const best = new Map<string, Trick>();
  const difficulties = Array.from(new Set(pool.map(t => t.difficulty))).sort(
    (a, b) => b - a
  );

  for (const difficulty of difficulties) {
    if (best.size >= BEST_POOL_MIN_SIZE) break;
    pool
      .filter(trick => trick.difficulty === difficulty)
      .forEach(trick => best.set(trick.id, trick));
  }

  return Array.from(best.values());
};

/**
 * Builds a combo backwards from a finishing trick, following the stance rules.
 *
 * Shared by the combo builder's Random button and the weekly challenge so both
 * produce the same kind of combo. `random` is injectable: the builder passes
 * Math.random, the challenge passes a seeded generator so a given week always
 * yields the same combo.
 *
 * Returns null when no valid combo of the requested length could be found.
 */
export const generateCombo = (
  pool: Trick[],
  count: number,
  random: () => number = Math.random
): Trick[] | null => {
  if (pool.length < count || count < 1) return null;

  const bestTricks = buildBestTricksPool(pool);

  // The anchor is the combo's finale, so it should not be a transition.
  const nonTransitionBest = bestTricks.filter(
    trick => !trick.types.includes("transition")
  );
  const anchorCandidates =
    nonTransitionBest.length > 0 ? nonTransitionBest : bestTricks;

  // Built back to front, then reversed at the end.
  const reversed: Trick[] = [];
  let attempts = 0;

  while (reversed.length < count && attempts < MAX_ATTEMPTS) {
    attempts++;

    if (reversed.length === 0) {
      reversed.push(anchorCandidates[Math.floor(random() * anchorCandidates.length)]);
      continue;
    }

    const current = reversed[reversed.length - 1];

    // A flip usually wants a transition leading into it.
    const forceTransition =
      current.types.includes("flip") && random() < TRANSITION_BEFORE_FLIP_CHANCE;
    const useBestPool = random() < BEST_POOL_CHANCE;

    const validPredecessors = (source: Trick[], transitionOnly: boolean) =>
      source.filter(candidate => {
        if (reversed.some(trick => trick.id === candidate.id)) return false;
        if (transitionOnly && !candidate.types.includes("transition")) return false;
        if (!canPrecede(candidate, current)) return false;

        // Be lenient where trick data is incomplete.
        if (!candidate.landingStance || !current.takeoff) return true;

        if (!allowedAfterLandings(current.takeoff).includes(candidate.landingStance)) {
          return false;
        }
        return transitions(candidate.landingStance, current.takeoff) !== "---";
      });

    // Transitions come from the whole pool. The hardest levels hold only one or
    // two, so drawing them from the best pool put that one trick in most combos.
    const source = useBestPool && !forceTransition ? bestTricks : pool;
    let candidates = validPredecessors(source, forceTransition);

    // Widen the search before giving up: full pool, then drop the transition rule.
    if (candidates.length === 0 && source !== pool) {
      candidates = validPredecessors(pool, forceTransition);
    }
    if (candidates.length === 0 && forceTransition) {
      candidates = validPredecessors(pool, false);
    }

    // Dead end — prune the last trick and try a different branch.
    if (candidates.length === 0) {
      reversed.pop();
      continue;
    }

    reversed.push(candidates[Math.floor(random() * candidates.length)]);
  }

  if (reversed.length < count) return null;

  return reversed.reverse();
};
