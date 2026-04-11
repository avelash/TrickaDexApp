// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { WelcomeScreen } from './src/screens/WelcomeScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';
import { MainTabs } from './src/navigation/MainTabsNavigator';

export type RootStackParamList = {
  WelcomeScreen: undefined;
  MainTabs: undefined;
  FeedbackScreen: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootStack.Navigator
          initialRouteName="WelcomeScreen"
          screenOptions={{ headerShown: false }}
        >
          <RootStack.Screen name="WelcomeScreen" component={WelcomeScreen} />
          <RootStack.Screen name="MainTabs" component={MainTabs} />
          <RootStack.Screen name="FeedbackScreen" component={FeedbackScreen} />
        </RootStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}