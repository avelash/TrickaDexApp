import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    BackHandler,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { TRICKS_DATA } from '../data/tricks';
import { SKILL_LEVELS } from '../data/skillLevels';
import { Trick, TrickProgress } from '../types';
import { TrickCard } from '../components/TrickCard';
import { useTrickProgress } from '../hooks/useTrickProgress';
import { useUserName } from '../hooks/useUserDetails';
import { useOnboarding } from '../hooks/useOnboarding';
import { getCurrentLevelIndex } from '../utils/progress';
import {
    LANGUAGE_LABELS,
    Language,
    useLabels,
    useLanguage,
    useTrickText,
} from '../i18n';

/**
 * NOTE: nothing in this screen may import useCelebrations, UnlockToast or
 * LevelUpOverlay, and TrickCard must never be given `justLanded`. Marking what
 * you already land is data entry, not an achievement — firing a pop, particle
 * burst and haptic per trick is exactly what made the old flow tedious.
 */

type Step =
    | { kind: 'profile' }
    | { kind: 'intro'; page: 0 | 1 }
    | { kind: 'level'; difficulty: number }
    | { kind: 'summary' };

type Nav = NativeStackNavigationProp<RootStackParamList, 'OnboardingScreen'>;
type ScreenRoute = RouteProp<RootStackParamList, 'OnboardingScreen'>;

export const OnboardingScreen: React.FC = () => {
    const navigation = useNavigation<Nav>();
    const route = useRoute<ScreenRoute>();
    const insets = useSafeAreaInsets();
    const tricksOnly = route.params?.tricksOnly ?? false;

    const { t, language, setLanguage } = useLanguage();
    const { levelLabel } = useLabels();
    const { trickName } = useTrickText();
    const { landedTricks, loaded, applyProgress } = useTrickProgress();
    const { userName, setUserName } = useUserName();
    const { complete } = useOnboarding();

    const [stepIndex, setStepIndex] = useState(0);
    const [draft, setDraft] = useState<TrickProgress>({});
    const [name, setName] = useState('');
    const [finishing, setFinishing] = useState(false);
    const seeded = useRef(false);
    const listRef = useRef<FlatList>(null);

    // Seed from stored progress once it has loaded. Seeding from {} early would
    // let a re-run commit `false` over everything the rider had already landed.
    useEffect(() => {
        if (!loaded || seeded.current) return;
        setDraft({ ...landedTricks });
        seeded.current = true;
    }, [loaded, landedTricks]);

    useEffect(() => {
        if (userName) setName(userName);
    }, [userName]);

    // Only levels that actually have tricks, so empty tiers are never shown.
    const levelSteps = useMemo(
        () =>
            SKILL_LEVELS.filter(level =>
                TRICKS_DATA.some(trick => (trick.difficulty ?? 0) === level.number)
            ).map(level => ({ kind: 'level' as const, difficulty: level.number })),
        []
    );

    const steps = useMemo<Step[]>(
        () =>
            tricksOnly
                ? [...levelSteps, { kind: 'summary' }]
                : [
                      { kind: 'profile' },
                      { kind: 'intro', page: 0 },
                      { kind: 'intro', page: 1 },
                      ...levelSteps,
                      { kind: 'summary' },
                  ],
        [levelSteps, tricksOnly]
    );

    const step = steps[Math.min(stepIndex, steps.length - 1)];
    const isLast = stepIndex >= steps.length - 1;

    useEffect(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, [stepIndex]);

    // Hardware back walks the steps instead of leaving the app.
    useFocusEffect(
        useCallback(() => {
            const onBack = () => {
                if (stepIndex > 0) {
                    setStepIndex(index => index - 1);
                    return true;
                }
                return false;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBack);
            return () => subscription.remove();
        }, [stepIndex])
    );

    const finish = useCallback(async () => {
        if (finishing) return;
        setFinishing(true);

        // Awaited before navigating: every screen re-reads progress on focus,
        // so an unflushed write would show pre-onboarding data.
        await applyProgress(draft);
        await complete();
        navigation.replace('MainTabs');
    }, [finishing, applyProgress, draft, complete, navigation]);

    const confirmAndFinish = useCallback(() => {
        const removed = Object.keys(landedTricks).filter(
            id => landedTricks[id] && !draft[id]
        ).length;

        if (removed === 0) {
            finish();
            return;
        }

        Alert.alert(
            t('onboarding.summaryTitle'),
            t('onboarding.unlearnWarning', { count: removed }),
            [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('onboarding.finish'), style: 'destructive', onPress: finish },
            ]
        );
    }, [landedTricks, draft, finish, t]);

    const goNext = useCallback(() => {
        if (isLast) {
            confirmAndFinish();
            return;
        }

        // Language switching can reload the app (RTL), so it is applied on the
        // way out of the profile step, with the name already persisted.
        if (step.kind === 'profile') {
            if (name.trim()) setUserName(name.trim());
        }

        setStepIndex(index => index + 1);
    }, [isLast, confirmAndFinish, step, name, setUserName]);

    const selectedCount = useMemo(
        () => Object.values(draft).filter(Boolean).length,
        [draft]
    );

    if (!loaded) return null;

    const renderProfile = () => (
        <View style={styles.centeredStep}>
            <Text style={styles.stepTitle}>{t('onboarding.languageTitle')}</Text>
            <View style={styles.languageRow}>
                {(Object.keys(LANGUAGE_LABELS) as Language[]).map(code => (
                    <TouchableOpacity
                        key={code}
                        style={[
                            styles.languageButton,
                            language === code && styles.languageButtonActive,
                        ]}
                        onPress={() => setLanguage(code)}
                    >
                        <Text
                            style={[
                                styles.languageText,
                                language === code && styles.languageTextActive,
                            ]}
                        >
                            {LANGUAGE_LABELS[code]}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={[styles.stepTitle, { marginTop: 36 }]}>
                {t('onboarding.nameTitle')}
            </Text>
            <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                placeholder={t('onboarding.namePlaceholder')}
                placeholderTextColor="#9CA3AF"
                maxLength={30}
            />
        </View>
    );

    const renderIntro = (page: 0 | 1) => (
        <View style={styles.centeredStep}>
            <Text style={styles.introTitle}>
                {t(page === 0 ? 'onboarding.intro1Title' : 'onboarding.intro2Title')}
            </Text>
            <Text style={styles.introBody}>
                {t(page === 0 ? 'onboarding.intro1Body' : 'onboarding.intro2Body')}
            </Text>
        </View>
    );

    const renderLevel = (difficulty: number) => {
        const levelTricks = TRICKS_DATA.filter(
            trick => (trick.difficulty ?? 0) === difficulty
        );
        const selected = levelTricks.filter(trick => draft[trick.id]).length;
        const allSelected = selected === levelTricks.length;

        const toggleAll = () => {
            setDraft(prev => ({
                ...prev,
                ...Object.fromEntries(
                    levelTricks.map(trick => [trick.id, !allSelected])
                ),
            }));
        };

        const rows: Trick[][] = [];
        for (let i = 0; i < levelTricks.length; i += 2) {
            rows.push(levelTricks.slice(i, i + 2));
        }

        return (
            <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{t('onboarding.tricksTitle')}</Text>
                <Text style={styles.stepSubtitle}>{t('onboarding.tricksSubtitle')}</Text>

                <View style={styles.levelHeader}>
                    <Text style={[styles.levelName, { color: SKILL_LEVELS[difficulty].color }]}>
                        {levelLabel(difficulty)}
                    </Text>
                    <Text style={styles.levelCount}>
                        {t('onboarding.selectedCount', {
                            count: selected,
                            total: levelTricks.length,
                        })}
                    </Text>
                </View>

                <TouchableOpacity
                    style={[
                        styles.bulkButton,
                        allSelected && styles.bulkButtonActive,
                    ]}
                    onPress={toggleAll}
                    activeOpacity={0.8}
                >
                    <Text
                        style={[
                            styles.bulkText,
                            allSelected && styles.bulkTextActive,
                        ]}
                    >
                        {t(allSelected ? 'onboarding.clearAll' : 'onboarding.selectAll')}
                    </Text>
                </TouchableOpacity>

                <FlatList
                    ref={listRef}
                    data={rows}
                    keyExtractor={(_, index) => `row-${difficulty}-${index}`}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }: { item: Trick[] }) => (
                        <View style={styles.trickRow}>
                            {item.map((trick: Trick) => (
                                <View key={trick.id} style={styles.trickCol}>
                                    {/* No justLanded: selection must stay silent. */}
                                    <TrickCard
                                        trick={trick}
                                        isLanded={!!draft[trick.id]}
                                        onToggle={id =>
                                            setDraft(prev => ({ ...prev, [id]: !prev[id] }))
                                        }
                                        onInfo={() => { }}
                                    />
                                </View>
                            ))}
                        </View>
                    )}
                />
            </View>
        );
    };

    const renderSummary = () => {
        const levelIndex = getCurrentLevelIndex(draft, TRICKS_DATA);
        return (
            <View style={styles.centeredStep}>
                <Text style={styles.introTitle}>{t('onboarding.summaryTitle')}</Text>
                <Text style={styles.introBody}>
                    {selectedCount > 0
                        ? t('onboarding.summaryBody', {
                              count: selectedCount,
                              level:
                                  levelIndex >= 0
                                      ? levelLabel(levelIndex)
                                      : t('profile.unranked'),
                          })
                        : t('onboarding.summaryEmpty')}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <View style={[styles.body, { paddingTop: insets.top + 20 }]}>
                {step.kind === 'profile' && renderProfile()}
                {step.kind === 'intro' && renderIntro(step.page)}
                {step.kind === 'level' && renderLevel(step.difficulty)}
                {step.kind === 'summary' && renderSummary()}
            </View>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
                <View style={styles.footerRow}>
                    {stepIndex > 0 ? (
                        <TouchableOpacity onPress={() => setStepIndex(i => i - 1)}>
                            <Text style={styles.secondaryAction}>{t('onboarding.back')}</Text>
                        </TouchableOpacity>
                    ) : (
                        <View />
                    )}

                    <Text style={styles.stepCounter}>
                        {t('onboarding.stepOf', {
                            current: stepIndex + 1,
                            total: steps.length,
                        })}
                    </Text>

                    {!isLast ? (
                        <TouchableOpacity onPress={confirmAndFinish}>
                            <Text style={styles.secondaryAction}>{t('onboarding.skip')}</Text>
                        </TouchableOpacity>
                    ) : (
                        <View />
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.primaryButton, finishing && { opacity: 0.6 }]}
                    onPress={goNext}
                    disabled={finishing}
                    activeOpacity={0.85}
                >
                    <Text style={styles.primaryText}>
                        {isLast ? t('onboarding.start') : t('onboarding.next')}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F7F7' },
    body: { flex: 1, paddingHorizontal: 18 },
    centeredStep: { flex: 1, justifyContent: 'center' },
    stepTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 6,
    },
    stepSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 16 },
    introTitle: {
        fontSize: 30,
        fontWeight: '900',
        color: '#1F2937',
        marginBottom: 14,
    },
    introBody: { fontSize: 17, color: '#4B5563', lineHeight: 25 },
    languageRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
    languageButton: {
        paddingVertical: 12,
        paddingHorizontal: 26,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: '#FFF',
    },
    languageButtonActive: { backgroundColor: '#4ECDC4', borderColor: '#4ECDC4' },
    languageText: { fontSize: 16, fontWeight: '700', color: '#6B7280' },
    languageTextActive: { color: '#FFF' },
    nameInput: {
        marginTop: 14,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 17,
        backgroundColor: '#FFF',
        color: '#1F2937',
    },
    levelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    levelName: { fontSize: 20, fontWeight: '800' },
    levelCount: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
    bulkButton: {
        marginTop: 10,
        marginBottom: 12,
        paddingVertical: 11,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#4ECDC4',
        alignItems: 'center',
    },
    bulkButtonActive: { backgroundColor: '#4ECDC4' },
    bulkText: { fontSize: 15, fontWeight: '800', color: '#4ECDC4' },
    bulkTextActive: { color: '#FFF' },
    trickRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
    trickCol: { flex: 1, alignItems: 'center' },
    footer: {
        paddingHorizontal: 18,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: '#FFF',
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    secondaryAction: { fontSize: 15, fontWeight: '700', color: '#9CA3AF' },
    stepCounter: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
    primaryButton: {
        backgroundColor: '#4ECDC4',
        paddingVertical: 15,
        borderRadius: 16,
        alignItems: 'center',
    },
    primaryText: { color: '#FFF', fontSize: 17, fontWeight: '800' },
});
