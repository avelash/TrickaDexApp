import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const STORAGE_KEY = "@TrickaDexApp_excluded_tricks";

export const useExcludedTricks = () => {
  const [excludedTricks, setExcludedTricks] = useState<{ [key: string]: boolean }>({});
  const [loaded, setLoaded] = useState(false);

  const loadExcluded = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setExcludedTricks(JSON.parse(saved));
      }
      setLoaded(true);
    } catch (error) {
      console.error("Failed to load excluded tricks:", error);
      setLoaded(true);
    }
  };

  const saveExcluded = async (excluded: { [key: string]: boolean }) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(excluded));
    } catch (error) {
      console.error("Failed to save excluded tricks:", error);
    }
  };

  const toggleExcluded = (trickId: string) => {
    const newExcluded = {
      ...excludedTricks,
      [trickId]: !excludedTricks[trickId],
    };
    setExcludedTricks(newExcluded);
    saveExcluded(newExcluded);
  };

  const isTrickExcluded = (trickId: string) => excludedTricks[trickId] || false;

  // Refresh when screen regains focus
  useFocusEffect(
    useCallback(() => {
      loadExcluded();
    }, [])
  );

  return {
    excludedTricks,
    loaded,
    toggleExcluded,
    isTrickExcluded,
    refresh: loadExcluded,
  };
};
