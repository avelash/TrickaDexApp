import { useCallback } from "react";
import { Trick } from "../types";
import { useLanguage } from "./LanguageContext";
import { TRICKS_HE } from "./tricksHe";

/**
 * Resolves a trick's display name and description for the active language,
 * falling back to the English text in the trick data when no translation exists.
 */
export const useTrickText = () => {
  const { language } = useLanguage();

  const trickName = useCallback(
    (trick: Pick<Trick, "id" | "name">) =>
      (language === "he" && TRICKS_HE[trick.id]?.name) || trick.name,
    [language]
  );

  const trickDescription = useCallback(
    (trick: Pick<Trick, "id" | "description">) =>
      (language === "he" && TRICKS_HE[trick.id]?.description) ||
      trick.description,
    [language]
  );

  /** Name lookup by id, for prerequisite lists and other id-only contexts. */
  const trickNameById = useCallback(
    (id: string, fallback: string) =>
      (language === "he" && TRICKS_HE[id]?.name) || fallback,
    [language]
  );

  return { trickName, trickDescription, trickNameById };
};
