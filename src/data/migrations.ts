import AsyncStorage from "@react-native-async-storage/async-storage";
import { ONBOARDING_KEY, setOnboardingComplete } from "./onboarding";

const MIGRATION_FLAG = "@TrickaDexApp_migrations";

/**
 * Storage keys holding { [trickId]: boolean } maps. All of them key off trick
 * ids, so any id rename has to rewrite every one of them.
 */
const ID_KEYED_STORES = [
  "@TrickaDexApp_progress",
  "@TrickaDexApp_favorites",
  "@TrickaDexApp_excluded_tricks",
];

/**
 * The Aerial trick shipped with a leading space in its id (" aerial"). Fixing
 * the id would otherwise orphan the landed/favorite/excluded state of anyone
 * who already has the app installed, so rename the stored keys to match.
 */
const RENAMED_TRICK_IDS: Record<string, string> = {
  " aerial": "aerial",
};

const renameTrickIds = async () => {
  await Promise.all(
    ID_KEYED_STORES.map(async storageKey => {
      const raw = await AsyncStorage.getItem(storageKey);
      if (!raw) return;

      const stored: Record<string, boolean> = JSON.parse(raw);
      let changed = false;

      Object.entries(RENAMED_TRICK_IDS).forEach(([oldId, newId]) => {
        if (!(oldId in stored)) return;
        // Keep a true value if either id was set, then drop the stale key.
        stored[newId] = stored[newId] || stored[oldId];
        delete stored[oldId];
        changed = true;
      });

      if (changed) {
        await AsyncStorage.setItem(storageKey, JSON.stringify(stored));
      }
    })
  );
};

/**
 * Marks anyone who has already used the app as onboarded, so existing installs
 * are never dropped into first-run onboarding.
 *
 * Deliberately runs BEFORE the MIGRATION_FLAG check below: that flag is already
 * set on every install that has launched since the trick-id rename shipped —
 * exactly the users this backfill protects. Behind the guard it would never run
 * for them. It is self-guarding and costs one read per launch.
 */
const backfillOnboarding = async () => {
  if (await AsyncStorage.getItem(ONBOARDING_KEY)) return;

  const raw = await AsyncStorage.getItem("@TrickaDexApp_progress");
  const hasProgress = raw
    ? Object.values(JSON.parse(raw) as Record<string, boolean>).some(Boolean)
    : false;
  // A stored name means they got through the old welcome flow at least once.
  const hasName = !!(await AsyncStorage.getItem("userName"));

  if (hasProgress || hasName) await setOnboardingComplete();
};

/**
 * Runs any one-time data migrations. Safe to call on every launch: each step is
 * idempotent and self-guarding.
 */
export const runMigrations = async (): Promise<void> => {
  try {
    await backfillOnboarding();

    if (await AsyncStorage.getItem(MIGRATION_FLAG)) return;

    await renameTrickIds();

    await AsyncStorage.setItem(MIGRATION_FLAG, "1");
  } catch (error) {
    // A failed migration must not block app startup; it retries next launch
    // because the flag is only written after a clean run.
    console.error("Failed to run migrations:", error);
  }
};
