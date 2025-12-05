import React, { useRef, useEffect } from "react";
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
} from "react-native";
import { Trick } from "../types";
import { TRICKS_DATA } from "../data/tricks";
import { SKILL_LEVELS } from "../data/skillLevels";
import { useTrickFavorites } from "../hooks/useTrickFavorites";

const { width, height } = Dimensions.get("window");
const MARGIN_TOP = 60;
const MARGIN_SIDE = 20;
const displayWidth = width - MARGIN_SIDE * 2;
const displayHeight = height - MARGIN_TOP * 2;

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
    width: displayWidth,
    height: displayHeight,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 24,
    elevation: 5,
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
  const isFavorite = isTrickFavorite(trick.id);

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

        <ScrollView style={styles.container}>
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
      </Animated.View>
    </View>
  );
};
