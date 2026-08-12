import { FILTER_CONFIG } from "../data/filterConfigs";
import { FILTER_KEYS } from "./filterKeys";
import { TRICKS_HE } from "./tricksHe";
import { translations } from "./translations";

/**
 * Search helpers match against English *and* Hebrew text regardless of the
 * active language. The two scripts never collide, so there is no ambiguity,
 * and a user can find a trick by either name without switching languages.
 */

export const trickMatchesSearch = (
  trick: { id: string; name: string },
  search: string
): boolean => {
  const needle = search.trim().toLowerCase();
  if (!needle) return true;
  return (
    trick.name.toLowerCase().includes(needle) ||
    (TRICKS_HE[trick.id]?.name ?? "").toLowerCase().includes(needle)
  );
};

/**
 * Resolves search text to a canonical (English) FILTER_CONFIG name, accepting
 * either the English name or its Hebrew label. Returns undefined when the text
 * is not a filter name, in which case it should be treated as a trick search.
 */
export const findFilterByName = (search: string): string | undefined => {
  const needle = search.trim().toLowerCase();
  if (!needle) return undefined;

  return FILTER_CONFIG.find(filter => {
    if (filter.name.toLowerCase() === needle) return true;
    const key = FILTER_KEYS[filter.name];
    return key ? translations.he[key].toLowerCase() === needle : false;
  })?.name;
};
