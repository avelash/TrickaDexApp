import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TrickProgress } from "../types";
import { useFocusEffect } from "@react-navigation/native";

const STORAGE_KEY = "@TrickaDexApp_progress";

export const useTrickProgress = () => {
  const [landedTricks, setLandedTricks] = useState<TrickProgress>({});
  const [loaded, setLoaded] = useState(false);

  const loadProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setLandedTricks(JSON.parse(saved));
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

  const toggleTrick = (trickId: string) => {
    const newProgress = {
      ...landedTricks,
      [trickId]: !landedTricks[trickId],
    };
    setLandedTricks(newProgress);
    saveProgress(newProgress);
  };

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
    getLandedCount,
    isTrickLanded,
    refresh: loadProgress, // expose manually too, just in case
  };
};
