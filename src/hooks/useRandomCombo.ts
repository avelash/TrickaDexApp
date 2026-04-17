import { useCallback } from 'react';
import { Alert } from 'react-native';
import { Trick } from '../types';
import { transitions, allowedAfterLandings } from '../data/stances';

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
        
        console.log(`\n--- Generating Random Combo backwards --- (Target length: ${count})`);

        // ==========================================
        // 1. CREATE BEST TRICKS POOL
        // ==========================================
        // We want the most difficult tricks available to be our 'best' tricks.
        // We group tricks by their difficulty levels, starting from the highest difficulty.
        const bestTricksSet = new Map<string, Trick>();
        
        // Find all unique difficulty levels available and sort them from highest to lowest
        const availableDifficulties = Array.from(new Set(filteredTricks.map(t => t.difficulty))).sort((a, b) => b - a);
        
        for (const diff of availableDifficulties) {
            // Once we have at least 10 tricks, we stop so the pool remains exclusive to the highest levels.
            if (bestTricksSet.size >= 10) break;
            
            // Include all tricks that share this difficulty level
            const tricksInLevel = filteredTricks.filter(t => t.difficulty === diff);
            tricksInLevel.forEach(t => bestTricksSet.set(t.id, t));
        }

        const bestTricks = Array.from(bestTricksSet.values());
        console.log(`Generated Best Tricks Pool (size: ${bestTricks.length}) from top ${availableDifficulties.length} difficulty levels.`);
        console.log(`Best Tricks: ${bestTricks.map(t => t.name).join(', ')}`);
        // ==========================================
        // 2. PICK THE ANCHOR TRICK (NON-TRANSITION)
        // ==========================================
        // "from it pick one at random, that isnt a transition"
        // This trick will be the LAST trick in the combo, and we will build the combo backwards from here!
        const nonTransitionBest = bestTricks.filter(t => !t.types.includes('transition'));
        
        // Fallback just in case there are no non-transitions in bestTricks
        const anchorTrickCandidates = nonTransitionBest.length > 0 ? nonTransitionBest : bestTricks;

        // Since we are building backwards, index 0 is the LAST trick, index 1 goes BEFORE it, etc.
        // We will reverse this array at the very end.
        const reversedCombo: Trick[] = []; 
        const maxAttempts = 3000;
        let attempts = 0;

        while (reversedCombo.length < count && attempts < maxAttempts) {
            attempts++;
            
            // If the combo is empty (we just started, or we backtracked to the beginning),
            // pick a new random anchor trick to start building backwards from.
            if (reversedCombo.length === 0) {
                const randomAnchorIndex = Math.floor(Math.random() * anchorTrickCandidates.length);
                const anchorTrick = anchorTrickCandidates[randomAnchorIndex];
                console.log(`[Attempt ${attempts}] Picked Anchor Trick (finale): ${anchorTrick.name} (Diff: ${anchorTrick.difficulty})`);
                reversedCombo.push(anchorTrick);
                continue; // Move to the next loop iteration to find the trick before this one
            }

            // The trick we are currently trying to find a predecessor for
            const currentTrick = reversedCombo[reversedCombo.length - 1]; 
            console.log(`[Attempt ${attempts}] Current combo length: ${reversedCombo.length}. Finding predecessor for: ${currentTrick.name}`);
            
            // ==========================================
            // 3. APPLY RULES FOR THE PRECEDING TRICK
            // ==========================================
            
            // Rule: "if the trick is a flip give a 80% chance that the trick before it will be a transition"
            const isFlip = currentTrick.types.includes('flip');
            const forceTransitionBefore = isFlip && Math.random() < 0.80;

            // Rule: "75% chance to pick a trick from the best tricks and 25% chance to pick a trick that is from the entire list"
            const useBestTricksPool = Math.random() < 0.65;
            console.log(`   -> Using best tricks pool: ${useBestTricksPool ? 'Yes' : 'No'}`);
            let currentPool = useBestTricksPool ? bestTricks : filteredTricks;

            // Helper function to find valid tricks to go BEFORE currentTrick
            const getValidPredecessors = (sourcePool: Trick[], restrictToTransition: boolean) => {
                return sourcePool.filter(candidate => {
                    // "make sure there are no repetitions"
                    if (reversedCombo.some(t => t.id === candidate.id)) return false;
                    
                    // Enforce the 80% transition chance rule if applicable
                    if (restrictToTransition && !candidate.types.includes('transition')) return false;

                    // Leniency for incomplete trick data
                    if (!candidate.landingStance || !currentTrick.takeoff) return true;

                    // "uses the allowed after landings function find a trick to go before it"
                    const allowedLandingsToPrecede = allowedAfterLandings(currentTrick.takeoff as any);
                    if (!allowedLandingsToPrecede.includes(candidate.landingStance as any)) return false;
                    
                    // Let's also ensure the transition isn't explicitly blocked
                    if (transitions(candidate.landingStance as any, currentTrick.takeoff as any) === "---") return false;
                    
                    return true;
                });
            };

            // First attempt to find a predecessor in the selected pool
            let validCandidates = getValidPredecessors(currentPool, forceTransitionBefore);

            // ==========================================
            // 4. FALLBACK AND BACKTRACKING
            // ==========================================
            // "if at any point u fail to fnid a valid trick to go there either expand to the entire list..."
            if (validCandidates.length === 0 && useBestTricksPool) {
                // Expand to the entire list if we were searching in bestTricks
                validCandidates = getValidPredecessors(filteredTricks, forceTransitionBefore);
            }

            // If we still fail, and we forced a transition, try removing the transition restriction but search the whole list
            if (validCandidates.length === 0 && forceTransitionBefore) {
                validCandidates = getValidPredecessors(filteredTricks, false);
            }

            // "...or remove the lsat trick added and try again" 
            // If absolutely no candidates are found, we prune the dead end (backtrack)
            if (validCandidates.length === 0) {
                const removedTrick = reversedCombo.pop(); // Remove the last trick added (which means moving forwards in the combo)
                console.log(`   -> No candidates found! Backtracking... removed: ${removedTrick?.name}`);
                continue; // Try again!
            }

            // ==========================================
            // 5. PICK A VALID PREDECESSOR
            // ==========================================
            const nextRandomIndex = Math.floor(Math.random() * validCandidates.length);
            const selectedPredecessor = validCandidates[nextRandomIndex];
            console.log(`   -> Found valid predecessor: ${selectedPredecessor.name} (Pool size: ${validCandidates.length})`);
            reversedCombo.push(selectedPredecessor);
        }

        if (reversedCombo.length < count) {
            Alert.alert('Could Not Generate', 'Could not find a valid combination after many attempts. Try adding more tricks.');
            return null;
        }

        // Since we built the combo by finding tricks to go BEFORE the current trick,
        // our array is currently backwards. Reverse it so it plays in the chronological order!
        const finalCombo = reversedCombo.reverse();
        console.log(`\n--- Combo successfully generated! ---`);
        console.log(finalCombo.map(t => t.name).join(' -> '));

        return finalCombo;

    }, [filteredTricks, trickCountPreference]);

    return { generateRandomCombo };
};