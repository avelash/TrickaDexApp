import { useState, useMemo, useCallback } from 'react';
import { TRICKS_DATA } from '../data/tricks';
import { FILTER_CONFIG } from '../data/filterConfigs';
import { SKILL_LEVELS } from '../data/skillLevels';
import { Trick } from '../types';
import { trickMatchesSearch, findFilterByName } from '../i18n/search';

export const useTrickFiltering = (
    preferences: any, 
    isTrickLanded: (id: string) => boolean,
    isTrickFavorite: (id: string) => boolean
) => {
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [search, setSearch] = useState<string>('');

    // Get basic list based on preferences
    const preferredTricks = useMemo(() => {
        let tricks = TRICKS_DATA;
        if (preferences.onlyLandedTricks) {
            tricks = tricks.filter(trick => isTrickLanded(trick.id));
        }
        if (preferences.minLevel !== undefined && preferences.minLevel !== null) {
            tricks = tricks.filter(trick => (trick.difficulty ?? 0) >= preferences.minLevel);
        }
        if (preferences.maxLevel !== undefined && preferences.maxLevel !== null) {
            tricks = tricks.filter(trick => (trick.difficulty ?? 0) <= preferences.maxLevel);
        }
        return tricks;
    }, [preferences, isTrickLanded]);

    // Complex filtering logic
    const filteredTricks = useMemo(() => {
        let tricks = preferredTricks;
        let filtersToApply = [...activeFilters];

        // Match search text to filter categories
        if (search && !activeFilters.includes(search)) {
            const matchedFilter = findFilterByName(search);
            if (matchedFilter) filtersToApply.push(matchedFilter);
        }

        if (filtersToApply.length === 0 && !search) return tricks;

        if (filtersToApply.length > 0) {
            tricks = tricks.filter(trick => {
                return filtersToApply.every(filter => {
                    if (filter === 'Landed') return isTrickLanded(trick.id);
                    if (filter === 'Favorites') return isTrickFavorite(trick.id);
                    if (SKILL_LEVELS.map(l => l.name).includes(filter)) {
                        const levelIdx = SKILL_LEVELS.findIndex(l => l.name === filter);
                        return (trick.difficulty ?? 0) === levelIdx;
                    }
                    return trick.types.some(t => t.toLowerCase() === filter.toLowerCase());
                });
            });
        }

        if (search && !findFilterByName(search)) {
            tricks = tricks.filter(trick => trickMatchesSearch(trick, search));
        }

        return tricks;
    }, [preferredTricks, activeFilters, search, isTrickLanded, isTrickFavorite]);

    const handleToggleFilter = useCallback((filter: string) => {
        setActiveFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]);
    }, []);

    return {
        search,
        setSearch,
        activeFilters,
        filteredTricks,
        handleToggleFilter,
        predefinedFilters: FILTER_CONFIG.filter(f => f.name !== 'Landed' && f.name !== 'All').map(f => f.name)
    };
};