import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Trick, TrickProgress } from "../types";
import {
  Challenge,
  GENERATOR_VERSION,
  generateDailyChallenge,
  generateMonthlyChallenge,
  generateWeeklyChallenge,
  rankFromXp,
  xpForRank,
} from "../data/challenges";
import { dayKey, monthKey, weekKey } from "../utils/seededRandom";
import { useExcludedTricks } from "./useExcludedTricks";

const STORAGE_KEY = "@TrickaDexApp_challenges";

export const MAX_WEEKLY_SWAPS = 3;

interface CachedChallenge {
  key: string;
  challenge: Challenge;
  /** Bumped on each swap so the seed produces a different challenge. */
  swapIndex: number;
}

interface ChallengeState {
  xp: number;
  /** Ids of completed challenges, keyed by period, so they do not re-complete. */
  completed: string[];
  /** Days the rider completed something, for the streak. */
  activeDays: string[];
  /**
   * The challenge each period actually issued. Generation reads landed tricks,
   * so without a snapshot, landing a trick mid-day would swap out the challenge
   * while completion stays keyed to the date — you could complete something you
   * never saw.
   */
  dailyCache?: CachedChallenge;
  weeklyCache?: CachedChallenge;
  /** Swaps are a shared weekly budget across both challenges. */
  swapsWeek?: string;
  swapsUsed?: number;
}

const EMPTY: ChallengeState = { xp: 0, completed: [], activeDays: [] };

/** Consecutive days ending today (or yesterday, so a day is not lost mid-day). */
const streakFrom = (activeDays: string[]): number => {
  const days = new Set(activeDays);
  let streak = 0;
  const cursor = new Date();

  if (!days.has(dayKey(cursor))) {
    // Yesterday still counts until today's challenge is done.
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(dayKey(cursor))) return 0;
  }

  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

export const useChallenges = (tricks: Trick[], landed: TrickProgress) => {
  const { isTrickExcluded } = useExcludedTricks();
  const [state, setState] = useState<ChallengeState>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setState({ ...EMPTY, ...JSON.parse(raw) });
      } catch (error) {
        console.error("Failed to load challenges:", error);
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, []);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...EMPTY, ...JSON.parse(raw) });
    } catch (error) {
      console.error("Failed to load challenges:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Always current, so persist can merge without depending on a render's copy.
  const stateRef = useRef(state);
  stateRef.current = state;

  /**
   * Merges a patch into stored state. Taking a patch rather than a whole object
   * matters: a caller that rebuilt the object by hand once dropped the cached
   * challenges and swap counters, which reissued the challenge on completion.
   */
  const persist = useCallback((patch: Partial<ChallengeState>) => {
    const next = { ...stateRef.current, ...patch };
    stateRef.current = next;
    setState(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(error =>
      console.error("Failed to save challenges:", error)
    );
  }, []);

  const today = dayKey();
  const thisWeek = weekKey();
  const thisMonth = monthKey();

  /**
   * A snapshot is only good for its own period AND the generation rules it was
   * built with. Without the version check, a challenge issued by older code
   * keeps being served until the period rolls over.
   */
  const isFresh = (cache: CachedChallenge | undefined, key: string) =>
    cache?.key === key && cache.challenge.version === GENERATOR_VERSION;

  // Same pool the Combo Builder's Random button uses: landed tricks, minus any
  // the rider excluded from random combos.
  const comboPool = useMemo(
    () => tricks.filter(trick => landed[trick.id] && !isTrickExcluded(trick.id)),
    [tricks, landed, isTrickExcluded]
  );

  // Issued once per period, then frozen until the period rolls over or is swapped.
  const daily = useMemo(() => {
    if (isFresh(state.dailyCache, today)) return state.dailyCache!.challenge;
    return generateDailyChallenge(tricks, landed, today);
  }, [state.dailyCache, tricks, landed, today]);

  const weekly = useMemo(() => {
    if (isFresh(state.weeklyCache, thisWeek)) return state.weeklyCache!.challenge;
    return generateWeeklyChallenge(comboPool, thisWeek);
  }, [state.weeklyCache, comboPool, thisWeek]);

  // Curated, not generated, so there is nothing to cache or swap.
  const monthly = useMemo(
    () => generateMonthlyChallenge(thisMonth),
    [thisMonth]
  );

  // Freeze whatever was issued for this period.
  useEffect(() => {
    if (!loaded) return;

    const dailyStale = daily && !isFresh(state.dailyCache, today);
    const weeklyStale = weekly && !isFresh(state.weeklyCache, thisWeek);
    if (!dailyStale && !weeklyStale) return;

    persist({
      ...(dailyStale
        ? { dailyCache: { key: today, challenge: daily!, swapIndex: 0 } }
        : {}),
      ...(weeklyStale
        ? { weeklyCache: { key: thisWeek, challenge: weekly!, swapIndex: 0 } }
        : {}),
    });
  }, [loaded, daily, weekly, today, thisWeek, state, persist]);

  const isCompleted = useCallback(
    (challenge: Challenge | null) =>
      !!challenge && state.completed.includes(challenge.id),
    [state.completed]
  );

  const complete = useCallback(
    (challenge: Challenge | null) => {
      if (!challenge || state.completed.includes(challenge.id)) return 0;

      persist({
        xp: state.xp + challenge.xp,
        // Keep the list bounded; old periods can never be completed again.
        completed: [...state.completed, challenge.id].slice(-60),
        activeDays: state.activeDays.includes(today)
          ? state.activeDays
          : [...state.activeDays, today].slice(-400),
      });

      return challenge.xp;
    },
    [persist, state, today]
  );

  const swapsUsed = state.swapsWeek === thisWeek ? state.swapsUsed ?? 0 : 0;
  const swapsLeft = Math.max(0, MAX_WEEKLY_SWAPS - swapsUsed);

  /**
   * Rerolls a challenge, spending one of the shared weekly swaps. Completed
   * challenges cannot be swapped — that would let a rider bank the XP and then
   * fish for an easier one.
   */
  const swap = useCallback(
    (period: "daily" | "weekly") => {
      if (swapsLeft <= 0) return false;

      const cache = period === "daily" ? state.dailyCache : state.weeklyCache;
      const periodKey = period === "daily" ? today : thisWeek;
      const current = period === "daily" ? daily : weekly;
      if (!current || state.completed.includes(current.id)) return false;

      const nextIndex = (cache?.key === periodKey ? cache.swapIndex : 0) + 1;
      const regenerated =
        period === "daily"
          ? generateDailyChallenge(tricks, landed, today, nextIndex)
          : generateWeeklyChallenge(comboPool, thisWeek, nextIndex);

      if (!regenerated) return false;

      persist({
        swapsWeek: thisWeek,
        swapsUsed: swapsUsed + 1,
        ...(period === "daily"
          ? {
              dailyCache: {
                key: today,
                challenge: regenerated,
                swapIndex: nextIndex,
              },
            }
          : {
              weeklyCache: {
                key: thisWeek,
                challenge: regenerated,
                swapIndex: nextIndex,
              },
            }),
      });

      return true;
    },
    [swapsLeft, state, today, thisWeek, daily, weekly, tricks, landed, comboPool, persist, swapsUsed]
  );

  const rank = rankFromXp(state.xp);
  const rankFloor = xpForRank(rank);
  const rankCeiling = xpForRank(rank + 1);

  return {
    loaded,
    xp: state.xp,
    rank,
    /** 0-1 progress towards the next rider rank. */
    rankProgress:
      rankCeiling > rankFloor
        ? (state.xp - rankFloor) / (rankCeiling - rankFloor)
        : 0,
    xpToNextRank: Math.max(0, rankCeiling - state.xp),
    streak: streakFrom(state.activeDays),
    daily,
    weekly,
    monthly,
    swapsLeft,
    swap,
    isCompleted,
    complete,
  };
};
