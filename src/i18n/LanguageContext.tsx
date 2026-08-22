import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nManager } from "react-native";
import * as Updates from "expo-updates";
import { Language, TranslationKey, translations } from "./translations";
import { AppSplash } from "../components/AppSplash";
import { withTimeout } from "../utils/withTimeout";

const RELOAD_TIMEOUT_MS = 5000;

const STORAGE_KEY = "appLanguage";

const isRTLLanguage = (language: Language) => language === "he";

/**
 * Aligns the native layout direction with the language. React Native only
 * picks up a direction change on a fresh JS bundle load, so this reports
 * whether a reload is needed rather than trying to apply it in place.
 */
const applyLayoutDirection = (language: Language): boolean => {
  const shouldBeRTL = isRTLLanguage(language);
  let needsReload = false;

  // React Native mirrors `left`/`right` style values under RTL by default.
  // The drag-and-drop overlay positions itself from measureInWindow, which
  // always reports physical coordinates, so the swap places the dragged card
  // on the opposite side of the screen from the finger. Flex layout still
  // mirrors — that is driven by the layout direction, not this flag.
  if (shouldBeRTL && I18nManager.doLeftAndRightSwapInRTL) {
    I18nManager.swapLeftAndRightInRTL(false);
    needsReload = true;
  }

  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(shouldBeRTL);
    needsReload = true;
  }

  return needsReload;
};

/** Resolves false when the reload could not be performed. */
const reload = async (): Promise<boolean> => {
  try {
    await Updates.reloadAsync();
    return true;
  } catch (error) {
    console.error("Failed to reload after language change:", error);
    return false;
  }
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  /** Translate a key, optionally interpolating {placeholders}. */
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  /** True when the active language is written right-to-left. */
  isRTL: boolean;
  loading: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const interpolate = (
  template: string,
  params?: Record<string, string | number>
) => {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    name in params ? String(params[name]) : match
  );
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>("en");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const language = stored === "en" || stored === "he" ? stored : "en";
        setLanguageState(language);

        // A mismatch here means the app relaunched before the layout direction
        // took effect; reload once so the native side catches up.
        //
        // If the reload fails there is no second chance, so rendering must be
        // released anyway — otherwise `loading` stays true and the app sits on a
        // blank screen forever, with the layout direction merely mismatched.
        if (applyLayoutDirection(language)) {
          // A successful reload never resolves — the app restarts — so the
          // timeout only matters when the reload silently hangs.
          const reloaded = await withTimeout(reload(), RELOAD_TIMEOUT_MS).catch(
            () => false
          );
          if (reloaded) return;
        }
      } catch (error) {
        console.error("Failed to load language:", error);
      }
      setLoading(false);
    };
    load();
  }, []);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    AsyncStorage.setItem(STORAGE_KEY, next)
      .catch((error) => console.error("Failed to save language:", error))
      .finally(() => {
        // Switching between an LTR and an RTL language only takes effect on a
        // fresh bundle load.
        if (applyLayoutDirection(next)) reload();
      });
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    const table = translations[language];
    return {
      language,
      setLanguage,
      t: (key, params) => interpolate(table[key] ?? translations.en[key] ?? key, params),
      isRTL: language === "he",
      loading,
    };
  }, [language, setLanguage, loading]);

  // Hold rendering until the stored language is known, so a returning Hebrew
  // user never sees a flash of English on the welcome screen. Show the splash
  // rather than nothing, so a slow read never looks like a broken app.
  if (loading) return <AppSplash />;

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
