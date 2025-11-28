import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PreferencesState } from "../components/PreferencesModal";
import { useFocusEffect } from "@react-navigation/native";
import { SKILL_LEVELS } from "../data/skillLevels";

const STORAGE_KEY = "@TrickaDexApp_preferences";

const DEFAULT_PREFERENCES: PreferencesState = {
  onlyLandedTricks: true,
  minLevel: 0,
  maxLevel: SKILL_LEVELS.length - 1,
  numberOfTricks: 3,
};

export const usePreferences = () => {
  const [preferences, setPreferences] =
    useState<PreferencesState>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);

  const loadPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setPreferences(JSON.parse(saved));
      } else {
        setPreferences(DEFAULT_PREFERENCES);
      }
      setLoaded(true);
    } catch (error) {
      console.error("Failed to load preferences:", error);
      setPreferences(DEFAULT_PREFERENCES);
      setLoaded(true);
    }
  };

  const savePreferences = async (newPreferences: PreferencesState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
    } catch (error) {
      console.error("Failed to save preferences:", error);
    }
  };

  const updatePreferences = (newPreferences: PreferencesState) => {
    setPreferences(newPreferences);
    savePreferences(newPreferences);
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    savePreferences(DEFAULT_PREFERENCES);
  };

  // 🪄 Refresh when screen regains focus
  useFocusEffect(
    useCallback(() => {
      loadPreferences();
    }, [])
  );

  return {
    preferences,
    loaded,
    updatePreferences,
    resetPreferences,
    refresh: loadPreferences,
  };
};
