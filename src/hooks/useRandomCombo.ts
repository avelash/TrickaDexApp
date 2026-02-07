import { useCallback } from 'react';
import { Alert } from 'react-native';
import { Trick } from '../types';
import { transitions } from '../data/stances';

export const useRandomCombo = (
    filteredTricks: Trick[], 
    trickCountPreference: number
) => {
    
    const generateRandomCombo = useCallback((): Trick[] | null => {
        const count = Math.max(1, Math.round(trickCountPreference ?? 3));

        if (filteredTricks.length < count) {
            Alert.alert('Not Enough Tricks', `You need at least ${count} tricks available.`);
            return null;
        }

        const randomTricks: Trick[] = [];
        const maxAttempts = 1000;
        let attempts = 0;

        const canFollow = (prev: Trick | null, next: Trick) => {
            if (!prev) return true;
            if (!prev.landingStance || !next.takeoff) return true;
            return transitions(prev.landingStance, next.takeoff) !== "---";
        };

        while (randomTricks.length < count && attempts < maxAttempts) {
            attempts++;
            const availableTricks = filteredTricks.filter(t => !randomTricks.includes(t));
            
            if (availableTricks.length === 0) {
                randomTricks.length = 0; // reset
                attempts = 0;
                continue;
            }

            const lastTrick = randomTricks[randomTricks.length - 1] || null;
            const validNextTricks = availableTricks.filter(trick => canFollow(lastTrick, trick));

            if (validNextTricks.length === 0) {
                if (randomTricks.length > 0) randomTricks.pop(); // backtrack
                else break;
                continue;
            }

            const randomIndex = Math.floor(Math.random() * validNextTricks.length);
            randomTricks.push(validNextTricks[randomIndex]);
        }

        if (randomTricks.length < count) {
            Alert.alert('Could Not Generate', 'Could not find valid transitions.');
            return null;
        }

        return randomTricks;
    }, [filteredTricks, trickCountPreference]);

    return { generateRandomCombo };
};