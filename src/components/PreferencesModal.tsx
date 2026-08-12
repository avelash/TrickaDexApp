import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Modal,
    TouchableOpacity,
    ScrollView,
    Switch,
} from 'react-native';
import { SKILL_LEVELS } from '../data/skillLevels';
import { useLanguage, useLabels } from '../i18n';

export interface PreferencesState {
    onlyLandedTricks: boolean;
    minLevel: number;
    maxLevel: number;
    numberOfTricks: number;
}

interface PreferencesModalProps {
    visible: boolean;
    preferences: PreferencesState;
    onClose: () => void;
    onSave: (preferences: PreferencesState) => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
    visible,
    preferences,
    onClose,
    onSave,
}) => {
    const [localPreferences, setLocalPreferences] = useState<PreferencesState>(preferences);
    const { t } = useLanguage();
    const { levelLabel } = useLabels();

    // Sync local state when preferences prop changes
    useEffect(() => {
        setLocalPreferences(preferences);
    }, [preferences]);

    const handleSave = () => {
        onSave(localPreferences);
        onClose();
    };

    const handleLandedTricksToggle = (value: boolean) => {
        setLocalPreferences(prev => ({
            ...prev,
            onlyLandedTricks: value,
        }));
    };

    const handleMinLevelChange = (levelNumber: number) => {
        setLocalPreferences(prev => ({
            ...prev,
            minLevel: levelNumber,
            // Ensure maxLevel is not less than minLevel
            maxLevel: prev.maxLevel < levelNumber ? levelNumber : prev.maxLevel,
        }));
    };

    const handleMaxLevelChange = (levelNumber: number) => {
        setLocalPreferences(prev => ({
            ...prev,
            maxLevel: levelNumber,
            // Ensure minLevel is not more than maxLevel
            minLevel: prev.minLevel > levelNumber ? levelNumber : prev.minLevel,
        }));
    };

    const handleNumberOfTricksChange = (newCount: number) => {
        const clamped = Math.max(1, Math.min(10, Math.round(newCount)));
        setLocalPreferences(prev => ({
            ...prev,
            numberOfTricks: clamped,
        }));
    };

    const currentMinLevel = SKILL_LEVELS.find(l => l.number === localPreferences.minLevel);
    const currentMaxLevel = SKILL_LEVELS.find(l => l.number === localPreferences.maxLevel);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{t('prefs.title')}</Text>

                    <ScrollView
                        style={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Only Landed Tricks Toggle */}
                        <View style={styles.settingSection}>
                            <View style={styles.settingHeader}>
                                <Text style={styles.settingLabel}>{t('prefs.onlyLanded')}</Text>
                                <Switch
                                    value={localPreferences.onlyLandedTricks}
                                    onValueChange={handleLandedTricksToggle}
                                    trackColor={{ false: '#D0D0D0', true: '#befffbff' }}
                                    thumbColor={localPreferences.onlyLandedTricks ? '#4ECDC4' : '#f4f3f4'}
                                />
                            </View>
                        </View>

                        {/* Min Level Dropdown */}
                        <View style={styles.settingSection}>
                            <Text style={styles.settingLabel}>{t('prefs.minLevel')}</Text>
                            <View style={styles.levelSelector}>
                                {SKILL_LEVELS.map(level => (
                                    <TouchableOpacity
                                        key={level.number}
                                        style={[
                                            styles.levelButton,
                                            localPreferences.minLevel === level.number &&
                                            styles.levelButtonActive,
                                        ]}
                                        onPress={() => handleMinLevelChange(level.number)}
                                    >
                                        <Text
                                            style={[
                                                styles.levelButtonText,
                                                localPreferences.minLevel === level.number &&
                                                styles.levelButtonTextActive,
                                            ]}
                                        >
                                            {levelLabel(level.number)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Max Level Dropdown */}
                        <View style={styles.settingSection}>
                            <Text style={styles.settingLabel}>{t('prefs.maxLevel')}</Text>
                            <View style={styles.levelSelector}>
                                {SKILL_LEVELS.map(level => (
                                    <TouchableOpacity
                                        key={level.number}
                                        style={[
                                            styles.levelButton,
                                            localPreferences.maxLevel === level.number &&
                                            styles.levelButtonActive,
                                        ]}
                                        onPress={() => handleMaxLevelChange(level.number)}
                                    >
                                        <Text
                                            style={[
                                                styles.levelButtonText,
                                                localPreferences.maxLevel === level.number &&
                                                styles.levelButtonTextActive,
                                            ]}
                                        >
                                            {levelLabel(level.number)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        {/* Number of Tricks for Random */}
                        <View style={styles.settingSection}>
                            <Text style={styles.settingLabel}>{t('prefs.comboSize')}</Text>
                            <View style={styles.stepperContainer}>
                                <TouchableOpacity
                                    style={styles.stepperButton}
                                    onPress={() => handleNumberOfTricksChange(localPreferences.numberOfTricks - 1)}
                                >
                                    <Text style={styles.stepperButtonText}>−</Text>
                                </TouchableOpacity>

                                <View style={styles.numberDisplay}>
                                    <Text style={styles.numberDisplayText}>{localPreferences.numberOfTricks}</Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.stepperButton}
                                    onPress={() => handleNumberOfTricksChange(localPreferences.numberOfTricks + 1)}
                                >
                                    <Text style={styles.stepperButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.hintText}>{t('prefs.comboSizeHint')}</Text>
                        </View>
                    </ScrollView>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                        >
                            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 15,
        width: '100%',
        maxHeight: '85%',
        paddingTop: 20,
        paddingBottom: 15,
        paddingHorizontal: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 20,
        textAlign: 'center',
    },
    scrollContainer: {
        maxHeight: 'auto',
    },
    settingSection: {
        marginBottom: 25,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    settingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 12,
    },
    levelSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    levelButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#DDD',
        backgroundColor: '#F5F5F5',
        marginBottom: 8,
    },
    levelButtonActive: {
        backgroundColor: '#4ECDC4',
        borderColor: '#4ECDC4',
    },
    levelButtonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    levelButtonTextActive: {
        color: 'white',
        fontWeight: '600',
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 6,
        marginBottom: 6,
    },
    stepperButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1.2,
        borderColor: '#DDD',
        backgroundColor: '#F5F5F5',
    },
    stepperButtonText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#666',
    },
    numberDisplay: {
        minWidth: 48,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    numberDisplayText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2C3E50',
    },
    hintText: {
        fontSize: 12,
        color: '#888',
        marginTop: 6,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#FF5252',
        backgroundColor: 'white',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF5252',
        textAlign: 'center',
    },
    saveButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#4ECDC4',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        textAlign: 'center',
    },
});