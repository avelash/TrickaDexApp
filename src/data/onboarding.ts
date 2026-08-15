import AsyncStorage from "@react-native-async-storage/async-storage";

export const ONBOARDING_KEY = "@TrickaDexApp_onboarding";

interface OnboardingRecord {
  completed: boolean;
  completedAt: number;
  /** Lets a future onboarding revision re-prompt without losing the old flag. */
  version: number;
}

const CURRENT_VERSION = 1;

/**
 * React-free so migrations can use it — migrations run before any screen
 * mounts and must not pull in hooks.
 */
export const readOnboardingComplete = async (): Promise<boolean> => {
  try {
    const raw = await AsyncStorage.getItem(ONBOARDING_KEY);
    if (!raw) return false;
    const record: OnboardingRecord = JSON.parse(raw);
    return !!record.completed;
  } catch {
    return false;
  }
};

export const setOnboardingComplete = async (): Promise<void> => {
  const record: OnboardingRecord = {
    completed: true,
    completedAt: Date.now(),
    version: CURRENT_VERSION,
  };
  await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(record));
};

export const clearOnboarding = async (): Promise<void> => {
  await AsyncStorage.removeItem(ONBOARDING_KEY);
};
