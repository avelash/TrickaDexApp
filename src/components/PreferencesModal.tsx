import React, { useState } from 'react';
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

export interface PreferencesState {
    onlyLandedTricks: boolean;
    minLevel: number;
    maxLevel: number;
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
                    <Text style={styles.modalTitle}>Preferences</Text>

                    <ScrollView
                        style={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Only Landed Tricks Toggle */}
                        <View style={styles.settingSection}>
                            <View style={styles.settingHeader}>
                                <Text style={styles.settingLabel}>Include Only Landed Tricks</Text>
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
                            <Text style={styles.settingLabel}>Minimum Level</Text>
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
                                            {level.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Max Level Dropdown */}
                        <View style={styles.settingSection}>
                            <Text style={styles.settingLabel}>Maximum Level</Text>
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
                                            {level.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                        >
                            <Text style={styles.saveButtonText}>Save</Text>
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
