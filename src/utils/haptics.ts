/**
 * Haptics behind a safety guard.
 *
 * expo-haptics ships native code, so it only exists in builds made after it was
 * added. An over-the-air update can reach an older binary that has no such
 * native module, and calling into it there would crash the app. Everything here
 * degrades to a no-op instead, which keeps OTA updates safe to publish while a
 * new store build is still rolling out.
 */
type HapticsModule = typeof import("expo-haptics");

let cached: HapticsModule | null | undefined;

const getHaptics = (): HapticsModule | null => {
  if (cached !== undefined) return cached;
  try {
    cached = require("expo-haptics") as HapticsModule;
  } catch {
    cached = null;
  }
  return cached;
};

const run = (action: (haptics: HapticsModule) => Promise<void> | void) => {
  const haptics = getHaptics();
  if (!haptics) return;
  try {
    Promise.resolve(action(haptics)).catch(() => {
      // A failed haptic is never worth surfacing to the rider.
    });
  } catch {
    // Native module present but unusable (e.g. unsupported device).
  }
};

/** Light tick — landing a trick. */
export const tapFeedback = () =>
  run(haptics => haptics.impactAsync(haptics.ImpactFeedbackStyle.Medium));

/** Success chime — a trick landed and opened something up. */
export const successFeedback = () =>
  run(haptics =>
    haptics.notificationAsync(haptics.NotificationFeedbackType.Success)
  );

/** Heavier double hit — levelling up. */
export const celebrationFeedback = () => {
  run(haptics => haptics.impactAsync(haptics.ImpactFeedbackStyle.Heavy));
  setTimeout(
    () =>
      run(haptics =>
        haptics.notificationAsync(haptics.NotificationFeedbackType.Success)
      ),
    140
  );
};

/** Subtle cue when a drag picks a card up. */
export const dragFeedback = () =>
  run(haptics => haptics.impactAsync(haptics.ImpactFeedbackStyle.Light));
