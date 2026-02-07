import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';

interface SaveComboModalProps {
    visible: boolean;
    comboText: string;
    onSave: (title: string) => void;
    onCancel: () => void;
}

export const SaveComboModal: React.FC<SaveComboModalProps> = ({
    visible,
    comboText,
    onSave,
    onCancel,
}) => {
    const [title, setTitle] = useState('');

    const handleSave = () => {
        onSave(title);
        setTitle(''); // Reset title after saving
    };

    const handleCancel = () => {
        setTitle(''); // Reset title on cancel
        onCancel();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Save Combo</Text>

                    <View style={styles.comboTextContainer}>
                        <Text style={styles.comboLabel}>Combo:</Text>
                        <ScrollView style={styles.comboScroll} showsVerticalScrollIndicator={false}>
                            <Text style={styles.comboText}>{comboText}</Text>
                        </ScrollView>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Title (optional):</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Enter combo title..."
                            placeholderTextColor="#999"
                            maxLength={50}
                        />
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleCancel}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
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
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        width: '85%',
        maxHeight: '70%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 15,
        textAlign: 'center',
    },
    comboTextContainer: {
        backgroundColor: '#F7F7F7',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        maxHeight: 150,
    },
    comboLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 8,
    },
    comboScroll: {
        maxHeight: 100,
    },
    comboText: {
        fontSize: 15,
        color: '#4ECDC4',
        fontWeight: '600',
        lineHeight: 22,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F7F7F7',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        color: '#2C3E50',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#E0E0E0',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: '#4ECDC4',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
