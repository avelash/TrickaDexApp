import React, { useEffect, useState } from 'react';
import * as Updates from 'expo-updates';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// Layout direction is driven by the selected language; see LanguageProvider.
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';
import { MainTabs } from './src/navigation/MainTabsNavigator';
import { LanguageProvider } from './src/i18n';
import { OnboardingProvider } from './src/hooks/useOnboarding';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { runMigrations } from './src/data/migrations';
import { AppSplash } from './src/components/AppSplash';
import { withTimeout } from './src/utils/withTimeout';
import { requestReload } from './src/utils/appReload';

const MIGRATION_TIMEOUT_MS = 8000;
const UPDATE_CHECK_TIMEOUT_MS = 5000;
const UPDATE_FETCH_TIMEOUT_MS = 20000;

export type RootStackParamList = {
  WelcomeScreen: undefined;
  OnboardingScreen: { tricksOnly?: boolean } | undefined;
  MainTabs: undefined;
  FeedbackScreen: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [migrated, setMigrated] = useState(false);

  // Migrations rewrite stored trick ids, so they must finish before any screen
  // mounts and reads progress/favorites/excluded state.
  //
  // Fails open: if a storage read never settles, the timer releases the gate
  // anyway. Blocking forever would leave the app on a blank screen with no way
  // out, which is far worse than running with an unmigrated store.
  useEffect(() => {
    const fallback = setTimeout(() => setMigrated(true), MIGRATION_TIMEOUT_MS);

    runMigrations().finally(() => {
      clearTimeout(fallback);
      setMigrated(true);
    });

    return () => clearTimeout(fallback);
  }, []);

  // Gated on `migrated` so a reload can never land mid-migration. Migrations are
  // idempotent and write their flag last, so an interrupted run recovers — but
  // there is no reason to interrupt one.
  //
  // This duplicates the native ON_LOAD check in app.json, deliberately. The
  // native one runs before the JS bundle loads and is the only way a bundle
  // that fails to render can ever heal itself, so it stays. This one applies an
  // update in the current session rather than the next launch.
  useEffect(() => {
    if (!migrated) return;

    async function checkForUpdates() {
      try {
        const update = await withTimeout(
          Updates.checkForUpdateAsync(),
          UPDATE_CHECK_TIMEOUT_MS
        );

        if (update.isAvailable) {
          await withTimeout(Updates.fetchUpdateAsync(), UPDATE_FETCH_TIMEOUT_MS);
          await requestReload('update available');
        }
      } catch (e) {
        console.log('Update check failed:', e);
      }
    }

    checkForUpdates();
  }, [migrated]);

  if (!migrated) return <AppSplash />;

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <OnboardingProvider>
          <NavigationContainer>
            <RootStack.Navigator
              initialRouteName="WelcomeScreen"
              screenOptions={{ headerShown: false }}
            >
              <RootStack.Screen name="WelcomeScreen" component={WelcomeScreen} />
              <RootStack.Screen name="OnboardingScreen" component={OnboardingScreen} />
              <RootStack.Screen name="MainTabs" component={MainTabs} />
              <RootStack.Screen name="FeedbackScreen" component={FeedbackScreen} />
            </RootStack.Navigator>
          </NavigationContainer>
        </OnboardingProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}