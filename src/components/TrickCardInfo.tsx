import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, ScrollView } from "react-native";
import { Linking } from "react-native";
import { Trick } from "../types";
import { TRICKS_DATA } from "../data/tricks";
import { SKILL_LEVELS } from "../data/skillLevels";

const { width, height } = Dimensions.get("window");
const MARGIN_TOP = 60; // Distance from top of screen
const MARGIN_SIDE = 20; // Distance from sides of screen
const displayWidth = width - (MARGIN_SIDE * 2); // card width with margin
const displayHeight = height - (MARGIN_TOP * 2); // card height with some padding

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
        backgroundColor: "#eee",
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    closeText: {
        fontSize: 22,
        color: "#888",
        fontWeight: "bold",
    },
    name: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#2C3E50",
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: "#7F8C8D",
        marginBottom: 12,
    },
    difficulty: {
        fontSize: 16,
        color: "#E67E22",
        marginBottom: 12,
    },
    preReq: {
        fontSize: 16,
        color: "#4ECDC4",
        marginBottom: 12,
    },
    tutorialButton: {
        marginTop: 12,
        backgroundColor: '#FF5252',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignSelf: 'center',
    },
    tutorialButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

interface TrickCardInfoProps {
    trick: Trick;
    onClose: () => void;
}

export const TrickCardInfo: React.FC<TrickCardInfoProps> = ({ trick, onClose }) => {
    const skillLevelName = typeof trick.difficulty === 'number' ? SKILL_LEVELS[trick.difficulty].name : 'Unknown';
    const preReqNames =
        trick.prerequisites && trick.prerequisites.length > 0
            ? trick.prerequisites.map((id: string) => {
                const found = TRICKS_DATA.find((t) => t.id === id);
                return found ? found.name : id;
            })
            : [];

    // Animation values
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: false,
        }).start();
    }, [anim]);

    // Interpolate for fly-in and expand
    const animatedStyle = {
        top: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0], // stays at top
        }),
        left: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0], // stays at left
        }),
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
                <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
                    <Text style={styles.name}>{trick.name}</Text>
                    <Text style={styles.difficulty}>Skill Level: {skillLevelName}</Text>
                    <Text style={styles.description}>Description: {trick.description}</Text>
                    <Text style={styles.preReq}>
                        PreRequisites: {preReqNames.length > 0 ? preReqNames.join(", ") : "None"}
                    </Text>
                    {trick.tutorialUrl && (
                        <TouchableOpacity
                            style={styles.tutorialButton}
                            onPress={() => Linking.openURL(trick.tutorialUrl!)}
                        >
                            <Text style={styles.tutorialButtonText}>Tutorial</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </Animated.View>
        </View>
    );
};