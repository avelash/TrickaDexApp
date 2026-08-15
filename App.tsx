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
  useEffect(() => {
    runMigrations().finally(() => setMigrated(true));
  }, []);

  useEffect(() => {
    async function checkForUpdates() {
      try {
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync(); // 🔥 silent reload
        }
      } catch (e) {
        console.log('Update check failed:', e);
      }
    }

    checkForUpdates();
  }, []);

  if (!migrated) return null;

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