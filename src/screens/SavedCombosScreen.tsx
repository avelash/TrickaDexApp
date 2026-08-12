import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useSavedCombos } from '../hooks/useSavedCombos';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../i18n';

export const SavedCombosScreen: React.FC = () => {
    const { savedCombos, deleteCombo } = useSavedCombos();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { t, language } = useLanguage();

    const handleCopyCombo = async (comboText: string) => {
        await Clipboard.setStringAsync(comboText);
        Alert.alert(t('savedCombos.copiedTitle'), t('savedCombos.copiedMessage'));
    };

    const handleDeleteCombo = (comboId: string, title: string) => {
        Alert.alert(
            t('savedCombos.deleteTitle'),
            t('savedCombos.deleteMessage', { title }),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: () => deleteCombo(comboId),
                },
            ]
        );
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" hidden={true} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('savedCombos.title')}</Text>
                <View style={styles.backButton} />
            </View>

            {/* Combos List */}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {savedCombos.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>{t('savedCombos.empty')}</Text>
                        <Text style={styles.emptyStateSubtext}>
                            {t('savedCombos.emptyHint')}
                        </Text>
                    </View>
                ) : (
                    savedCombos.map((combo) => (
                        <View key={combo.id} style={styles.comboCard}>
                            <View style={styles.comboHeader}>
                                <Text style={styles.comboTitle}>{combo.title}</Text>
                                <Text style={styles.comboDate}>{formatDate(combo.timestamp)}</Text>
                            </View>
                            <Text style={styles.comboText}>{combo.comboText}</Text>
                            <View style={styles.comboActions}>
                                <TouchableOpacity
                                    style={styles.copyButton}
                                    onPress={() => handleCopyCombo(combo.comboText)}
                                >
                                    <Text style={styles.copyButtonText}>{t('common.copy')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteCombo(combo.id, combo.title)}
                                >
                                    <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 28,
        color: 'white',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 15,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#999',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#BBB',
        textAlign: 'center',
    },
    comboCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    comboHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    comboTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
        flex: 1,
    },
    comboDate: {
        fontSize: 12,
        color: '#999',
    },
    comboText: {
        fontSize: 15,
        color: '#4ECDC4',
        fontWeight: '600',
        lineHeight: 22,
        marginBottom: 15,
    },
    comboActions: {
        flexDirection: 'row',
        gap: 10,
    },
    copyButton: {
        flex: 1,
        backgroundColor: '#4ECDC4',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    copyButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    deleteButton: {
        flex: 1,
        backgroundColor: '#FF5252',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
