import * as Updates from "expo-updates";

/**
 * Single owner of app restarts.
 *
 * More than one thing wants to reload — the language code to apply a layout
 * direction, the update check to apply a downloaded bundle. They run
 * independently and neither knows about the other, so without a shared latch
 * they can fire at the same moment or interrupt each other mid-restart.
 *
 * First caller wins; every later one is a no-op for the rest of the session.
 */
let reloading = false;

export const requestReload = async (reason: string): Promise<boolean> => {
  if (reloading) {
    console.log(`Reload already in progress, skipping: ${reason}`);
    return false;
  }
  reloading = true;

  try {
    await Updates.reloadAsync();
    return true;
  } catch (error) {
    // Nothing restarted, so let a later caller try.
    reloading = false;
    console.error(`Failed to reload (${reason}):`, error);
    return false;
  }
};
