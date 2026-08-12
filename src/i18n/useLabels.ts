import { useCallback } from "react";
import { useLanguage } from "./LanguageContext";
import { TranslationKey } from "./translations";
import { FILTER_KEYS, CATEGORY_KEYS } from "./filterKeys";

export const useLabels = () => {
  const { t } = useLanguage();

  /** Translates a FILTER_CONFIG or SKILL_LEVELS name for display. */
  const filterLabel = useCallback(
    (name: string) => (FILTER_KEYS[name] ? t(FILTER_KEYS[name]) : name),
    [t]
  );

  const categoryLabel = useCallback(
    (category: string) =>
      CATEGORY_KEYS[category] ? t(CATEGORY_KEYS[category]) : category,
    [t]
  );

  /** Translates a skill level by its numeric difficulty (0-7). */
  const levelLabel = useCallback(
    (level: number) => t(`level.${level}` as TranslationKey),
    [t]
  );

  const stanceLabel = useCallback(
    (stance: string) => t(`stance.${stance}` as TranslationKey),
    [t]
  );

  const takeoffLabel = useCallback(
    (takeoff: string) => t(`takeoff.${takeoff}` as TranslationKey),
    [t]
  );

  /**
   * Translates a combo transition connector. Passes through unknown values
   * such as the "---" placeholder and the empty string used for no transition.
   */
  const transitionLabel = useCallback(
    (transition: string) => {
      if (!transition || transition === "---") return transition;
      const translated = t(`transition.${transition}` as TranslationKey);
      return translated === `transition.${transition}` ? transition : translated;
    },
    [t]
  );

  return {
    filterLabel,
    categoryLabel,
    levelLabel,
    stanceLabel,
    takeoffLabel,
    transitionLabel,
  };
};
