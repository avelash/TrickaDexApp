import { Image } from 'react-native';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { TrickListScreen } from '../screens/TrickListScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { AllLevelsProgressScreen } from '../screens/AllLevelsProgressScreen';
import { ComboBuilderScreen } from '../screens/ComboBuilderScreen';

// ---------- Param types ----------

export type TrickStackParamList = {
    TrickListScreen: {
        initialFilter?: string;
        trigger?: number;
    } | undefined;
};

export type ProfileStackParamList = {
    UserProfileScreen: undefined;
    AllLevelsProgressScreen: undefined;
};

export type ComboStackParamList = {
    ComboBuilderScreen: undefined;
};

export type MainTabParamList = {
    TrickTab: undefined;
    ProfileTab: undefined;
    ComboTab: undefined;
};

// ---------- Navigators ----------

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

export function MainTabs() {
    const FOCUSED_SIZE = 60;
    const SIZE = 40;
    return (
        <Tab.Navigator
        initialRouteName='TrickTab'
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    height: 90,
                    backgroundColor: '#fff',
                    borderTopWidth: 0,
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: -2 },
                    marginBottom: 7,
                },
                tabBarHideOnKeyboard: true,
            })}
        >
            <Tab.Screen
                name="ProfileTab"
                component={ProfileStackNavigator}
                options={{
                    tabBarLabel: () => null,
                    tabBarIcon: ({ focused, size }) => (
                        <Image
                            source={require('../../assets/userProfile_icon.png')}
                            style={{
                                width: focused ? FOCUSED_SIZE : SIZE,
                                height: focused ? FOCUSED_SIZE : SIZE,
                                opacity: focused ? 1 : 0.8,
                                borderRadius: 10,
                            }}
                            resizeMode="contain"
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="TrickTab"
                component={TrickStackNavigator}
                options={{
                    tabBarLabel: () => null,
                    tabBarIcon: ({ focused, size }) => (
                        <Image
                            source={require('../../assets/trickList_icon.png')}
                            style={{
                                width: focused ? FOCUSED_SIZE : SIZE,
                                height: focused ? FOCUSED_SIZE : SIZE,
                                opacity: focused ? 1 : 0.8,
                                borderRadius: 10,
                            }}
                            resizeMode="contain"
                        />
                    ),
                    tabBarItemStyle: {
                        marginBottom: 15,
                    },
                }}
            />
            <Tab.Screen
                name="ComboTab"
                component={ComboStackNavigator}
                options={{
                    tabBarLabel: () => null,
                    tabBarIcon: ({ focused, size }) => (
                        <Image
                            source={require('../../assets/comboBuilder_icon_tmp.png')}
                            style={{
                                width: focused ? FOCUSED_SIZE : SIZE,
                                height: focused ? FOCUSED_SIZE : SIZE,
                                opacity: focused ? 1 : 0.8,
                                borderRadius: 10,
                            }}
                            resizeMode="contain"
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}