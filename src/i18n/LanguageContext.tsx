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
import { Language, TranslationKey, translations } from "./translations";
import { AppSplash } from "../components/AppSplash";
import { withTimeout } from "../utils/withTimeout";
import { requestReload } from "../utils/appReload";

const RELOAD_TIMEOUT_MS = 5000;

const STORAGE_KEY = "appLanguage";

/**
 * Records which direction we last spent a reload attempting. Survives the
 * reload, which is the whole point: it is how the next boot tells "first
 * attempt" from "this is not working".
 */
const DIRECTION_ATTEMPT_KEY = "appLanguageDirectionAttempt";

const isRTLLanguage = (language: Language) => language === "he";

const directionTarget = (language: Language) =>
  isRTLLanguage(language) ? "rtl" : "ltr";

/**
 * Asks the native side for the layout direction a language needs, and reports
 * whether a restart is still required for it to take effect.
 *
 * The flags set here persist natively, so they apply on the next real process
 * start even if no reload happens now.
 */
const requestLayoutDirection = (language: Language): boolean => {
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

/** Direction is correct, so a future switch gets a fresh attempt. */
const clearDirectionAttempt = () => {
  AsyncStorage.removeItem(DIRECTION_ATTEMPT_KEY).catch(error =>
    console.error("Failed to clear direction attempt:", error)
  );
};

/**
 * Reloads at most once per direction change, and only ever once.
 *
 * On Android, forceRTL and swapLeftAndRightInRTL only take effect on a full
 * PROCESS restart. Updates.reloadAsync restarts just the JS bundle, so the
 * flags read back unchanged, the same reload is requested again, and the app
 * boot-loops forever without reaching a screen. That bricked Hebrew users, and
 * English users on Hebrew-locale devices, who start out with isRTL already true.
 *
 * The attempt marker is stored before reloading and survives it, so the next
 * boot can tell the reload did not work and render anyway. A layout direction
 * that is merely wrong beats an app that never opens — and it self-corrects the
 * next time the OS actually restarts the process, because the native flags were
 * already set.
 */
const reloadOnceForDirection = async (language: Language): Promise<boolean> => {
  const target = directionTarget(language);

  try {
    if ((await AsyncStorage.getItem(DIRECTION_ATTEMPT_KEY)) === target) {
      // Already spent a reload on this direction and it did not stick.
      return false;
    }
    await AsyncStorage.setItem(DIRECTION_ATTEMPT_KEY, target);
  } catch (error) {
    console.error("Failed to record direction attempt:", error);
    return false;
  }

  const reloaded = await requestReload("layout direction");

  if (!reloaded) {
    // Something else is already restarting the app (typically an update being
    // applied). That restart re-runs this check on the next boot, so the
    // attempt must not be counted as spent — otherwise the direction would be
    // abandoned for a reload it never actually got.
    clearDirectionAttempt();
  }

  return reloaded;
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

        if (requestLayoutDirection(language)) {
          // A successful reload never resolves — the app restarts — so the
          // timeout only matters when the reload silently hangs. Rendering is
          // released in every other case, including when the attempt has
          // already been spent, which is what stops the boot loop.
          const reloaded = await withTimeout(
            reloadOnceForDirection(language),
            RELOAD_TIMEOUT_MS
          ).catch(() => false);
          if (reloaded) return;
        } else {
          // Direction is already right, so a future switch gets its own attempt.
          clearDirectionAttempt();
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
        // Spends the same single attempt as boot, so an explicit switch costs
        // one restart rather than starting a loop of its own.
        if (requestLayoutDirection(next)) {
          reloadOnceForDirection(next);
        } else {
          clearDirectionAttempt();
        }
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
