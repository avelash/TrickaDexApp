import { useState, useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TrickProgress } from "../types";
import { useFocusEffect } from "@react-navigation/native";

const STORAGE_KEY = "@TrickaDexApp_progress";

export const useTrickProgress = () => {
  const [landedTricks, setLandedTricks] = useState<TrickProgress>({});
  const [loaded, setLoaded] = useState(false);
  // Always holds the freshest map, so writes never rebase on a stale render.
  const progressRef = useRef<TrickProgress>({});

  const loadProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: TrickProgress = JSON.parse(saved);
        progressRef.current = parsed;
        setLandedTricks(parsed);
      }
      setLoaded(true);
    } catch (error) {
      console.error("Failed to load progress:", error);
      setLoaded(true);
    }
  };

  const saveProgress = async (progress: TrickProgress) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  };

  /** Returns the progress either side of the toggle, for celebration checks. */
  const toggleTrick = (trickId: string) => {
    const before = progressRef.current;
    const after = {
      ...before,
      [trickId]: !before[trickId],
    };
    progressRef.current = after;
    setLandedTricks(after);
    saveProgress(after);
    return { before, after };
  };

  /**
   * Applies a whole patch in one write and resolves once it is on disk.
   * Looping toggleTrick cannot do this: each call would rebase on the same
   * render's state so only the last would survive, and its save is not awaited,
   * so a navigation could outrun it and the next screen would read stale data.
   */
  const applyProgress = useCallback(async (patch: TrickProgress) => {
    const next = { ...progressRef.current, ...patch };
    progressRef.current = next;
    setLandedTricks(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  }, []);

  const getLandedCount = () =>
    Object.values(landedTricks).filter(Boolean).length;

  const isTrickLanded = (trickId: string) => landedTricks[trickId] || false;

  // 🪄 Refresh when screen regains focus
  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [])
  );

  return {
    landedTricks,
    loaded,
    toggleTrick,
    applyProgress,
    getLandedCount,
    isTrickLanded,
    refresh: loadProgress, // expose manually too, just in case
  };
};
