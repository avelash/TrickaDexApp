import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, StatusBar, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../App'; // adjust path if needed
import { useLanguage } from '../i18n';
import { useOnboarding } from '../hooks/useOnboarding';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WelcomeScreen'>;

const SPLASH_MS = 2200;

export const WelcomeScreen: React.FC = () => {
    const navigation = useNavigation<WelcomeScreenNavigationProp>();
    const { width, height } = Dimensions.get('window');

    const { t } = useLanguage();
    const { completed } = useOnboarding();
    const navigatedRef = useRef(false);

    // One timer, one target. The old flow gated this on an async storage read,
    // so the timer could start before the name modal opened and race it. The
    // onboarding flag is already resolved here because OnboardingProvider holds
    // render until it loads.
    useEffect(() => {
        const timer = setTimeout(() => {
            if (navigatedRef.current) return;
            navigatedRef.current = true;
            navigation.replace(completed ? 'MainTabs' : 'OnboardingScreen');
        }, SPLASH_MS);

        return () => clearTimeout(timer);
    }, [navigation, completed]);

    const icons = [
        require('../../assets/540_icon.png'),
        require('../../assets/backflip_icon.png'),
        require('../../assets/bhs_icon.png'),
        require('../../assets/cartwheel_icon.png'),
        require('../../assets/handstand_icon.png'),
        require('../../assets/hook_icon.png'),
        require('../../assets/round_icon.png'),
        require('../../assets/tornado_icon.png'),
        require('../../assets/scoot_icon.png'),
        require('../../assets/rocketboi_icon.png'),
        require('../../assets/corkRodeo_icon.png'),
        require('../../assets/btwistShuriken_icon.png')
    ];

    const percentPositions = [
        { top: 8, left: 30 },
        { top: 15, left: 70 },
        { top: 70, left: 15 },
        { top: 80, left: 65 },
        { top: 30, left: 40 },
        { top: 60, left: 80 },
        { top: 50, left: 5 },
        { top: 85, left: 40 },
        { top: 40, left: 75 },
        { top: 75, left: 40 },
        { top: 20, left: 10 },
        { top: 60, left: 45 }
    ];

    const iconPositions = percentPositions.map(pos => ({
        top: (pos.top / 100) * height,
        left: (pos.left / 100) * width,
    }));

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content"/>
            {icons.map((icon, idx) => (
                <Image
                    key={idx}
                    source={icon}
                    style={[styles.bgIcon, iconPositions[idx]]}
                    resizeMode="contain"
                />
            ))}
            <View style={styles.centerContent}>
                <Text style={styles.appName}>{t('welcome.title')}</Text>
                <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>
            </View>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bgIcon: {
        position: 'absolute',
        width: 80,
        height: 80,
        opacity: 0.5,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appName: {
        fontSize: 54,
        fontWeight: 'bold',
        color: '#222',
        letterSpacing: 2,
        marginBottom: 18,
        textAlign: 'center',
        //fontFamily: 'sans-serif-condensed',
    },
    subtitle: {
        fontSize: 20,
        color: '#444',
        opacity: 0.8,
        textAlign: 'center',
        fontWeight: '500',
    },
});
