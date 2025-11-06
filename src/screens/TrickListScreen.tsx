import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, StatusBar, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrickCard } from '../components/TrickCard';
import { TrickCardInfo } from '../components/TrickCardInfo';
import { Trick } from '../types';
import { SearchBar } from '../components/SearchBar';
import { useTrickProgress } from '../hooks/useTrickProgress';
import { TRICKS_DATA } from '../data/tricks';
import { SKILL_LEVELS } from '../data/skillLevels';
import { FILTER_CONFIG } from '../data/filterConfigs';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type TrickListScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'TrickListScreen'
>;

type TrickListScreenRouteProp = RouteProp<RootStackParamList, 'TrickListScreen'>;

interface TrickRow {
    id: string;
    type: 'section-header' | 'trick-row';
    levelName?: string;
    tricks?: Trick[];
}

export const TrickListScreen: React.FC = () => {
    const { toggleTrick, isTrickLanded, landedTricks } = useTrickProgress();
    const navigation = useNavigation<TrickListScreenNavigationProp>();
    const route = useRoute<TrickListScreenRouteProp>();

    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [search, setSearch] = useState<string>('');
    const [modalTrick, setModalTrick] = useState<Trick | null>(null);

    // Apply initial filter from navigation params
    useEffect(() => {
        if (route.params?.initialFilter) {
            setActiveFilters([route.params.initialFilter]);
        }
    }, [route.params?.initialFilter]);

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

        // If no filters active and no search, show all
        if (activeFilters.length === 0 && !search) {
            return TRICKS_DATA;
        }

        // Apply multiple filters
        if (activeFilters.length > 0) {
            tricks = tricks.filter(trick => {
                // Check each active filter
                return activeFilters.every(filter => {
                    if (filter === 'All') {
                        return true;
                    } else if (filter === 'Landed') {
                        return isTrickLanded(trick.id);
                    } else if (filter === 'Next Learns') {
                        return suggestedTricks.some(st => st.id === trick.id);
                    } else if (SKILL_LEVELS.map(level => level.name).includes(filter)) {
                        const levelIdx = SKILL_LEVELS.findIndex(level => level.name === filter);
                        return (trick.difficulty ?? 0) === levelIdx;
                    } else {
                        // Type filter
                        return trick.types.includes(filter.toLowerCase());
                    }
                });
            });
        }

        // Apply search filter if present
        if (search && !predefinedFilters.includes(search)) {
            tricks = tricks.filter(trick =>
                trick.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        return tricks;
    }, [activeFilters, search, isTrickLanded, suggestedTricks, predefinedFilters]);

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

    const handleToggleTrick = useCallback((trickId: string) => {
        toggleTrick(trickId);
    }, [toggleTrick]);

    const renderItem = useCallback(({ item }: { item: TrickRow }) => {
        if (item.type === 'section-header') {
            return <Text style={styles.levelTitle}>{item.levelName}</Text>;
        }

        return (
            <View style={styles.trickRow}>
                {item.tricks?.map(trick => (
                    <View key={trick.id} style={styles.trickCol}>
                        <TrickCard
                            trick={trick}
                            isLanded={isTrickLanded(trick.id)}
                            onToggle={() => handleToggleTrick(trick.id)}
                            onInfo={handleInfo}
                        />
                    </View>
                ))}
            </View>
        );
    }, [isTrickLanded, handleToggleTrick, handleInfo]);

    const renderEmptyState = useCallback(() => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
                {activeFilters.length > 0
                    ? 'No tricks match the selected filters'
                    : 'No tricks found'}
            </Text>
            {activeFilters.length > 0 && (
                <TouchableOpacity
                    onPress={() => setActiveFilters([])}
                    style={styles.clearFiltersButton}
                >
                    <Text style={styles.clearFiltersText}>Clear filters</Text>
                </TouchableOpacity>
            )}
        </View>
    ), [activeFilters]);

    const keyExtractor = useCallback((item: TrickRow) => item.id, []);

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" hidden={true} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.menuButton}
                        accessibilityLabel="Menu"
                        onPress={() => navigation.navigate('UserProfileScreen')}
                    >
                        <Image
                            source={require('../../assets/user.png')}
                            style={styles.userIcon}
                        />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Trickadex</Text>
                    <TouchableOpacity
                        style={styles.menuButton}
                        accessibilityLabel="Feedback"
                        onPress={() => navigation.navigate('FeedbackScreen')}
                    >
                        <Image
                            source={require('../../assets/feedback.png')}
                            style={styles.userIcon}
                        />
                    </TouchableOpacity>
                    <View style={styles.menuButton} />
                </View>
            </View>

            {/* Search Bar with Multiple Filters */}
            <SearchBar
                filters={predefinedFilters}
                activeFilters={activeFilters}
                onToggleFilter={handleToggleFilter}
                onSearch={setSearch}
            />

            {/* Active Filters Summary */}
            {activeFilters.length > 0 && (
                <View style={styles.filterSummary}>
                    <Text style={styles.filterSummaryText}>
                        {filteredTricks.length} trick{filteredTricks.length !== 1 ? 's' : ''} found
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    menuButton: {
        marginRight: 10,
        padding: 4,
    },
    userIcon: {
        width: 28,
        height: 28,
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
        paddingTop: 36,
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
        paddingHorizontal: 5,
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