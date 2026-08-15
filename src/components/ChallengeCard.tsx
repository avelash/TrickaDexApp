import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Challenge } from "../data/challenges";
import { TRICKS_DATA } from "../data/tricks";
import { Trick } from "../types";
import { useLanguage, useTrickText } from "../i18n";

interface ChallengeCardProps {
  challenge: Challenge;
  completed: boolean;
  accent: string;
  periodLabel: string;
  canSwap: boolean;
  onComplete: () => void;
  onSwap: () => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  completed,
  accent,
  periodLabel,
  canSwap,
  onComplete,
  onSwap,
}) => {
  const { t } = useLanguage();
  const { trickName } = useTrickText();

  const tricks = challenge.trickIds
    .map(id => TRICKS_DATA.find(trick => trick.id === id))
    .filter(Boolean) as Trick[];

  if (tricks.length === 0) return null;

  const describe = () => {
    switch (challenge.kind) {
      case "reps":
        return t("challenge.reps", {
          count: challenge.reps ?? 0,
          trick: trickName(tricks[0]),
        });
      case "learn":
        return t("challenge.learn", { trick: trickName(tricks[0]) });
      case "combo":
        return t("challenge.combo");
      default:
        return "";
    }
  };

  return (
    <View style={[styles.card, completed && styles.cardDone]}>
      <View style={styles.header}>
        <View style={[styles.periodTag, { backgroundColor: accent }]}>
          <Text style={styles.periodText}>{periodLabel}</Text>
        </View>

        <View style={styles.headerRight}>
          {!completed && canSwap && (
            <TouchableOpacity
              onPress={onSwap}
              style={styles.swapButton}
              activeOpacity={0.7}
            >
              <Text style={styles.swapText}>⇄ {t("challenge.swap")}</Text>
            </TouchableOpacity>
          )}
          <Text style={[styles.xp, { color: accent }]}>+{challenge.xp} XP</Text>
        </View>
      </View>

      <Text style={styles.description}>{describe()}</Text>

      {challenge.kind === "combo" && (
        <View style={styles.comboRow}>
          {tricks.map((trick, index) => (
            <React.Fragment key={`${trick.id}-${index}`}>
              {index > 0 && <Text style={styles.arrow}>→</Text>}
              <View style={styles.comboItem}>
                <Image
                  source={trick.icon}
                  style={styles.comboIcon}
                  resizeMode="contain"
                />
                <Text style={styles.comboName} numberOfLines={1}>
                  {trickName(trick)}
                </Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      )}

      {challenge.kind !== "combo" && (
        <View style={styles.singleRow}>
          <Image
            source={tricks[0].icon}
            style={styles.singleIcon}
            resizeMode="contain"
          />
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: completed ? "#E2E8F0" : accent },
        ]}
        onPress={onComplete}
        disabled={completed}
        activeOpacity={0.8}
      >
        <Text
          style={[styles.buttonText, completed && styles.buttonTextDone]}
        >
          {completed ? t("challenge.done") : t("challenge.markDone")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardDone: {
    opacity: 0.72,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  periodTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  periodText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  swapButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  swapText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  xp: {
    fontWeight: "800",
    fontSize: 14,
  },
  description: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    lineHeight: 22,
  },
  singleRow: {
    alignItems: "center",
    marginTop: 10,
  },
  singleIcon: {
    width: 72,
    height: 72,
  },
  comboRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 4,
  },
  comboItem: {
    alignItems: "center",
    width: 70,
  },
  comboIcon: {
    width: 44,
    height: 44,
  },
  comboName: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "600",
    textAlign: "center",
  },
  arrow: {
    fontSize: 16,
    color: "#94A3B8",
    fontWeight: "700",
  },
  button: {
    marginTop: 14,
    paddingVertical: 11,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  buttonTextDone: {
    color: "#94A3B8",
  },
});
