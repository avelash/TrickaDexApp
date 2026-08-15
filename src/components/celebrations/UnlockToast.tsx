import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Trick } from "../../types";
import { useLanguage, useTrickText } from "../../i18n";
import { ParticleBurst } from "./ParticleBurst";
import { successFeedback } from "../../utils/haptics";

interface UnlockToastProps {
  trick: Trick;
  /** Tricks that just became available because of this one. */
  unlocked: Trick[];
  onDismiss: () => void;
  onSelectTrick: (trick: Trick) => void;
}

const VISIBLE_MS = 3800;

/**
 * The small celebration shown after landing a trick. The payoff is the list of
 * tricks it opened up — that is what makes landing one feel like progress
 * rather than a checkbox.
 */
export const UnlockToast: React.FC<UnlockToastProps> = ({
  trick,
  unlocked,
  onDismiss,
  onSelectTrick,
}) => {
  const { t } = useLanguage();
  const { trickName } = useTrickText();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    successFeedback();

    Animated.spring(anim, {
      toValue: 1,
      friction: 7,
      tension: 60,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(anim, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => finished && onDismiss());
    }, VISIBLE_MS);

    return () => clearTimeout(timer);
  }, [anim, onDismiss, trick.id]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [140, 0],
  });

  return (
    <Animated.View
      style={[styles.wrapper, { opacity: anim, transform: [{ translateY }] }]}
      pointerEvents="box-none"
    >
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.iconWrap}>
            <ParticleBurst burstKey={trick.id} count={12} spread={52} size={7} />
            <Image source={trick.icon} style={styles.icon} resizeMode="contain" />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.landedLabel}>{t("celebrate.landed")}</Text>
            <Text style={styles.trickName} numberOfLines={1}>
              {trickName(trick)}
            </Text>
          </View>

          <TouchableOpacity
            onPress={onDismiss}
            style={styles.close}
            accessibilityLabel={t("common.close")}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {unlocked.length > 0 && (
          <View style={styles.unlockSection}>
            <Text style={styles.unlockTitle}>
              {t("celebrate.unlocked", { count: unlocked.length })}
            </Text>
            <View style={styles.unlockRow}>
              {unlocked.slice(0, 4).map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.unlockChip}
                  onPress={() => onSelectTrick(item)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={item.icon}
                    style={styles.unlockIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.unlockName} numberOfLines={1}>
                    {trickName(item)}
                  </Text>
                </TouchableOpacity>
              ))}
              {unlocked.length > 4 && (
                <Text style={styles.more}>+{unlocked.length - 4}</Text>
              )}
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 24,
    zIndex: 9000,
    elevation: 9000,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 12,
    borderWidth: 2,
    borderColor: "#4ECDC4",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 46,
    height: 46,
  },
  headerText: {
    flex: 1,
    marginHorizontal: 10,
  },
  landedLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4ECDC4",
    letterSpacing: 1,
  },
  trickName: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#1F2937",
  },
  close: {
    padding: 6,
  },
  closeText: {
    fontSize: 16,
    color: "#9CA3AF",
    fontWeight: "bold",
  },
  unlockSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 10,
  },
  unlockTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 8,
  },
  unlockRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  unlockChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    maxWidth: 150,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  unlockIcon: {
    width: 24,
    height: 24,
    marginRight: 6,
  },
  unlockName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    flexShrink: 1,
  },
  more: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94A3B8",
  },
});
