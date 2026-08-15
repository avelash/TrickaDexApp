import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SKILL_LEVELS } from "../../data/skillLevels";
import { useLabels, useLanguage } from "../../i18n";
import { ParticleBurst } from "./ParticleBurst";
import { celebrationFeedback } from "../../utils/haptics";

interface LevelUpOverlayProps {
  levelIndex: number;
  onDismiss: () => void;
}

/**
 * The big celebration: a full-screen takeover when the rider reaches a new
 * skill level. Deliberately heavier than the per-trick toast so levelling up
 * reads as a genuine milestone.
 */
export const LevelUpOverlay: React.FC<LevelUpOverlayProps> = ({
  levelIndex,
  onDismiss,
}) => {
  const { t } = useLanguage();
  const { levelLabel } = useLabels();
  const level = SKILL_LEVELS[levelIndex];

  const enter = useRef(new Animated.Value(0)).current;
  const shine = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    celebrationFeedback();

    Animated.sequence([
      Animated.spring(enter, {
        toValue: 1,
        friction: 6,
        tension: 55,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(shine, {
            toValue: 1,
            duration: 1400,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(shine, {
            toValue: 0,
            duration: 1400,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, [enter, shine]);

  const badgeScale = enter.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const pulse = shine.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onDismiss}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onDismiss}
      >
        {/* Two bursts at different spreads read as depth rather than one flat pop. */}
        <ParticleBurst burstKey={`lvl-${levelIndex}-a`} count={26} spread={220} size={12} />
        <ParticleBurst burstKey={`lvl-${levelIndex}-b`} count={20} spread={320} size={9} fall />

        <Animated.View
          style={[
            styles.content,
            { opacity: enter, transform: [{ scale: badgeScale }] },
          ]}
        >
          <Text style={styles.eyebrow}>{t("celebrate.levelUpEyebrow")}</Text>

          <Animated.View
            style={[
              styles.badge,
              {
                borderColor: level.color,
                shadowColor: level.color,
                transform: [{ scale: pulse }],
              },
            ]}
          >
            <Text style={[styles.levelNumber, { color: level.color }]}>
              {levelIndex}
            </Text>
          </Animated.View>

          <Text style={[styles.levelName, { color: level.color }]}>
            {levelLabel(levelIndex)}
          </Text>
          <Text style={styles.subtitle}>{t("celebrate.levelUpSubtitle")}</Text>

          <View style={[styles.button, { backgroundColor: level.color }]}>
            <Text style={styles.buttonText}>{t("celebrate.continue")}</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.82)",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  content: {
    alignItems: "center",
  },
  eyebrow: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 3,
    color: "#E2E8F0",
    marginBottom: 22,
  },
  badge: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 26,
    elevation: 20,
  },
  levelNumber: {
    fontSize: 62,
    fontWeight: "900",
  },
  levelName: {
    fontSize: 34,
    fontWeight: "900",
    marginTop: 22,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#CBD5E1",
    marginTop: 10,
    textAlign: "center",
  },
  button: {
    marginTop: 34,
    paddingVertical: 13,
    paddingHorizontal: 44,
    borderRadius: 26,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
});
