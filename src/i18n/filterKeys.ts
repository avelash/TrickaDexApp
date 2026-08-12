import { TranslationKey } from "./translations";

/**
 * Filter and skill-level names double as logic identifiers throughout the app
 * (see useTrickFiltering), so the underlying English `name` values must stay
 * put. This maps them to their translation keys for display and for matching
 * Hebrew search input back to the canonical English name.
 */
export const FILTER_KEYS: Record<string, TranslationKey> = {
  Kick: "filter.kick",
  Flip: "filter.flip",
  Twist: "filter.twist",
  Transition: "filter.transition",
  Landed: "filter.landed",
  "Next Learns": "filter.nextLearns",
  Favorites: "filter.favorites",
  Novice: "level.0",
  Beginner: "level.1",
  Intermediate: "level.2",
  Advanced: "level.3",
  Elite: "level.4",
  Ascendant: "level.5",
  Transcendent: "level.6",
  Godlike: "level.7",
};

export const CATEGORY_KEYS: Record<string, TranslationKey> = {
  Level: "filter.category.level",
  Type: "filter.category.type",
  "Learn/Landed": "filter.category.learnLanded",
};
