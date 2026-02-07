import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SavedCombo } from "../types";
import { useFocusEffect } from "@react-navigation/native";

const STORAGE_KEY = "@TrickaDexApp_savedCombos";

export const useSavedCombos = () => {
  const [savedCombos, setSavedCombos] = useState<SavedCombo[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadCombos = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSavedCombos(JSON.parse(saved));
      }
      setLoaded(true);
    } catch (error) {
      console.error("Failed to load saved combos:", error);
      setLoaded(true);
    }
  };

  const saveCombos = async (combos: SavedCombo[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(combos));
    } catch (error) {
      console.error("Failed to save combos:", error);
    }
  };

  const saveCombo = (comboText: string, title: string = "") => {
    const newCombo: SavedCombo = {
      id: Date.now().toString(),
      title: title.trim() || "Untitled Combo",
      comboText,
      timestamp: Date.now(),
    };
    const newCombos = [newCombo, ...savedCombos];
    setSavedCombos(newCombos);
    saveCombos(newCombos);
  };

  const deleteCombo = (comboId: string) => {
    const newCombos = savedCombos.filter(combo => combo.id !== comboId);
    setSavedCombos(newCombos);
    saveCombos(newCombos);
  };

  const getSavedCount = () => savedCombos.length;

  // 🪄 Refresh when screen regains focus
  useFocusEffect(
    useCallback(() => {
      loadCombos();
    }, [])
  );

  return {
    savedCombos,
    loaded,
    saveCombo,
    deleteCombo,
    getSavedCount,
    refresh: loadCombos,
  };
};
