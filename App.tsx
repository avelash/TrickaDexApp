// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { TrickListScreen } from './src/screens/TrickListScreen';
import { UserProfileScreen } from './src/screens/UserProfileScreen';
import { AllLevelsProgressScreen } from './src/screens/AllLevelsProgressScreen';

// Define type-safe stack param list
export type RootStackParamList = {
  WelcomeScreen: undefined;
  TrickListScreen: {
    initialFilter?: string;
  } | undefined;
  UserProfileScreen: undefined;
  AllLevelsProgressScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="WelcomeScreen"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
        <Stack.Screen name="TrickListScreen" component={TrickListScreen} />
        <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
        <Stack.Screen name="AllLevelsProgressScreen" component={AllLevelsProgressScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}