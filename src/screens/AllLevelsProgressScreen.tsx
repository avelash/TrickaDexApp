import React, { useMemo, useEffect, useState, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    Image,
    Animated,
    Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList} from '../../App';
import type { ProfileStackParamList } from '../navigation/MainTabsNavigator'

import { TRICKS_DATA } from '../data/tricks';
import { SKILL_LEVELS } from '../data/skillLevels';
import { useTrickProgress } from '../hooks/useTrickProgress';

type AllLevelsProgressNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'MainTabs'
>;

interface LevelStat {
    name: string;
    color: string;
    tier: number;
    total: number;
    landed: number;
    progressPct: number;
}

interface LevelProgressBarProps {
    level: LevelStat;
    onPress: () => void;
}

const LevelProgressBar: React.FC<LevelProgressBarProps> = ({ level, onPress }) => {
    const animatedWidth = useRef(new Animated.Value(0)).current;
    const [displayedPct, setDisplayedPct] = useState(0);
    const [showMastered, setShowMastered] = useState(false);

    useEffect(() => {
        const isMastered = level.progressPct === 100;

        // Animate width change
        Animated.timing(animatedWidth, {
            toValue: level.progressPct,
            duration: 1200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start(() => {
            // Only show mastered after animation completes
            if (isMastered) {
                setShowMastered(true);
            }
        });

        const listenerId = animatedWidth.addListener(({ value }) => {
            setDisplayedPct(Math.round(value));
        });

        // Immediately hide "mastered" if percentage drops below 100
        if (!isMastered) {
            setShowMastered(false);
        }

        return () => {
            animatedWidth.removeListener(listenerId);
        };
    }, [level.progressPct]);

    const widthInterpolation = animatedWidth.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    const isMastered = level.progressPct === 100;

    return (
        <View
            style={[
                styles.levelContainer,
                showMastered && styles.masteredLevelContainer,
            ]}
        >
            <View style={styles.levelHeader}>
                <Text style={styles.levelName}>{level.name}</Text>
                <Text style={styles.levelStats}>
                    {level.landed} / {level.total} tricks
                </Text>
            </View>

            {showMastered && (
                <Image
                    source={require('../../assets/check.png')}
                    style={styles.masteredIcon}
                />
            )}

            <TouchableOpacity
                style={styles.progressBarContainer}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View style={styles.progressBarBg}>
                    <Animated.View
                        style={[
                            styles.progressBarFill,
                            {
                                width: widthInterpolation,
                                backgroundColor: level.color,
                            },
                        ]}
                    >
                        {showMastered ? (
                            <Text style={styles.masteredText}>Mastered</Text>
                        ) : displayedPct > 15 ? (
                            <Text style={styles.progressText}>{displayedPct}%</Text>
                        ) : null}
                    </Animated.View>

                    {displayedPct < 15 && displayedPct > 0 && !showMastered && (
                        <Text
                            style={[styles.progressText, styles.progressTextOutside]}
                        >
                            {displayedPct}%
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        </View>
    );
};

export const AllLevelsProgressScreen: React.FC = () => {
type ProfileNav = NativeStackNavigationProp<ProfileStackParamList, 'AllLevelsProgressScreen'>;
    const navigation = useNavigation<ProfileNav>();
    type RootNav = NativeStackNavigationProp<RootStackParamList>;
    const rootNavigation = useNavigation<RootNav>();
    const { landedTricks } = useTrickProgress();

    const levelStats: LevelStat[] = useMemo(() => {
        return SKILL_LEVELS.map(level => {
            const tricksInLevel = TRICKS_DATA.filter(
                t => t.difficulty === level.number
            );
            const landedInLevel = tricksInLevel.filter(t => landedTricks[t.id]);
            const progressPct =
                tricksInLevel.length > 0
                    ? Math.round((landedInLevel.length / tricksInLevel.length) * 100)
                    : 0;
            return {
                name: level.name,
                color: level.color,
                tier: level.number,
                total: tricksInLevel.length,
                landed: landedInLevel.length,
                progressPct,
            };
        });
    }, [landedTricks]);

    const handleLevelPress = (levelName: string) => {
        rootNavigation.navigate('MainTabs', {
            screen: 'TrickTab',
            params: {
                screen: 'TrickListScreen',
                params: { initialFilter: levelName },
            },
        } as any);
    };

    const totalLanded = Object.keys(landedTricks).filter(
        id => landedTricks[id]
    ).length;

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="#4ECDC4"
                hidden={true}
            />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Image
                        source={require('../../assets/return.png')}
                        style={styles.backIcon}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Level Progress</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.subtitle}>
                    Track your progress across all skill levels
                </Text>

                <View style={styles.levelsList}>
                    {levelStats.map(level => (
                        <LevelProgressBar
                            key={level.name}
                            level={level}
                            onPress={() => handleLevelPress(level.name)}
                        />
                    ))}
                </View>

                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Overall Progress</Text>
                    <Text style={styles.summaryText}>
                        {totalLanded} / {TRICKS_DATA.length} tricks landed
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },
    header: {
        backgroundColor: '#4ECDC4',
        paddingHorizontal: 16,
        paddingVertical: 30,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    backIcon: {
        width: 24,
        height: 24,
        tintColor: 'white',
        resizeMode: 'contain',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 24,
    },
    levelsList: {
        gap: 16,
    },
    levelContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 0,
        borderColor: 'transparent',
    },
    masteredLevelContainer: {
        borderWidth: 2,
        borderColor: '#4ECDC4',
    },
    levelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    levelName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    levelStats: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    progressBarContainer: {
        width: '100%',
    },
    progressBarBg: {
        height: 40,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        overflow: 'hidden',
        justifyContent: 'center',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    },
    masteredText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    progressTextOutside: {
        color: '#6B7280',
        position: 'absolute',
        left: 12,
    },
    summaryCard: {
        marginTop: 16,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    summaryText: {
        fontSize: 16,
        color: '#6B7280',
    },
    masteredIcon: {
        width: 32,
        height: 32,
        position: 'absolute',
        top: -5,
        right: -8,
        zIndex: 10,
        tintColor: '#4ECDC4',
    },
});
