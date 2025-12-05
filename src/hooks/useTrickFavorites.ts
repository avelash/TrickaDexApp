import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const STORAGE_KEY = "@TrickaDexApp_favorites";

export const useTrickFavorites = () => {
  const [favoriteTricks, setFavoriteTricks] = useState<{ [key: string]: boolean }>({});
  const [loaded, setLoaded] = useState(false);

  const loadFavorites = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setFavoriteTricks(JSON.parse(saved));
      }
      setLoaded(true);
    } catch (error) {
      console.error("Failed to load favorites:", error);
      setLoaded(true);
    }
  };

  const saveFavorites = async (favorites: { [key: string]: boolean }) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error("Failed to save favorites:", error);
    }
  };

  const toggleFavorite = (trickId: string) => {
    const newFavorites = {
      ...favoriteTricks,
      [trickId]: !favoriteTricks[trickId],
    };
    setFavoriteTricks(newFavorites);
    saveFavorites(newFavorites);
  };

  const getFavoriteCount = () =>
    Object.values(favoriteTricks).filter(Boolean).length;

  const isTrickFavorite = (trickId: string) => favoriteTricks[trickId] || false;

  // 🪄 Refresh when screen regains focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  return {
    favoriteTricks,
    loaded,
    toggleFavorite,
    getFavoriteCount,
    isTrickFavorite,
    refresh: loadFavorites,
  };
};
