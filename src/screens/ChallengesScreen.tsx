import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TRICKS_DATA } from '../data/tricks';
import { useTrickProgress } from '../hooks/useTrickProgress';
import { useChallenges } from '../hooks/useChallenges';
import { ChallengeCard } from '../components/ChallengeCard';
import { useLanguage } from '../i18n';

export const ChallengesScreen: React.FC = () => {
    const { t } = useLanguage();
    const insets = useSafeAreaInsets();
    const { landedTricks } = useTrickProgress();
    const {
        xp, rank, rankProgress, xpToNextRank, streak,
        daily, weekly, isCompleted, complete, swapsLeft, swap,
    } = useChallenges(TRICKS_DATA, landedTricks);

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#7C3AED" hidden={true} />

            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <Text style={styles.headerTitle}>{t('challenge.title')}</Text>
                {streak > 0 && (
                    <Text style={styles.streak}>
                        🔥 {t('challenge.streak', { count: streak })}
                    </Text>
                )}
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Rank progress is driven entirely by challenge XP. */}
                <View style={styles.xpCard}>
                    <View style={styles.xpHeaderRow}>
                        <Text style={styles.xpRank}>{t('xp.rank', { rank })}</Text>
                        <Text style={styles.xpTotal}>{t('xp.total', { count: xp })}</Text>
                    </View>
                    <View style={styles.xpBarBg}>
                        <View
                            style={[
                                styles.xpBarFill,
                                { width: `${Math.round(rankProgress * 100)}%` },
                            ]}
                        />
                    </View>
                    <Text style={styles.xpHint}>
                        {t('xp.toNext', { count: xpToNextRank })}
                    </Text>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.swapsLeft}>
                        {swapsLeft > 0
                            ? t('challenge.swapsLeft', { count: swapsLeft })
                            : t('challenge.noSwaps')}
                    </Text>
                </View>

                {daily && (
                    <ChallengeCard
                        challenge={daily}
                        completed={isCompleted(daily)}
                        accent="#4ECDC4"
                        periodLabel={t('challenge.daily')}
                        canSwap={swapsLeft > 0}
                        onComplete={() => complete(daily)}
                        onSwap={() => swap('daily')}
                    />
                )}

                {weekly && (
                    <ChallengeCard
                        challenge={weekly}
                        completed={isCompleted(weekly)}
                        accent="#7C3AED"
                        periodLabel={t('challenge.weekly')}
                        canSwap={swapsLeft > 0}
                        onComplete={() => complete(weekly)}
                        onSwap={() => swap('weekly')}
                    />
                )}

                {!daily && !weekly && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>{t('challenge.none')}</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F7F7' },
    header: {
        backgroundColor: '#7C3AED',
        paddingHorizontal: 20,
        paddingBottom: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: { fontSize: 30, fontWeight: 'bold', color: 'white' },
    streak: { fontSize: 13, fontWeight: '700', color: '#FDE68A' },
    scrollView: { flex: 1 },
    scrollContent: { padding: 15, paddingBottom: 40 },
    xpCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 16,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: '#EDE9FE',
    },
    xpHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    xpRank: { fontSize: 14, fontWeight: '800', color: '#7C3AED', letterSpacing: 1 },
    xpTotal: { fontSize: 14, fontWeight: '700', color: '#6B7280' },
    xpBarBg: {
        height: 10,
        backgroundColor: '#EDE9FE',
        borderRadius: 5,
        marginTop: 10,
        overflow: 'hidden',
    },
    xpBarFill: { height: '100%', backgroundColor: '#7C3AED', borderRadius: 5 },
    xpHint: { fontSize: 12, color: '#9CA3AF', marginTop: 8 },
    sectionHeader: { marginBottom: 10, alignItems: 'flex-end' },
    swapsLeft: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
    emptyState: { paddingVertical: 60, alignItems: 'center' },
    emptyText: { fontSize: 15, color: '#9CA3AF', textAlign: 'center' },
});
