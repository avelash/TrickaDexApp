import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  clearOnboarding,
  readOnboardingComplete,
  setOnboardingComplete,
} from "../data/onboarding";

interface OnboardingContextValue {
  completed: boolean;
  complete: () => Promise<void>;
  reset: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

/**
 * Single source of truth for onboarding state, so the splash router, the
 * Challenges tab gate and the Profile re-run entry can never disagree.
 *
 * Holds render until the flag is known — same approach as LanguageProvider —
 * which is what removes the startup race the old welcome screen had.
 */
export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    readOnboardingComplete()
      .then(setCompleted)
      .finally(() => setLoading(false));
  }, []);

  const complete = useCallback(async () => {
    await setOnboardingComplete();
    setCompleted(true);
  }, []);

  const reset = useCallback(async () => {
    await clearOnboarding();
    setCompleted(false);
  }, []);

  const value = useMemo(
    () => ({ completed, complete, reset }),
    [completed, complete, reset]
  );

  if (loading) return null;

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextValue => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};
