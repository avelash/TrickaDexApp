import React, { useState, useMemo, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SearchBar } from '../components/SearchBar';
import { DraggableTrickCard } from '../components/DraggableTrickCard';
import { ComboDropZone } from '../components/ComboDropZone';
import { useTrickProgress } from '../hooks/useTrickProgress';
import { TRICKS_DATA } from '../data/tricks';
import { SKILL_LEVELS } from '../data/skillLevels';
import { FILTER_CONFIG } from '../data/filterConfigs';
import { Trick } from '../types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type ComboBuilderScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'ComboBuilderScreen'
>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ComboBuilderScreen: React.FC = () => {
    const { isTrickLanded } = useTrickProgress();
    const navigation = useNavigation<ComboBuilderScreenNavigationProp>();

    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [search, setSearch] = useState<string>('');
    const [comboTricks, setComboTricks] = useState<Trick[]>([]);
    const [dropZoneLayout, setDropZoneLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

    // Get only landed tricks
    const landedTricks = useMemo(
        () => TRICKS_DATA.filter(trick => isTrickLanded(trick.id)),
        [isTrickLanded]
    );

    const predefinedFilters = useMemo(
        () => FILTER_CONFIG.filter(f => f.name !== 'Landed' && f.name !== 'All')
            .map(f => f.name),
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
        let tricks = landedTricks;

        if (activeFilters.length > 0) {
            tricks = tricks.filter(trick => {
                return activeFilters.every(filter => {
                    if (SKILL_LEVELS.map(level => level.name).includes(filter)) {
                        const levelIdx = SKILL_LEVELS.findIndex(level => level.name === filter);
                        return (trick.difficulty ?? 0) === levelIdx;
                    } else {
                        // Type filter
                        return trick.types.includes(filter.toLowerCase());
                    }
                });
            });
        }

        // Apply search filter
        if (search && !predefinedFilters.includes(search)) {
            tricks = tricks.filter(trick =>
                trick.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        return tricks;
    }, [activeFilters, search, landedTricks, predefinedFilters]);

    // Handle trick drop
    const handleTrickDrop = useCallback((trick: Trick, position: number) => {
        setComboTricks(prev => {
            const newCombo = [...prev];
            newCombo.splice(position, 0, trick);
            return newCombo;
        });
    }, []);

    // Handle trick removal from combo
    const handleRemoveTrick = useCallback((index: number) => {
        setComboTricks(prev => prev.filter((_, i) => i !== index));
    }, []);

    // Handle trick reorder within combo
    const handleReorderTrick = useCallback((fromIndex: number, toIndex: number) => {
        setComboTricks(prev => {
            const newCombo = [...prev];
            const [removed] = newCombo.splice(fromIndex, 1);
            newCombo.splice(toIndex, 0, removed);
            return newCombo;
        });
    }, []);

    // Clear combo
    const handleClearCombo = useCallback(() => {
        setComboTricks([]);
    }, []);

    // Generate combo text
    const comboText = useMemo(() => {
        if (comboTricks.length === 0) return '';
        return comboTricks.map(t => t.name).join(' -> ');
    }, [comboTricks]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
                <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" hidden={true} />

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Image
                                source={require('../../assets/return.png')}
                                style={styles.backIcon}
                            />
                        </TouchableOpacity>

                        <Text style={styles.headerTitle}>Combo Builder</Text>

                        <View style={styles.backButton} />
                    </View>
                </View>

                {/* Search Bar */}
                <SearchBar
                    filters={predefinedFilters}
                    activeFilters={activeFilters}
                    onToggleFilter={handleToggleFilter}
                    onSearch={setSearch}
                />

                {/* Filter Summary */}
                {activeFilters.length > 0 && (
                    <View style={styles.filterSummary}>
                        <Text style={styles.filterSummaryText}>
                            {filteredTricks.length} trick{filteredTricks.length !== 1 ? 's' : ''} available
                        </Text>
                    </View>
                )}

                {/* Horizontal Scrollable Trick List */}
                <View style={styles.trickListContainer}>
                    <Text style={styles.sectionTitle}>Your Landed Tricks</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={[styles.horizontalScrollContent, { overflow: 'visible' }]}
                        style={{ overflow: 'visible' }}
                    >
                        {filteredTricks.length > 0 ? (
                            filteredTricks.map(trick => (
                                <DraggableTrickCard
                                    key={trick.id}
                                    trick={trick}
                                    onDrop={handleTrickDrop}
                                    dropZoneLayout={dropZoneLayout} 
                                    comboTricks={comboTricks} 
                                />
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>
                                    {activeFilters.length > 0
                                        ? 'No tricks match the selected filters'
                                        : 'No landed tricks yet'}
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </View>

                {/* Drop Zone */}
                <View style={styles.dropZoneContainer}>
                    <View style={styles.dropZoneHeader}>
                        <Text style={styles.sectionTitle}>Build Your Combo</Text>
                        {comboTricks.length > 0 && (
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={handleClearCombo}
                            >
                                <Text style={styles.clearButtonText}>Clear</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <ComboDropZone
                        tricks={comboTricks}
                        onRemoveTrick={handleRemoveTrick}
                        onReorderTrick={handleReorderTrick}
                        onLayout={setDropZoneLayout} 
                    />
                </View>

                {/* Combo Text Display */}
                <View style={styles.comboTextContainer}>
                    <Text style={styles.comboTextLabel}>Combo:</Text>
                    <ScrollView
                        style={styles.comboTextScroll}
                        showsVerticalScrollIndicator={false}
                    >
                        {comboText ? (
                            <Text style={styles.comboText}>{comboText}</Text>
                        ) : (
                            <Text style={styles.comboTextEmpty}>
                                Drag tricks to build your combo
                            </Text>
                        )}
                    </ScrollView>
                </View>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },
    header: {
        backgroundColor: '#4ECDC4',
        padding: 20,
        paddingTop: 36,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 4,
        width: 30,
    },
    backIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
        tintColor: 'white',
    },
    headerTitle: {
        fontSize: 28,
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
    trickListContainer: {
        backgroundColor: 'white',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginLeft: 15,
        marginBottom: 10,
    },
    horizontalScrollContent: {
        paddingHorizontal: 10,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
        width: SCREEN_WIDTH - 40,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#999',
        fontWeight: '500',
        textAlign: 'center',
    },
    dropZoneContainer: {
        flex: 1,
        paddingHorizontal: 15,
        paddingTop: 15,
    },
    dropZoneHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    clearButton: {
        backgroundColor: '#FF5252',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 15,
    },
    clearButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    comboTextContainer: {
        backgroundColor: 'white',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        maxHeight: 120,
    },
    comboTextLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 8,
    },
    comboTextScroll: {
        maxHeight: 70,
    },
    comboText: {
        fontSize: 15,
        color: '#4ECDC4',
        fontWeight: '600',
        lineHeight: 22,
    },
    comboTextEmpty: {
        fontSize: 15,
        color: '#BDC3C7',
        fontStyle: 'italic',
    },
});