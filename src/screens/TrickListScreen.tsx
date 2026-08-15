import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, StatusBar, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TrickCard } from '../components/TrickCard';
import { TrickCardInfo } from '../components/TrickCardInfo';
import { Trick } from '../types';
import { SearchBar } from '../components/SearchBar';
import { useTrickProgress } from '../hooks/useTrickProgress';
import { useTrickFavorites } from '../hooks/useTrickFavorites';
import { TRICKS_DATA } from '../data/tricks';
import { SKILL_LEVELS } from '../data/skillLevels';
import { FILTER_CONFIG } from '../data/filterConfigs';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import type { TrickStackParamList } from '../navigation/MainTabsNavigator'
import { useUserName } from '../hooks/useUserDetails';
import { useLanguage, useLabels, useTrickText, trickMatchesSearch, findFilterByName } from '../i18n';
import { useCelebrations } from '../hooks/useCelebrations';
import { getCurrentLevelIndex, TRICKS_PER_LEVEL } from '../utils/progress';
import { UnlockToast } from '../components/celebrations/UnlockToast';
import { LevelUpOverlay } from '../components/celebrations/LevelUpOverlay';


type TrickListScreenNavigationProp = NativeStackNavigationProp<
    TrickStackParamList,
    'TrickListScreen'
>;

type TrickListScreenRouteProp = RouteProp<
    TrickStackParamList,
    'TrickListScreen'
>;
type RootNav = NativeStackNavigationProp<RootStackParamList>;

interface TrickRow {
    id: string;
    type: 'section-header' | 'trick-row';
    levelName?: string;
    levelIndex?: number;
    tricks?: Trick[];
}

export const TrickListScreen: React.FC = () => {
    const { t } = useLanguage();
    const { levelLabel } = useLabels();
    const { trickName } = useTrickText();
    const { toggleTrick, isTrickLanded, landedTricks } = useTrickProgress();
    const { landing, levelUp, celebrate, dismissLanding, dismissLevelUp } =
        useCelebrations(TRICKS_DATA);
    const { isTrickFavorite } = useTrickFavorites();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<TrickListScreenNavigationProp>();
    const rootNavigation = useNavigation<RootNav>();
    const route = useRoute<TrickListScreenRouteProp>();

    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [search, setSearch] = useState<string>('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [modalTrick, setModalTrick] = useState<Trick | null>(null);
    // Set only by a tap, so celebrations never fire when progress loads.
    const [justLandedId, setJustLandedId] = useState<string | null>(null);
    const userName = useUserName().userName;

    // Apply initial filter from navigation params
    useEffect(() => {
        if (route.params?.initialFilter) {
            setActiveFilters([route.params.initialFilter]);
            setSearch('');
            setSearchOpen(false);
        }
    }, [route.params?.initialFilter, route.params?.trigger]);

    // Memoize suggested tricks
    const suggestedTricks = useMemo(() =>
        TRICKS_DATA.filter(
            trick => !landedTricks[trick.id] && trick.prerequisites.every(pr => landedTricks[pr])
        ),
        [landedTricks]
    );

    const predefinedFilters = useMemo(() =>
        FILTER_CONFIG.map(f => f.name),
        []
    );

    // Toggle filter on/off
    const handleToggleFilter = useCallback((filter: string) => {
        setActiveFilters(prev => {
            if (prev.includes(filter)) {
                return prev.filter(f => f !== filter);
            } else {
                return [...prev, filter];
            }
        });
    }, []);

    // Filter tricks based on search and active filters
    const filteredTricks = useMemo(() => {
        let tricks = TRICKS_DATA;
        let filtersToApply = [...activeFilters];

        // Check if search matches a valid filter name from FILTER_CONFIG
        if (search && !activeFilters.includes(search)) {
            const matchedFilter = findFilterByName(search);

            if (matchedFilter) {
                filtersToApply.push(matchedFilter);
            }
        }

        // If no filters active and no search, show all
        if (filtersToApply.length === 0 && !search) {
            return TRICKS_DATA;
        }

        // Apply multiple filters
        if (filtersToApply.length > 0) {
            tricks = tricks.filter(trick => {
                return filtersToApply.every(filter => {
                    if (filter === 'Landed') {
                        return isTrickLanded(trick.id);
                    } else if (filter === 'Next Learns') {
                        return suggestedTricks.some(st => st.id === trick.id);
                    } else if (filter === 'Favorites') {
                        return isTrickFavorite(trick.id);
                    } else if (SKILL_LEVELS.map(level => level.name).includes(filter)) {
                        const levelIdx = SKILL_LEVELS.findIndex(level => level.name === filter);
                        return (trick.difficulty ?? 0) === levelIdx;
                    } else {
                        // Type filter (compare case-insensitively)
                        return trick.types.some(type =>
                            type.toLowerCase() === filter.toLowerCase()
                        );
                    }
                });
            });
        }

        // Apply text search filter for tricks that don't match filter names
        if (search && !findFilterByName(search)) {
            tricks = tricks.filter(trick => trickMatchesSearch(trick, search));
        }

        return tricks;
    }, [activeFilters, search, isTrickLanded, suggestedTricks, TRICKS_DATA, SKILL_LEVELS, isTrickFavorite]);

    // Group tricks by difficulty and create flat list data
    const flatListData: TrickRow[] = useMemo(() => {
        const tricksByLevel: { [level: number]: Trick[] } = {};

        filteredTricks.forEach(trick => {
            const level = trick.difficulty ?? 0;
            if (!tricksByLevel[level]) tricksByLevel[level] = [];
            tricksByLevel[level].push(trick);
        });

        const data: TrickRow[] = [];

        SKILL_LEVELS.map(level => level.name).forEach((levelName, idx) => {
            const tricks = tricksByLevel[idx];
            if (!tricks || tricks.length === 0) return;

            // Add section header
            data.push({
                id: `header-${idx}`,
                type: 'section-header',
                levelName,
                levelIndex: idx,
            });

            // Add trick rows (2 per row)
            for (let i = 0; i < tricks.length; i += 2) {
                data.push({
                    id: `row-${idx}-${i}`,
                    type: 'trick-row',
                    tricks: tricks.slice(i, i + 2),
                });
            }
        });

        return data;
    }, [filteredTricks]);

    const handleInfo = useCallback((trick: Trick) => {
        setModalTrick(trick);
    }, []);

    const handleCloseModal = useCallback(() => {
        setModalTrick(null);
    }, []);

    const applyToggle = useCallback((trickId: string) => {
        const { before, after } = toggleTrick(trickId);
        celebrate(trickId, before, after);

        if (after[trickId] && !before[trickId]) {
            setJustLandedId(trickId);
        }
    }, [toggleTrick, celebrate]);

    // Clear the flag once the burst has played, so re-renders do not replay it.
    useEffect(() => {
        if (!justLandedId) return;
        const timer = setTimeout(() => setJustLandedId(null), 1200);
        return () => clearTimeout(timer);
    }, [justLandedId]);

    const handleToggleTrick = useCallback((trickId: string) => {
        // Un-landing can re-lock dependent tricks, so confirm it first.
        if (!isTrickLanded(trickId)) {
            applyToggle(trickId);
            return;
        }

        const trick = TRICKS_DATA.find(item => item.id === trickId);
        Alert.alert(
            t('trickList.unlearnTitle'),
            t('trickList.unlearnMessage', {
                trick: trick ? trickName(trick) : '',
            }),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('trickList.unlearnConfirm'),
                    style: 'destructive',
                    onPress: () => applyToggle(trickId),
                },
            ]
        );
    }, [applyToggle, isTrickLanded, t, trickName]);

    const renderItem = useCallback(({ item }: { item: TrickRow }) => {
        if (item.type === 'section-header') {
            return (
                <Text style={styles.levelTitle}>
                    {item.levelIndex !== undefined ? levelLabel(item.levelIndex) : item.levelName}
                </Text>
            );
        }

        return (
            <View style={styles.trickRow}>
                {item.tricks?.map(trick => (
                    <View key={trick.id} style={styles.trickCol}>
                        <TrickCard
                            trick={trick}
                            isLanded={isTrickLanded(trick.id)}
                            isLocked={!trick.prerequisites.every(id => landedTricks[id])}
                            justLanded={trick.id === justLandedId}
                            onToggle={handleToggleTrick}
                            onInfo={handleInfo}
                        />
                    </View>
                ))}
            </View>
        );
    }, [isTrickLanded, handleToggleTrick, handleInfo, levelLabel, landedTricks, justLandedId]);

    const renderEmptyState = useCallback(() => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
                {activeFilters.length > 0
                    ? t('trickList.noMatch')
                    : t('trickList.empty')}
            </Text>
            {activeFilters.length > 0 && (
                <TouchableOpacity
                    onPress={() => setActiveFilters([])}
                    style={styles.clearFiltersButton}
                >
                    <Text style={styles.clearFiltersText}>{t('trickList.clearFilters')}</Text>
                </TouchableOpacity>
            )}
        </View>
    ), [activeFilters, t]);

    const keyExtractor = useCallback((item: TrickRow) => item.id, []);

    // How many more tricks in the next tier before the rider levels up.
    const nextLevelHint = useMemo(() => {
        const current = getCurrentLevelIndex(landedTricks, TRICKS_DATA);
        const target = current + 1;
        if (target > 7) return null;

        const landedInTarget = TRICKS_DATA.filter(
            trick => trick.difficulty === target && landedTricks[trick.id]
        ).length;

        const remaining = TRICKS_PER_LEVEL - landedInTarget;
        if (remaining <= 0) return null;

        return { remaining, level: levelLabel(target) };
    }, [landedTricks, levelLabel]);

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" hidden={true} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <View style={styles.headerRow}>
                    <Text style={styles.headerTitle}>{t('trickList.title')}</Text>
                    <TouchableOpacity
                        style={styles.menuButton}
                        accessibilityLabel={t('trickList.feedback')}
                        onPress={() => {

                            rootNavigation.navigate('FeedbackScreen');
                        }}
                    >
                        <Image
                            source={require('../../assets/edit.png')}
                            style={styles.userIcon}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {nextLevelHint && (
                <View style={styles.levelHint}>
                    <Text style={styles.levelHintText}>
                        {t('trickList.toNextLevel', {
                            count: nextLevelHint.remaining,
                            level: nextLevelHint.level,
                        })}
                    </Text>
                </View>
            )}

            {/* Search Bar with Multiple Filters */}
            <SearchBar
                filters={predefinedFilters}
                activeFilters={activeFilters}
                onToggleFilter={handleToggleFilter}
                onSearch={setSearch}
                searchOpen={searchOpen}
                setSearchOpen={setSearchOpen}
            />

            {/* Active Filters Summary */}
            {activeFilters.length > 0 && (
                <View style={styles.filterSummary}>
                    <Text style={styles.filterSummaryText}>
                        {t('trickList.found', { count: filteredTricks.length })}
                    </Text>
                </View>
            )}

            {/* Trick List using FlatList */}
            <FlatList
                data={flatListData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.flatListContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyState}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
            />

            {/* Modal */}
            {modalTrick && (
                <View style={styles.modalOverlay}>
                    <TrickCardInfo trick={modalTrick} onClose={handleCloseModal} />
                </View>
            )}

            {/* Celebrations */}
            {landing && !modalTrick && (
                <UnlockToast
                    trick={landing.trick}
                    unlocked={landing.unlocked}
                    onDismiss={dismissLanding}
                    onSelectTrick={(trick) => {
                        dismissLanding();
                        setModalTrick(trick);
                    }}
                />
            )}

            {levelUp !== null && (
                <LevelUpOverlay levelIndex={levelUp} onDismiss={dismissLevelUp} />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    levelHint: {
        backgroundColor: '#F1FBFA',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#DCF3F1',
    },
    levelHintText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#3AA9A1',
        textAlign: 'center',
    },
    menuButton: {
        marginRight: 10,
        padding: 4,
        position: 'absolute'
    },
    userIcon: {
        width: 22,
        height: 22,
        resizeMode: 'contain',
        tintColor: 'white',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },
    header: {
        backgroundColor: '#4ECDC4',
        padding: 20,
        minHeight: 80,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        flex: 1,
    },
    filterSummary: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    filterSummaryText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    flatListContent: {
        paddingHorizontal: 10,
        paddingTop: 15,
        paddingBottom: 30,
    },
    levelTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#4ECDC4',
        marginBottom: 8,
        marginLeft: 4,
        marginTop: 10,
    },
    trickRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 10,
    },
    trickCol: {
        flex: 1,
        maxWidth: '50%',
        paddingHorizontal: 0,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyStateText: {
        fontSize: 18,
        color: '#999',
        fontWeight: '500',
        marginBottom: 16,
    },
    clearFiltersButton: {
        backgroundColor: '#4ECDC4',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    clearFiltersText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
    },
});