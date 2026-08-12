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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Clipboard from 'expo-clipboard';
import { SearchBar } from '../components/SearchBar';
import DraggableTrickCard from '../components/DraggableTrickCard';
import { ComboDropZone } from '../components/ComboDropZone';
import { DragOverlay } from '../components/DragOverlay';
import { PreferencesModal, PreferencesState } from '../components/PreferencesModal';
import { SaveComboModal } from '../components/SaveComboModal';
import { useTrickProgress } from '../hooks/useTrickProgress';
import { useSavedCombos } from '../hooks/useSavedCombos';
import { TRICKS_DATA } from '../data/tricks';
import { SKILL_LEVELS } from '../data/skillLevels';
import { FILTER_CONFIG } from '../data/filterConfigs';
import { transitions } from '../data/stances';
import { Trick } from '../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ComboStackParamList } from '../navigation/MainTabsNavigator'
import { usePreferences } from '../hooks/usePreferences';
import { useTrickFavorites } from '../hooks/useTrickFavorites';
import { useRandomCombo } from '../hooks/useRandomCombo';
import { useTrickFiltering } from '../hooks/useTrickFiltering';
import { useExcludedTricks } from '../hooks/useExcludedTricks';
import { useLanguage, useLabels, useTrickText } from '../i18n';
import {
    autoScrollDirection,
    insertIndexAt,
    isPointInside,
    physicalScrollX,
} from '../utils/comboDragGeometry';

type ComboBuilderScreenNavigationProp = NativeStackNavigationProp<
    ComboStackParamList,
    'ComboBuilderScreen'
>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ComboBuilderScreen: React.FC = () => {
    const { t, isRTL } = useLanguage();
    const { transitionLabel } = useLabels();
    const { trickName } = useTrickText();
    const { isTrickLanded } = useTrickProgress();
    const { saveCombo } = useSavedCombos();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<ComboBuilderScreenNavigationProp>();
    const { preferences, updatePreferences } = usePreferences();
    const { isTrickFavorite } = useTrickFavorites();
    const { isTrickExcluded } = useExcludedTricks();
    const {
        search, setSearch, activeFilters, filteredTricks,
        handleToggleFilter, predefinedFilters
    } = useTrickFiltering(preferences, isTrickLanded, isTrickFavorite);
    
    const randomComboPool = useMemo(() => {
        return filteredTricks.filter(trick => !isTrickExcluded(trick.id));
    }, [filteredTricks, isTrickExcluded]);

    const { generateRandomCombo } = useRandomCombo(randomComboPool, preferences.numberOfTricks);

    const [comboTricks, setComboTricks] = useState<Trick[]>([]);
    const [preferencesModalVisible, setPreferencesModalVisible] = useState(false);
    const [saveComboModalVisible, setSaveComboModalVisible] = useState(false);

    // Drag and drop states
    const [dropZoneLayout, setDropZoneLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const [draggedTrick, setDraggedTrick] = useState<Trick | null>(null);
    const [dragStartPosition, setDragStartPosition] = useState<{ x: number; y: number } | null>(null);
    const [isOverDropZone, setIsOverDropZone] = useState(false);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const [draggedTrickOriginIndex, setDraggedTrickOriginIndex] = useState<number | null>(null);
    const [scrollMetrics, setScrollMetrics] = useState({
        scrollAlong: 0,
        contentWidth: 0,
        viewportWidth: 0,
    });
    const scrollMetricsRef = useRef(scrollMetrics);
    scrollMetricsRef.current = scrollMetrics;
    const dragTranslateX = useRef(new Animated.Value(0)).current;
    const dragTranslateY = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef<ScrollView | null>(null);
    const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);

    const startAutoScroll = useCallback((direction: 'back' | 'forward') => {
        if (autoScrollTimer.current || !scrollViewRef.current) return;

        const step = direction === 'forward' ? 20 : -20;

        autoScrollTimer.current = setInterval(() => {
            const scrollView = scrollViewRef.current;
            if (!scrollView) return;

            const { scrollAlong, contentWidth, viewportWidth } = scrollMetricsRef.current;
            const nextAlong = Math.max(0, scrollAlong + step);

            scrollView.scrollTo({
                x: physicalScrollX(nextAlong, contentWidth, viewportWidth, isRTL),
                animated: false,
            });
        }, 50);
    }, [isRTL]);

    const stopAutoScroll = useCallback(() => {
        if (autoScrollTimer.current) {
            clearInterval(autoScrollTimer.current);
            autoScrollTimer.current = null;
        }
    }, []);

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

        if (!dragStartPosition || !dropZoneLayout) return;

        const pointerX = dragStartPosition.x + translateX;
        const pointerY = dragStartPosition.y + translateY;

        const isOver = isPointInside(dropZoneLayout, pointerX, pointerY);
        setIsOverDropZone(isOver);

        if (!isOver) {
            setHoverIndex(null);
            stopAutoScroll();
            return;
        }

        const scrollDirection = autoScrollDirection(dropZoneLayout, pointerX, isRTL);
        if (scrollDirection) {
            startAutoScroll(scrollDirection);
        } else {
            stopAutoScroll();
        }

        setHoverIndex(
            insertIndexAt(
                dropZoneLayout,
                pointerX,
                scrollMetricsRef.current.scrollAlong,
                comboTricks.length,
                isRTL
            )
        );
    }, [dragStartPosition, dropZoneLayout, comboTricks.length, startAutoScroll, stopAutoScroll, isRTL]);

    const handleDragStartComboTrick = useCallback((trick: Trick, index: number, layout: { x: number; y: number; width: number; height: number }) => {
        setDraggedTrick(trick);
        setDragStartPosition({ x: layout.x, y: layout.y });
        dragTranslateX.setValue(0);
        dragTranslateY.setValue(0);
        setDraggedTrickOriginIndex(index);
        
        // We leave the item in the array so it doesn't unmount and break the gesture!
        // We will visually hide it by setting its opacity to 0 inside ComboDropZone.
    }, []);

    const handleDragEndComboTrick = useCallback(() => {
        // Cache draggedTrick into a local variable before nulling state, or use the state directly if we hadn't nulled it.
        const trickToDrop = draggedTrick;
        const originIndex = draggedTrickOriginIndex;
        setDraggedTrick(null);
        setDragStartPosition(null);

        if (isOverDropZone && hoverIndex !== null && trickToDrop && originIndex !== null) {
            setComboTricks(prev => {
                const newCombo = [...prev];
                // Remove the old item first
                newCombo.splice(originIndex, 1);
                
                // Adjust hover index due to the removal
                let adjustedHover = hoverIndex;
                if (hoverIndex > originIndex) {
                    adjustedHover -= 1;
                }
                
                // Insert at the new hoverIndex
                newCombo.splice(adjustedHover, 0, trickToDrop);
                return newCombo;
            });
        }
        
        setIsOverDropZone(false);
        setHoverIndex(null);
        setDraggedTrickOriginIndex(null);
    }, [isOverDropZone, hoverIndex, draggedTrick, draggedTrickOriginIndex]);

    const handleDragEnd = useCallback(() => {
        setDraggedTrick(null);
        setDragStartPosition(null);
        setIsOverDropZone(false);
        setHoverIndex(null);
    }, []);

    // Handle trick drop
    const handleTrickDrop = useCallback((trick: Trick) => {
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

    // Generate combo text
    const comboText = useMemo(() => {
        if (comboTricks.length === 0) return '';

        const parts: string[] = [];

        for (let i = 0; i < comboTricks.length; i++) {
            const currentTrick = comboTricks[i];
            const nextTrick = comboTricks[i + 1];

            // Add current trick name
            parts.push(trickName(currentTrick));

            // If there's a next trick, check if we can add a transition
            if (nextTrick && currentTrick.landingStance && nextTrick.takeoff) {
                const transition = transitions(currentTrick.landingStance, nextTrick.takeoff);
                if (nextTrick.name.toLowerCase().startsWith(transition.toLowerCase())) {
                    //do nothing
                } else {
                    parts.push(transitionLabel(transition));
                }
            }
        }

        return parts.join(' ');
    }, [comboTricks, trickName, transitionLabel]);

    // Save combo
    const handleSaveCombo = useCallback(() => {
        if (!comboText) {
            Alert.alert(t('combo.noComboTitle'), t('combo.noComboMessage'));
            return;
        }
        setSaveComboModalVisible(true);
    }, [comboText, t]);

    const handleSaveComboConfirm = useCallback((title: string) => {
        saveCombo(comboText, title);
        setSaveComboModalVisible(false);
        Alert.alert(t('combo.savedTitle'), t('combo.savedMessage'));
    }, [comboText, saveCombo, t]);

    // Navigate to saved combos
    const handleViewSavedCombos = useCallback(() => {
        navigation.navigate('SavedCombosScreen');
    }, [navigation]);


    // Generate random combo with N tricks based on preferences.numberOfTricks
    const handleRandomComboPress = useCallback(() => {
        const result = generateRandomCombo();
        if (result) setComboTricks(result);
    }, [generateRandomCombo]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <SafeAreaView style={styles.container} edges={['left', 'right']}>
                    <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" hidden={true} />

                    {/* Header */}
                    <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
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
                            <Text style={styles.headerTitle}>{t('combo.title')}</Text>
                            <TouchableOpacity
                                style={styles.myCombosButton}
                                onPress={handleViewSavedCombos}
                            >
                                <Text style={styles.myCombosButtonText}>{t('combo.myCombos')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Main Content ScrollView */}
                    <ScrollView 
                        style={{ flex: 1 }} 
                        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                        showsVerticalScrollIndicator={true}
                    >
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
                                {t('combo.tricksAvailable', { count: filteredTricks.length })}
                            </Text>
                        </View>
                    )}

                    {/* Horizontal Scrollable Trick List */}
                    <View style={styles.trickListContainer}>
                        <Text style={styles.sectionTitle}>{t('combo.yourTricks')}</Text>
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
                                            ? t('combo.noMatch')
                                            : t('combo.noLanded')}
                                    </Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>

                    {/* Drop Zone */}
                    <View style={styles.dropZoneContainer}>
                        <View style={styles.dropZoneHeader}>
                            <Text style={styles.sectionTitle}>{t('combo.build')}</Text>
                            <View style={styles.buttonGroup}>
                                <TouchableOpacity
                                    style={styles.randomButton}
                                    onPress={handleRandomComboPress}
                                >
                                    <Text style={styles.randomButtonText}>{t('combo.random')}</Text>
                                </TouchableOpacity>
                                {comboTricks.length > 0 && (
                                    <TouchableOpacity
                                        style={styles.clearButton}
                                        onPress={handleClearCombo}
                                    >
                                        <Text style={styles.clearButtonText}>{t('common.clear')}</Text>
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
                            draggedTrickOriginIndex={draggedTrickOriginIndex}
                            scrollViewRef={scrollViewRef}
                            onStartScroll={startAutoScroll}
                            onStopScroll={stopAutoScroll}
                            onScrollMetrics={setScrollMetrics}
                            onDragStartComboTrick={handleDragStartComboTrick}
                            onDragMoveComboTrick={handleDragMove}
                            onDragEndComboTrick={handleDragEndComboTrick}
                        />
                    </View>

                    {/* Combo Text Display */}
                    <View style={styles.comboTextContainer}>
                        <View style={styles.comboTextHeader}>
                            <Text style={styles.comboTextLabel}>{t('combo.label')}</Text>
                            {comboText && (
                                <TouchableOpacity
                                    style={styles.saveComboButton}
                                    onPress={handleSaveCombo}
                                >
                                    <Text style={styles.saveComboButtonText}>{t('combo.save')}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <ScrollView
                            style={styles.comboTextScroll}
                            showsVerticalScrollIndicator={false}
                        >
                            {comboText ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <Text style={[styles.comboText, { flex: 1 }]} >{comboText}</Text>
                                    <TouchableOpacity onPress={() => {
                                        Clipboard.setStringAsync(comboText);
                                        Alert.alert(t('combo.copiedToClipboard'));
                                    }}
                                        style={{ flexShrink: 0 }}
                                    >
                                        <Image style={styles.copyIcon} source={require("../../assets/copy.png")}></Image>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <Text style={styles.comboTextEmpty}>
                                    {t('combo.emptyHint')}
                                </Text>
                            )}
                        </ScrollView>
                    </View>

                    </ScrollView>

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

                {/* Save Combo Modal */}
                <SaveComboModal
                    visible={saveComboModalVisible}
                    comboText={comboText}
                    onSave={handleSaveComboConfirm}
                    onCancel={() => setSaveComboModalVisible(false)}
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
        flexGrow: 1,
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
    myCombosButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'white',
    },
    myCombosButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    comboTextContainer: {
        backgroundColor: 'white',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        maxHeight: 140,
    },
    comboTextHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    comboTextLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    saveComboButton: {
        backgroundColor: '#4ECDC4',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 15,
    },
    saveComboButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
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