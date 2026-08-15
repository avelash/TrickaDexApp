import { useCallback, useState } from "react";
import { Trick, TrickProgress } from "../types";
import { getCurrentLevelIndex, getNewlyUnlockedTricks } from "../utils/progress";

export interface LandingCelebration {
  trick: Trick;
  unlocked: Trick[];
}

/**
 * Works out what a trick landing earned the rider and sequences the reward.
 *
 * A level-up is the bigger moment, so when both happen the toast is skipped and
 * only the overlay shows — stacking two celebrations on one tap reads as noise.
 */
export const useCelebrations = (tricks: Trick[]) => {
  const [landing, setLanding] = useState<LandingCelebration | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);

  const celebrate = useCallback(
    (trickId: string, before: TrickProgress, after: TrickProgress) => {
      // Un-landing a trick is a correction, not an achievement.
      if (!after[trickId] || before[trickId]) return;

      const trick = tricks.find(item => item.id === trickId);
      if (!trick) return;

      const previousLevel = getCurrentLevelIndex(before, tricks);
      const nextLevel = getCurrentLevelIndex(after, tricks);

      if (nextLevel > previousLevel) {
        setLanding(null);
        setLevelUp(nextLevel);
        return;
      }

      setLanding({
        trick,
        unlocked: getNewlyUnlockedTricks(before, after, tricks),
      });
    },
    [tricks]
  );

  const dismissLanding = useCallback(() => setLanding(null), []);
  const dismissLevelUp = useCallback(() => setLevelUp(null), []);

  return { landing, levelUp, celebrate, dismissLanding, dismissLevelUp };
};
