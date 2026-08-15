import { useCallback } from 'react';
import { Alert } from 'react-native';
import { Trick } from '../types';
import { generateCombo } from '../utils/comboGenerator';
import { useLanguage } from '../i18n';

export const useRandomCombo = (
    filteredTricks: Trick[],
    trickCountPreference: number
) => {
    const { t } = useLanguage();

    const generateRandomCombo = useCallback((): Trick[] | null => {
        const count = Math.max(1, Math.round(trickCountPreference ?? 3));

        if (filteredTricks.length < count) {
            Alert.alert(t('random.notEnoughTitle'), t('random.notEnoughMessage', { count }));
            return null;
        }

        // Shared with the weekly challenge; see utils/comboGenerator.
        const combo = generateCombo(filteredTricks, count);

        if (!combo) {
            Alert.alert(t('random.failedTitle'), t('random.failedMessage'));
            return null;
        }

        return combo;
    }, [filteredTricks, trickCountPreference, t]);

    return { generateRandomCombo };
};
