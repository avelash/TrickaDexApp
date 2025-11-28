import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    Image,
    Dimensions,
    Animated,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Clipboard from 'expo-clipboard';
import { SearchBar } from '../components/SearchBar';
import { DraggableTrickCard } from '../components/DraggableTrickCard';
import { ComboDropZone } from '../components/ComboDropZone';
import { DragOverlay } from '../components/DragOverlay';
import { PreferencesModal, PreferencesState } from '../components/PreferencesModal';
import { useTrickProgress } from '../hooks/useTrickProgress';
import { TRICKS_DATA } from '../data/tricks';
import { SKILL_LEVELS } from '../data/skillLevels';
import { FILTER_CONFIG } from '../data/filterConfigs';
import { Trick } from '../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ComboStackParamList } from '../navigation/MainTabsNavigator'
import { usePreferences } from '../hooks/usePreferences';

type ComboBuilderScreenNavigationProp = NativeStackNavigationProp<
    ComboStackParamList,
    'ComboBuilderScreen'
>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ComboBuilderScreen: React.FC = () => {
    const { isTrickLanded } = useTrickProgress();
    const navigation = useNavigation<ComboBuilderScreenNavigationProp>();

    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [search, setSearch] = useState<string>('');
    const [comboTricks, setComboTricks] = useState<Trick[]>([]);
    const [preferencesModalVisible, setPreferencesModalVisible] = useState(false);
    const { preferences, updatePreferences } = usePreferences();

    // Drag and drop states
    const [dropZoneLayout, setDropZoneLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const [draggedTrick, setDraggedTrick] = useState<Trick | null>(null);
    const [dragStartPosition, setDragStartPosition] = useState<{ x: number; y: number } | null>(null);
    const [isOverDropZone, setIsOverDropZone] = useState(false);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const [scrollOffset, setScrollOffset] = useState(0);
    const dragTranslateX = useRef(new Animated.Value(0)).current;
    const dragTranslateY = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef<ScrollView | null>(null);
    const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);

    const startAutoScroll = useCallback((direction: 'left' | 'right') => {
        if (!autoScrollTimer.current && scrollViewRef.current) {
            const scrollAmount = direction === 'right' ? 20 : -20;

            autoScrollTimer.current = setInterval(() => {
                const scrollView = scrollViewRef.current;
                if (scrollView) {
                    setScrollOffset(prev => {
                        const newOffset = Math.max(0, prev + scrollAmount);
                        scrollView.scrollTo({
                            x: newOffset,
                            animated: false
                        });
                        return newOffset;
                    });
                }
            }, 50);
        }
    }, []);

    const stopAutoScroll = useCallback(() => {
        if (autoScrollTimer.current) {
            clearInterval(autoScrollTimer.current);
            autoScrollTimer.current = null;
        }
    }, []);

    // Get only landed tricks
    const preferredTricks = useMemo(
        () => {
            let tricks = TRICKS_DATA;

            // Filter by landed status if preference is enabled
            if (preferences.onlyLandedTricks) {
                tricks = tricks.filter(trick => isTrickLanded(trick.id));
            }

            // Filter by difficulty level if preference is set
            if (preferences.minLevel !== undefined && preferences.minLevel !== null) {
                tricks = tricks.filter(trick =>
                    (trick.difficulty ?? 0) >= preferences.minLevel
                );
            }

            if (preferences.maxLevel !== undefined && preferences.maxLevel !== null) {
                tricks = tricks.filter(trick =>
                    (trick.difficulty ?? 0) <= preferences.maxLevel
                );
            }

            return tricks;
        },
        [isTrickLanded, preferences.onlyLandedTricks, preferences.minLevel, preferences.maxLevel]
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
            let tricks = preferredTricks;
            let filtersToApply = [...activeFilters];
    
            // Check if search matches a valid filter name from FILTER_CONFIG
            if (search && !activeFilters.includes(search)) {
                const matchedFilter = FILTER_CONFIG.find(
                    filter => filter.name.toLowerCase() === search.toLowerCase()
                );
    
                if (matchedFilter) {
                    filtersToApply.push(matchedFilter.name);
                }
            }
    
            // If no filters active and no search, show all
            if (filtersToApply.length === 0 && !search) {
                return tricks;
            }
    
            // Apply multiple filters
            if (filtersToApply.length > 0) {
                tricks = tricks.filter(trick => {
                    return filtersToApply.every(filter => {
                        if (filter === 'Landed') {
                            return isTrickLanded(trick.id);
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
            if (search && !FILTER_CONFIG.some(f => f.name.toLowerCase() === search.toLowerCase())) {
                tricks = tricks.filter(trick =>
                    trick.name.toLowerCase().includes(search.toLowerCase())
                );
            }
    
            return tricks;
        }, [activeFilters, search, isTrickLanded, TRICKS_DATA, SKILL_LEVELS]);
    // Drag handlers
    const handleDragStart = useCallback((trick: Trick, layout: { x: number; y: number; width: number; height: number }) => {
        setDraggedTrick(trick);
        setDragStartPosition({ x: layout.x, y: layout.y });
        dragTranslateX.setValue(0);
        dragTranslateY.setValue(0);
    }, []);

    const handleDragMove = useCallback((translateX: number, translateY: number) => {
        dragTranslateX.setValue(translateX);
        dragTranslateY.setValue(translateY);

        if (dragStartPosition && dropZoneLayout) {
            const currentX = dragStartPosition.x + translateX;
            const currentY = dragStartPosition.y + translateY;

            // Check if over drop zone
            const isOver = currentX >= dropZoneLayout.x &&
                currentX <= dropZoneLayout.x + dropZoneLayout.width &&
                currentY >= dropZoneLayout.y &&
                currentY <= dropZoneLayout.y + dropZoneLayout.height;

            setIsOverDropZone(isOver);

            if (isOver) {
                // Calculate relative X position within drop zone
                const relativeX = currentX - dropZoneLayout.x;

                // Check if we're near the edges for auto-scroll
                const scrollZoneSize = 60; // pixels from edge that triggers scroll

                if (relativeX < scrollZoneSize && relativeX >= 0) {
                    // Near left edge, scroll left
                    startAutoScroll('left');
                } else if (relativeX > dropZoneLayout.width - scrollZoneSize && relativeX <= dropZoneLayout.width) {
                    // Near right edge, scroll right
                    startAutoScroll('right');
                } else {
                    stopAutoScroll();
                }

                // Calculate hover index based on X position within drop zone
                // Account for scroll offset and use midpoint logic
                const CARD_WIDTH = 130; // card width + spacing (120 + 10 spacing)
                const CARD_HALF_WIDTH = CARD_WIDTH / 2;

                // Add scroll offset to relative position
                const adjustedX = relativeX + scrollOffset;

                // Calculate index using midpoint logic
                // If we're past the midpoint of a card, we should insert at the next index
                const newHoverIndex = Math.round(adjustedX / CARD_WIDTH);

                setHoverIndex(Math.min(newHoverIndex, comboTricks.length));
            } else {
                setHoverIndex(null);
                stopAutoScroll();
            }
        }
    }, [dragStartPosition, dropZoneLayout, comboTricks.length, startAutoScroll, stopAutoScroll, scrollOffset]);

    const handleDragEnd = useCallback(() => {
        setDraggedTrick(null);
        setDragStartPosition(null);
        setIsOverDropZone(false);
        setHoverIndex(null);
    }, []);

    // Handle trick drop
    const handleTrickDrop = useCallback((trick: Trick, position: number) => {
        if (isOverDropZone && hoverIndex !== null) {
            setComboTricks(prev => {
                const newCombo = [...prev];
                newCombo.splice(hoverIndex, 0, trick);
                return newCombo;
            });
        }
    }, [isOverDropZone, hoverIndex]);

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

    // Generate random combo with N tricks based on preferences.numberOfTricks
    const handleRandomCombo = useCallback(() => {
        const count = Math.max(1, Math.round(preferences.numberOfTricks ?? 3));

        if (filteredTricks.length < count) {
            Alert.alert('Not Enough Tricks', `You need at least ${count} trick${count !== 1 ? 's' : ''} available to generate a random combo.`);
            return;
        }

        const randomTricks: Trick[] = [];
        const selectedIndices = new Set<number>();

        // Select `count` unique random tricks
        while (randomTricks.length < count) {
            const randomIndex = Math.floor(Math.random() * filteredTricks.length);
            if (!selectedIndices.has(randomIndex)) {
                selectedIndices.add(randomIndex);
                randomTricks.push(filteredTricks[randomIndex]);
            }
        }

        setComboTricks(randomTricks);
    }, [filteredTricks, preferences.numberOfTricks]);

    // Generate combo text
    const comboText = useMemo(() => {
        if (comboTricks.length === 0) return '';
        return comboTricks.map(t => t.name).join(' -> ');
    }, [comboTricks]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <SafeAreaView style={styles.container} edges={['left', 'right']}>
                    <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" hidden={true} />

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerRow}>
                            <TouchableOpacity
                                style={styles.preferencesButton}
                                onPress={() => setPreferencesModalVisible(true)}
                            >
                                <Image
                                    source={require('../../assets/preferences .png')}
                                    style={styles.preferencesIcon}
                                />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Combo Builder</Text>

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
                        <Text style={styles.sectionTitle}>Your Tricks</Text>
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
                                        onDragStart={(layout) => handleDragStart(trick, layout)}
                                        onDragMove={handleDragMove}
                                        onDragEnd={handleDragEnd}
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
                            <View style={styles.buttonGroup}>
                                <TouchableOpacity
                                    style={styles.randomButton}
                                    onPress={handleRandomCombo}
                                >
                                    <Text style={styles.randomButtonText}>Random</Text>
                                </TouchableOpacity>
                                {comboTricks.length > 0 && (
                                    <TouchableOpacity
                                        style={styles.clearButton}
                                        onPress={handleClearCombo}
                                    >
                                        <Text style={styles.clearButtonText}>Clear</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                        <ComboDropZone
                            tricks={comboTricks}
                            onRemoveTrick={handleRemoveTrick}
                            onReorderTrick={handleReorderTrick}
                            onLayout={setDropZoneLayout}
                            isOver={isOverDropZone}
                            hoverIndex={hoverIndex}
                            draggedTrick={draggedTrick}
                            scrollViewRef={scrollViewRef}
                            onStartScroll={startAutoScroll}
                            onStopScroll={stopAutoScroll}
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
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <Text style={[styles.comboText, { flex: 1 }]} >{comboText}</Text>
                                    <TouchableOpacity onPress={() => {
                                        Clipboard.setStringAsync(comboText);
                                        Alert.alert("Your combo has been copied to the clipboard.");
                                    }}
                                        style={{ flexShrink: 0 }}
                                    >
                                        <Image style={styles.copyIcon} source={require("../../assets/copy.png")}></Image>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <Text style={styles.comboTextEmpty}>
                                    Drag tricks to build your combo
                                </Text>
                            )}
                        </ScrollView>
                    </View>

                </SafeAreaView>

                {/* Drag Overlay - OUTSIDE SafeAreaView to render above everything */}
                <DragOverlay
                    trick={draggedTrick}
                    startPosition={dragStartPosition}
                    translateX={dragTranslateX}
                    translateY={dragTranslateY}
                />

                {/* Preferences Modal */}
                <PreferencesModal
                    visible={preferencesModalVisible}
                    preferences={preferences}
                    onClose={() => setPreferencesModalVisible(false)}
                    onSave={(newPreferences) => updatePreferences(newPreferences)}
                />
            </View>
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
        minHeight: 80,
        alignContent: 'center'
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
    preferencesButton: {
        padding: 4,
        width: 30,
    },
    preferencesIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
        tintColor: 'white',
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
    buttonGroup: {
        flexDirection: 'row',
        gap: 10,
    },
    randomButton: {
        backgroundColor: '#4ECDC4',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 15,
    },
    randomButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
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
        marginRight: 10,
        color: '#4ECDC4',
        fontWeight: '600',
        lineHeight: 22,
    },
    comboTextEmpty: {
        fontSize: 15,
        color: '#BDC3C7',
        fontStyle: 'italic',
    },
    copyIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
});