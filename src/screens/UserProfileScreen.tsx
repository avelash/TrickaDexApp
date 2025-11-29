import React, { useMemo, useRef, useEffect, useState } from 'react';
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
    TextInput,
} from 'react-native';
import { Trick } from '../types';
import { useTrickProgress } from '../hooks/useTrickProgress';
import { TRICKS_DATA } from '../data/tricks';
import { SKILL_LEVELS } from '../data/skillLevels';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import type { ProfileStackParamList } from '../navigation/MainTabsNavigator'
import { TrickCard } from "../components/TrickCard";
import { TrickCardInfo } from "../components/TrickCardInfo";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserName } from '../hooks/useUserDetails';
import { easterEggNames } from '../data/easterEggs';

interface ProfileStats {
    focus: string;
    currentLevel: string;
    levelProgressPct: number;
    totalLanded: number;
}

interface UserProfileScreenProps {
    onNavigate?: () => void;
}

const useProfileStats = (landedTricks: { [key: string]: boolean }): ProfileStats => {
    return useMemo(() => {
        const landedTrickIds = Object.keys(landedTricks).filter(id => landedTricks[id]);
        const landedTrickObjects = landedTrickIds
            .map(id => TRICKS_DATA.find(t => t.id === id))
            .filter(Boolean) as Trick[];

        const typeCounts = { kick: 0, flip: 0, twist: 0 };
        landedTrickObjects.forEach(trick => {
            trick.types.forEach(type => {
                const typeLower = type.toLowerCase();
                if (typeLower in typeCounts) typeCounts[typeLower as keyof typeof typeCounts]++;
            });
        });

        const totalTypes = typeCounts.kick + typeCounts.flip + typeCounts.twist;
        let focus = 'Well Rounded';
        if (totalTypes > 0) {
            const kickPct = (typeCounts.kick / totalTypes) * 100;
            const flipPct = (typeCounts.flip / totalTypes) * 100;
            const twistPct = (typeCounts.twist / totalTypes) * 100;
            if (kickPct > 45) focus = 'Kicker';
            else if (flipPct > 45) focus = 'Flipper';
            else if (twistPct > 45) focus = 'Twister';
        }

        const tricksByTier: { [tier: number]: number } = {};
        landedTrickObjects.forEach(trick => {
            tricksByTier[trick.difficulty] = (tricksByTier[trick.difficulty] || 0) + 1;
        });

        let currentLevelIdx = -1;
        for (let tier = 7; tier >= 0; tier--) {
            if (tricksByTier[tier] >= 4) {
                currentLevelIdx = tier;
                break;
            }
        }

        let levelProgressPct = 0;
        if (currentLevelIdx >= 0) {
            const tricksInTier = TRICKS_DATA.filter(t => t.difficulty === currentLevelIdx);
            const landedInTier = tricksInTier.filter(t => landedTricks[t.id]).length;
            levelProgressPct = tricksInTier.length > 0
                ? Math.round((landedInTier / tricksInTier.length) * 100)
                : 0;
        }

        if (currentLevelIdx === -1 || landedTrickIds.length < 10) focus = 'New to tricks';

        return {
            focus,
            currentLevel: currentLevelIdx >= 0 ? SKILL_LEVELS[currentLevelIdx].name : 'Unranked',
            levelProgressPct,
            totalLanded: landedTrickIds.length,
        };
    }, [landedTricks]);
};

const getFocusSubtitle = (
    userName: string | null,
    statsFocus: string
): string => {
    if (!userName) return statsFocus;

    const key = userName.toLowerCase();
    return key in easterEggNames ? easterEggNames[key] : statsFocus;
};

export const UserProfileScreen: React.FC<UserProfileScreenProps> = () => {
    type ProfileNav = NativeStackNavigationProp<ProfileStackParamList, 'UserProfileScreen'>;
    const navigation = useNavigation<ProfileNav>();
    type RootNav = NativeStackNavigationProp<RootStackParamList>;
    const rootNavigation = useNavigation<RootNav>();

    const { landedTricks } = useTrickProgress();
    const stats = useProfileStats(landedTricks);

    const progressAnim = useRef(new Animated.Value(0)).current;
    const numberAnim = useRef(new Animated.Value(0)).current;
    const [displayedNumber, setDisplayedNumber] = useState(0);
    const [selectedTrick, setSelectedTrick] = useState<Trick | null>(null);

    const { userName, setUserName } = useUserName();
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState('');

    // For double-tap detection
    const lastPressRef = useRef<number>(0);

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: stats.levelProgressPct,
            duration: 1200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
        Animated.timing(numberAnim, {
            toValue: stats.levelProgressPct,
            duration: 1200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, [stats.levelProgressPct]);

    useEffect(() => {
        if (isEditingName) return; // Don't update during editing to prevent re-renders
        const listenerId = numberAnim.addListener(({ value }) => setDisplayedNumber(Math.round(value)));
        return () => numberAnim.removeListener(listenerId);
    }, [isEditingName]);

    const suggestedTricks = TRICKS_DATA.filter(
        trick => !landedTricks[trick.id] && trick.prerequisites.every(pr => landedTricks[pr])
    ).sort((a, b) => a.difficulty - b.difficulty).slice(0, 3);

    const getLevelColor = (level: string): string => {
        const skill = SKILL_LEVELS.find(s => s.name === level);
        return skill ? skill.color : '#6B7280';
    };

    const handleInfo = (trick: Trick) => setSelectedTrick(trick);
    const handleProgressBarPress = () => {
        if (stats.currentLevel === "Unranked"){
            return;
        }
        rootNavigation.navigate('MainTabs', {
            screen: 'TrickTab',
            params: {
                screen: 'TrickListScreen',
                params: {
                    initialFilter: stats.currentLevel,
                    trigger: Date.now()
                },
            },
        } as any); // `as any` to keep TS calm unless you wire full nested types
    };

    const handleNamePress = () => {
        const now = Date.now();
        if (now - lastPressRef.current < 300) {
            // Double tap detected
            setEditedName(userName || '');
            setIsEditingName(true);
        }
        lastPressRef.current = now;
    };

    const handleNameSave = () => {
        const trimmed = editedName.trim();
        if (trimmed) {
            setUserName(trimmed);
            AsyncStorage.setItem('userName', trimmed);
        }
        setIsEditingName(false);
    };

    if (userName === '') return null;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.headerBg}>
                </View>

                <View style={styles.profileCard}>
                    <View style={{ alignItems: 'flex-start' }}>
                        {isEditingName ? (
                            <TextInput
                                style={[styles.userName, { borderBottomWidth: 1, borderColor: '#4ECDC4', paddingHorizontal: 4, minWidth: 300 }]}
                                value={editedName}
                                onChangeText={setEditedName}
                                autoFocus
                                onBlur={handleNameSave}
                                onSubmitEditing={handleNameSave}
                            />
                        ) : (
                            <TouchableOpacity activeOpacity={1} onPress={handleNamePress}>
                                <Text style={styles.userName}>{userName}</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text style={styles.focusSubtitle}>{getFocusSubtitle(userName, stats.focus)}</Text>
                    <View style={styles.divider} />

                    <View style={styles.levelSection}>
                        <Text style={styles.levelLabel}>CURRENT LEVEL</Text>
                        <Text style={[styles.levelTitle, { color: getLevelColor(stats.currentLevel) }]}>
                            {stats.currentLevel}
                        </Text>
                    </View>

                    <View style={styles.progressSection}>
                        <Text style={styles.levelLabel}>LEVEL PROGRESS</Text>
                        <TouchableOpacity onPress={handleProgressBarPress}>
                            <View style={styles.progressBarBgHorizontal}>
                                <Animated.View
                                    style={[
                                        styles.progressBarFillHorizontal,
                                        {
                                            width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
                                            backgroundColor: getLevelColor(stats.currentLevel),
                                        },
                                    ]}
                                >
                                    <Text style={styles.progressTextInside}>{displayedNumber}%</Text>
                                </Animated.View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.allLevelsContainer}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('AllLevelsProgressScreen')}
                            style={styles.allLevelsButton}
                            activeOpacity={0.6}
                        >
                            <Text style={styles.allLevelsText}>all levels progress</Text>
                            <Text style={styles.allLevelsArrow}>›</Text>
                        </TouchableOpacity>
                    </View>

                    <View>
                        <View style={{ marginBottom: 24 }}>
                            <Text style={[styles.levelLabel, { marginBottom: 12 }]}>Next Tricks to Master</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {suggestedTricks.map(trick => (
                                    <TrickCard key={trick.id} trick={trick} isLanded={true} onToggle={() => { }} onInfo={handleInfo} />
                                ))}
                            </ScrollView>
                        </View>
                        <View>
                            <TouchableOpacity
                                onPress={() =>
                                    rootNavigation.navigate('MainTabs', {
                                        screen: 'TrickTab',
                                        params: {
                                            screen: 'TrickListScreen',
                                            params: {
                                                initialFilter: 'Next Learns',
                                                trigger: Date.now()
                                            },
                                        },
                                    } as any)
                                }
                                style={styles.allLevelsButton}
                                activeOpacity={0.6}
                            >

                                <Text style={styles.allLevelsText}>All next Learns</Text>
                                <Text style={styles.allLevelsArrow}>›</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {selectedTrick && <TrickCardInfo trick={selectedTrick} onClose={() => setSelectedTrick(null)} />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F7F7' },
    scrollContent: { flexGrow: 1, paddingBottom: 40 },
    headerBg: { backgroundColor: '#4ECDC4' ,padding: 20 ,paddingTop: 78 , maxHeight: 80},
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    backIcon: { width: 24, height: 24, tintColor: 'white', resizeMode: 'contain' },
    profileCard: { marginHorizontal: 20, marginTop: -20, backgroundColor: 'white', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6 },
    userName: { fontSize: 32, fontWeight: 'bold', color: '#1F2937', marginBottom: 8, textAlign: 'left' },
    focusSubtitle: { fontSize: 18, fontWeight: '600', color: '#6B7280', marginBottom: 16, textAlign: 'left' },
    divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 },
    levelSection: { marginBottom: 24 },
    levelLabel: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 },
    levelTitle: { fontSize: 28, fontWeight: 'bold' },
    progressSection: { marginBottom: 20 },
    progressBarBgHorizontal: { width: '100%', height: 30, backgroundColor: '#F3F4F6', borderRadius: 8, overflow: 'hidden', justifyContent: 'center' },
    progressBarFillHorizontal: { height: '100%', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    progressTextInside: { fontSize: 14, fontWeight: 'bold', color: 'white' },
    allLevelsContainer: { marginBottom: 20 },
    allLevelsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, paddingHorizontal: 4 },
    allLevelsText: { fontSize: 12, fontWeight: '700', color: '#4ECDC4', textTransform: 'uppercase', letterSpacing: 0.6 },
    allLevelsArrow: { fontSize: 20, color: '#9CA3AF', fontWeight: '300' },
});