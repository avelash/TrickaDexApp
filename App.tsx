// App.tsx
import { Image } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { TrickListScreen } from './src/screens/TrickListScreen';
import { UserProfileScreen } from './src/screens/UserProfileScreen';
import { AllLevelsProgressScreen } from './src/screens/AllLevelsProgressScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';
import { ComboBuilderScreen } from './src/screens/ComboBuilderScreen';

// ---------- Param types ----------

// Trick tab stack
export type TrickStackParamList = {
  TrickListScreen: {
    initialFilter?: string;
  } | undefined;
};

// Profile tab stack
export type ProfileStackParamList = {
  UserProfileScreen: undefined;
  AllLevelsProgressScreen: undefined;
};

// Combo tab stack
export type ComboStackParamList = {
  ComboBuilderScreen: undefined;
};

// Tabs
export type MainTabParamList = {
  TrickTab: undefined;
  ProfileTab: undefined;
  ComboTab: undefined;
};

// Root stack
export type RootStackParamList = {
  WelcomeScreen: undefined;
  MainTabs: undefined;
  FeedbackScreen: undefined;
};

// ---------- Navigators ----------

const RootStack = createNativeStackNavigator<RootStackParamList>();
const TrickStack = createNativeStackNavigator<TrickStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const ComboStack = createNativeStackNavigator<ComboStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// ---------- Stacks inside each tab ----------

function TrickStackNavigator() {
  return (
    <TrickStack.Navigator screenOptions={{ headerShown: false }}>
      <TrickStack.Screen
        name="TrickListScreen"
        component={TrickListScreen}
      />
    </TrickStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen
        name="UserProfileScreen"
        component={UserProfileScreen}
      />
      <ProfileStack.Screen
        name="AllLevelsProgressScreen"
        component={AllLevelsProgressScreen}
      />
    </ProfileStack.Navigator>
  );
}

function ComboStackNavigator() {
  return (
    <ComboStack.Navigator screenOptions={{ headerShown: false }}>
      <ComboStack.Screen
        name="ComboBuilderScreen"
        component={ComboBuilderScreen}
      />
    </ComboStack.Navigator>
  );
}

// ---------- Bottom tabs ----------

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        // you can add tabBarIcon etc. here
      }}
    ><Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ focused, size }) => (
            <Image
              source={require('./assets/user.png')}
              style={{
                width: size,
                height: size,
                opacity: focused ? 1 : 0.6, // optional focus effect
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="TrickTab"
        component={TrickStackNavigator}
        options={{tabBarLabel: () => null,
      tabBarIcon: ({focused, size}) => (
      <Image
        source={require('./assets/kick.png')}
        style={{
          width: 40,
          height: 40,
          opacity: focused ? 1 : 0.6, // optional focus effect
        }}
        resizeMode="contain"
      />
      ),
        }}
      />
      <Tab.Screen
        name="ComboTab"
        component={ComboStackNavigator}
        options={{tabBarLabel: () => null,
      tabBarIcon: ({focused, size}) => (
      <Image
        source={require('./assets/game.png')}
        style={{
          width: 40,
          height: 40,
          opacity: focused ? 1 : 0.6, // optional focus effect
        }}
        resizeMode="contain"
      />
      ),
        }}
      />
    </Tab.Navigator>
  );
}

// ---------- Root app ----------

export default function App() {
  return (
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
  );
}
