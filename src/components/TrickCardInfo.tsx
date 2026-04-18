import React, { useRef, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
  Image,
  Linking,
  BackHandler,
} from "react-native";
import { Trick } from "../types";
import { TRICKS_DATA } from "../data/tricks";
import { SKILL_LEVELS } from "../data/skillLevels";
import { useTrickFavorites } from "../hooks/useTrickFavorites";
import { useExcludedTricks } from "../hooks/useExcludedTricks";

const { width, height } = Dimensions.get("window");
const MARGIN_TOP = 60;
const MARGIN_BOTTOM = 120; // Extra margin for the bottom tabs
const MARGIN_SIDE = 20;
const displayWidth = width - MARGIN_SIDE * 2;
const displayHeight = height - MARGIN_TOP - MARGIN_BOTTOM;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: MARGIN_TOP,
    left: MARGIN_SIDE,
    width: displayWidth,
    height: displayHeight,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  animatedContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: displayWidth,
    height: displayHeight,
    zIndex: 10000,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    elevation: 5,
  },
  contentContainer: {
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 2,
    backgroundColor: "transparent",
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    fontSize: 22,
    color: "#888",
    fontWeight: "bold",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 16,
    paddingRight: 40,
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2C3E50",
    marginRight: 10,
    flexShrink: 1,
  },
  icon: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  paragraph: {
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
    textAlign: "justify",
    marginBottom: 12,
  },
  difficulty: {
    fontWeight: "bold",
    color: "#2C3E50",
  },
  preReq: {
    fontWeight: "bold",
    color: "#2C3E50",
  },
  tutorialButton: {
    marginTop: 16,
    backgroundColor: "#FF5252",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignSelf: "center",
  },
  tutorialButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  favoriteButton: {
    padding: 8,
    marginLeft: "auto",
  },
  favoriteIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
    tintColor: "#f44337ff",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    left: 24,
    zIndex: 2,
  },
  checkboxRender: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: "#2C3E50",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  checkboxInner: {
    width: 8,
    height: 8,
    backgroundColor: "#FF5252",
    borderRadius: 2,
  },
  checkboxLabel: {
    fontSize: 12,
    color: "#777",
  },
});

interface TrickCardInfoProps {
  trick: Trick;
  onClose: () => void;
}

export const TrickCardInfo: React.FC<TrickCardInfoProps> = ({
  trick,
  onClose,
}) => {
  const { isTrickFavorite, toggleFavorite } = useTrickFavorites();
  const { isTrickExcluded, toggleExcluded } = useExcludedTricks();
  const isFavorite = isTrickFavorite(trick.id);
  const isExcluded = isTrickExcluded(trick.id);

  const skillLevelColor =
    typeof trick.difficulty === "number"
      ? SKILL_LEVELS[trick.difficulty].color
      : "#000";
  const skillLevelName =
    typeof trick.difficulty === "number"
      ? SKILL_LEVELS[trick.difficulty].name
      : "Unknown";

  const preReqNames =
    trick.prerequisites && trick.prerequisites.length > 0
      ? trick.prerequisites
        .map((id: string) => {
          const found = TRICKS_DATA.find((t) => t.id === id);
          return found ? found.name : id;
        })
        .join(", ")
      : "None";

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [anim]);

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        onClose();
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
    }, [onClose])
  );

  const animatedStyle = {
    width: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [60, displayWidth],
    }),
    height: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [60, displayHeight],
    }),
    borderRadius: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [30, 20],
    }),
    backgroundColor: "#fff",
    elevation: 5,
  };

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.animatedContainer, animatedStyle]}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          {/* Title */}
          <View style={styles.headerRow}>
            <Text style={styles.name}>{trick.name}</Text>
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(trick.id)}
            >
              <Image
                source={
                  isFavorite
                    ? require("../../assets/heart_filled.png")
                    : require("../../assets/heart_outline.png")
                }
                style={styles.favoriteIcon}
              />
            </TouchableOpacity>
          </View>
          {/* Icon */}
          <View style={{ alignItems: "center", marginBottom: 10 }}>
            {trick.icon && <Image source={trick.icon} style={styles.icon} />}
          </View>

          {/* Main text section */}
          <Text style={styles.paragraph}>
            {trick.description}{"\n\n"}
            <Text style={styles.difficulty}>
              Skill Level:
            </Text>
            {"   "}
            <Text style={{ color: skillLevelColor }}>{skillLevelName}</Text>

          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.preReq}>Prerequisites:</Text> {preReqNames}.
          </Text>

          {trick.tutorialUrl && (
            <TouchableOpacity
              style={styles.tutorialButton}
              onPress={() => Linking.openURL(trick.tutorialUrl!)}
            >
              <Text style={styles.tutorialButtonText}>Watch Tutorial</Text>
            </TouchableOpacity>
          )}

        </ScrollView>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => toggleExcluded(trick.id)}
          activeOpacity={0.7}
        >
          <View style={styles.checkboxRender}>
            {isExcluded && <View style={styles.checkboxInner} />}
          </View>
          <Text style={styles.checkboxLabel}>Do not include in random combos</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};
