import { useState, useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Event emitter for cross-component communication
class UserNameEmitter {
  private listeners: Set<(name: string) => void> = new Set();

  subscribe(listener: (name: string) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(name: string) {
    this.listeners.forEach((listener) => listener(name));
  }
}

const emitter = new UserNameEmitter();

export const useUserName = () => {
  const [userName, setUserNameState] = useState<string | null>("");
  const [loading, setLoading] = useState(true);

  // Load initial userName
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const storedName = await AsyncStorage.getItem("userName");
        const name = storedName || "Alex Thompson";
        setUserNameState(name);
      } catch {
        setUserNameState("Alex Thompson");
      } finally {
        setLoading(false);
      }
    };
    fetchUserName();
  }, []);

  // Subscribe to changes from other components
  useEffect(() => {
    const unsubscribe = emitter.subscribe((newName) => {
      setUserNameState(newName);
    });
    return unsubscribe;
  }, []);

  // Update userName and notify all other components
  const setUserName = useCallback(async (newName: string) => {
    const trimmed = newName.trim();
    if (trimmed) {
      setUserNameState(trimmed);
      try {
        await AsyncStorage.setItem("userName", trimmed);
        // Notify all other hooks
        emitter.emit(trimmed);
      } catch (error) {
        console.error("Failed to save userName:", error);
      }
    }
  }, []);

  return { userName, setUserName, loading };
};
