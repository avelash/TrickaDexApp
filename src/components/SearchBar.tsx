import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Keyboard, Image, ScrollView, Dimensions } from 'react-native';
import { FILTER_CONFIG, FilterConfig } from '../data/filterConfigs';

interface SearchBarProps {
    filters: string[];
    activeFilters: string[];
    onToggleFilter: (filter: string) => void;
    onSearch: (search: string) => void;
}

// Move static computation outside component
const GROUPED_FILTERS = (() => {
    const groups: { [key: string]: FilterConfig[] } = {};
    FILTER_CONFIG.forEach(filter => {
        if (!groups[filter.category]) {
            groups[filter.category] = [];
        }
        groups[filter.category].push(filter);
    });
    return groups;
})();

const FILTER_MAP = new Map(FILTER_CONFIG.map(f => [f.name, f]));

// Constants
const HEADER_HEIGHT = 80;
const ICON_SIZE = 24;
const FILTER_ICON_SIZE = 20;
const SUGGESTION_ICON_SIZE = 40;

export const SearchBar: React.FC<SearchBarProps> = ({ filters, activeFilters, onToggleFilter, onSearch }) => {
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
            setKeyboardHeight(e.endCoordinates.height);
        });
        const hideSub = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
        });
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const activeFilterConfigs = useMemo(() =>
        activeFilters.map(filter => FILTER_MAP.get(filter)).filter(Boolean) as FilterConfig[],
        [activeFilters]
    );

    const handleIconPress = useCallback(() => {
        setSearchOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    const handleChange = useCallback((text: string) => {
        setSearchText(text);
        onSearch(text);
    }, [onSearch]);

    const handleFilterToggle = useCallback((filter: string) => {
        onToggleFilter(filter);
        setSearchText('');
        onSearch('');
        setSearchOpen(false);
        Keyboard.dismiss();
    }, [onToggleFilter, onSearch]);

    const handleScroll = useCallback(() => {
        Keyboard.dismiss();
    }, []);

    const handleCloseOverlay = useCallback(() => {
        setSearchOpen(false);
        setSearchText('');
        onSearch('');
        Keyboard.dismiss();
    }, [onSearch]);

    const handleFocus = useCallback(() => {
        setSearchOpen(true);
    }, []);

    const handleRemoveFilter = useCallback((filter: string) => {
        onToggleFilter(filter);
    }, [onToggleFilter]);

    const overlayStyle = useMemo(() => [
        styles.suggestionOverlay,
        keyboardHeight
            ? { maxHeight: Dimensions.get('window').height - keyboardHeight - HEADER_HEIGHT }
            : { height: Dimensions.get('window').height - HEADER_HEIGHT }
    ], [keyboardHeight]);

    // Determine if input should be shown
    const showInput = activeFilters.length === 0 || searchText.length > 0;

    return (
        <View style={styles.container}>
            <View style={styles.searchRow}>
                {searchOpen && searchText.length === 0 ? (
                    <TouchableOpacity
                        onPress={handleCloseOverlay}
                        style={styles.iconButton}
                        accessibilityLabel="Close search"
                        accessibilityRole="button"
                    >
                        <Image
                            source={require('../../assets/return.png')}
                            style={styles.icon}
                        />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={handleIconPress}
                        style={styles.iconButton}
                        accessibilityLabel="Open search"
                        accessibilityRole="button"
                    >
                        <Image
                            source={require('../../assets/magnifying-glass.png')}
                            style={styles.icon}
                        />
                    </TouchableOpacity>
                )}

                {/* Show active filter chips in a wrapping view instead of a horizontal ScrollView */}
                {activeFilterConfigs.length > 0 && (
                    <View
                        style={styles.filterChipsContainer}
                        accessibilityRole="list"
                        accessibilityLabel="Active filters"
                    >
                        {activeFilterConfigs.map((filterConfig) => (
                            <View
                                key={filterConfig.name}
                                style={[styles.filterBox, { backgroundColor: filterConfig.color }]}
                                accessibilityLabel={`Filter: ${filterConfig.name}`}
                            >
                                <Image
                                    source={filterConfig.icon}
                                    style={styles.filterBoxIcon}
                                />
                                <Text style={styles.filterBoxText}>{filterConfig.name}</Text>
                                <TouchableOpacity
                                    onPress={() => handleRemoveFilter(filterConfig.name)}
                                    style={styles.filterBoxClose}
                                    accessibilityLabel={`Remove ${filterConfig.name} filter`}
                                    accessibilityRole="button"
                                >
                                    <Text style={styles.filterBoxCloseText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                {/* TextInput stays as sibling so it flows inline with chips */}
                <TextInput
                    ref={inputRef}
                    style={[
                        styles.input,
                        !showInput && styles.inputHidden
                    ]}
                    placeholder={!searchOpen ? "Search tricks or filter..." : ""}
                    value={searchText}
                    onChangeText={handleChange}
                    onFocus={handleFocus}
                    placeholderTextColor="#999"
                    accessibilityLabel="Search input"
                    accessibilityHint="Enter trick name or select a filter"
                    textAlign="left"
                    editable={true}
                />
            </View>

            {searchOpen && searchText.length === 0 && (
                <View style={overlayStyle}>
                    <ScrollView
                        contentContainerStyle={styles.suggestionGrid}
                        onScrollBeginDrag={handleScroll}
                        scrollEnabled={true}
                        nestedScrollEnabled={true}
                    >
                        {Object.entries(GROUPED_FILTERS).map(([category, categoryFilters]) => (
                            <View key={category} style={styles.categorySection}>
                                <Text style={styles.categoryTitle}>{category}</Text>
                                <View style={styles.categoryRow}>
                                    {categoryFilters.map((filterItem) => {
                                        const isActive = activeFilters.includes(filterItem.name);
                                        return (
                                            <TouchableOpacity
                                                key={filterItem.name}
                                                style={[
                                                    styles.suggestionCard,
                                                    { backgroundColor: filterItem.color },
                                                    isActive && styles.suggestionActive
                                                ]}
                                                onPress={() => handleFilterToggle(filterItem.name)}
                                                accessibilityLabel={`Filter by ${filterItem.name}`}
                                                accessibilityRole="button"
                                                accessibilityState={{ selected: isActive }}
                                            >
                                                <Image
                                                    source={filterItem.icon}
                                                    style={styles.suggestionIcon}
                                                />
                                                <Text style={[
                                                    styles.suggestionText,
                                                    isActive && styles.suggestionTextActive
                                                ]}>
                                                    {filterItem.name}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 24,
        paddingHorizontal: 8,
        paddingVertical: 6,
        minHeight: 44,
        flexWrap: 'wrap', // allow chips + input to wrap
    },
    iconButton: {
        padding: 6,
        marginRight: 6,
        minWidth: 36,
        minHeight: 36,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    icon: {
        width: ICON_SIZE,
        height: ICON_SIZE,
        tintColor: '#4ECDC4',
    },
    // Chips container now wraps and can be limited in height to show N rows
    filterChipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',         // wrap the chips to multiple rows when needed
        flexShrink: 1,            // allow it to shrink for the input
        marginRight: 6,
        maxHeight: 88,            // ~2 rows (adjust this value to allow 1/2/3 rows)
        overflow: 'hidden',       // hide anything beyond max rows
        alignItems: 'center',
    },
    filterBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginRight: 6,
        marginBottom: 6,
    },
    filterBoxIcon: {
        width: FILTER_ICON_SIZE,
        height: FILTER_ICON_SIZE,
        marginRight: 6,
        tintColor: 'white',
    },
    filterBoxText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
        marginRight: 6,
    },
    filterBoxClose: {
        padding: 2,
        minWidth: 20,
        minHeight: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterBoxCloseText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 6,
        paddingHorizontal: 0,
        backgroundColor: 'transparent',
        minWidth: 80,
    },
    inputHidden: {
        width: 0,
        minWidth: 0,
        padding: 0,
        opacity: 0,
    },
    suggestionOverlay: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        zIndex: 10,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingVertical: 10,
        backgroundColor: 'rgba(255,255,255,0.98)',
        paddingBottom: 80,
    },
    suggestionGrid: {
        width: '100%',
        paddingHorizontal: 10,
    },
    categorySection: {
        marginBottom: 20,
    },
    categoryTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#4ECDC4',
        marginBottom: 8,
        marginLeft: 4,
        marginTop: 10,
    },
    categoryRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        // gap is not supported in RN styles, use margins on children
        marginLeft: 10,
        marginRight:10,
    },
    suggestionCard: {
        width: 100,
        height: 100,
        borderRadius: 20,
        margin: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
        position: 'relative',
    },
    suggestionActive: {
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.8)',
    },
    suggestionIcon: {
        width: SUGGESTION_ICON_SIZE,
        height: SUGGESTION_ICON_SIZE,
        marginBottom: 6,
        tintColor: 'white',
    },
    suggestionText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 13,
        textAlign: 'center',
    },
    suggestionTextActive: {
        color: 'white',
    },
});

export default SearchBar;
