import React, { memo, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import { Trick } from "../types";
import { useTrickText } from "../i18n";
import { ParticleBurst } from "./celebrations/ParticleBurst";
import { tapFeedback } from "../utils/haptics";

interface TrickCardProps {
    trick: Trick;
    isLanded: boolean;
    /** True when prerequisites are still unmet — shown as a locked card. */
    isLocked?: boolean;
    /**
     * Set only when the rider just landed this trick by tapping it. Progress
     * loads from storage asynchronously, so inferring the moment from isLanded
     * would fire the celebration for every landed card on app open.
     */
    justLanded?: boolean;
    onToggle: (trickId: string) => void;
    onInfo: (trick: Trick) => void;
}

const TrickCardComponent: React.FC<TrickCardProps> = ({
    trick,
    isLanded,
    isLocked = false,
    justLanded = false,
    onToggle,
    onInfo,
}) => {
    const { trickName } = useTrickText();
    const pop = useRef(new Animated.Value(1)).current;
    const wasCelebrated = useRef(justLanded);
    const [burstKey, setBurstKey] = useState(0);

    // Driven by the explicit tap signal, never by isLanded changing.
    useEffect(() => {
        if (justLanded && !wasCelebrated.current) {
            tapFeedback();
            setBurstKey(key => key + 1);
            Animated.sequence([
                Animated.spring(pop, {
                    toValue: 1.22,
                    friction: 4,
                    tension: 140,
                    useNativeDriver: true,
                }),
                Animated.spring(pop, {
                    toValue: 1,
                    friction: 5,
                    tension: 120,
                    useNativeDriver: true,
                }),
            ]).start();
        }
        wasCelebrated.current = justLanded;
    }, [justLanded, pop]);

    return (
        <View style={styles.cardContainer}>
            <TouchableOpacity
                style={styles.iconContainerWrapper}
                activeOpacity={0.7}
                onPress={() => onToggle(trick.id)}
            >
                <Animated.View
                    style={[
                        styles.iconContainer,
                        isLanded && styles.iconContainerLanded,
                        { transform: [{ scale: pop }] },
                    ]}
                >
                    {burstKey > 0 && (
                        <ParticleBurst
                            burstKey={burstKey}
                            count={10}
                            spread={46}
                            size={6}
                            duration={700}
                        />
                    )}
                    {isLocked && !isLanded && (
                        <View style={styles.lockBadge}>
                            <Text style={styles.lockGlyph}>🔒</Text>
                        </View>
                    )}
                    <Image
                        key={isLanded ? 'landed' : 'notLanded'}
                        source={trick.icon}
                        style={[styles.iconImage, !isLanded && styles.iconGreyed]}
                        resizeMode='contain'
                        resizeMethod='resize'
                    />
                </Animated.View>
            </TouchableOpacity>

            <View style={styles.bottomBar}>
                <Text
                    style={[
                        styles.trickName,
                        !isLanded && styles.textGreyed,
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {trickName(trick)}
                </Text>
                <TouchableOpacity onPress={() => onInfo(trick)}>
                    <Image
                        source={require("../../assets/info.png")}
                        style={styles.infoIcon}
                        resizeMode="contain"
                        resizeMethod="resize"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 0,
        margin: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        width: 170,
        height: 170,
        overflow: "hidden",
        justifyContent: "flex-end",
        alignItems: "center",
    },
    iconContainerWrapper: {
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    iconContainer: {
        width: 140,
        height: 110,
        borderRadius: 18,
        backgroundColor: "#F0F0F0",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        overflow: "hidden",
    },
    lockBadge: {
        position: 'absolute',
        top: 6,
        right: 8,
        zIndex: 5,
        opacity: 0.55,
    },
    lockGlyph: {
        fontSize: 13,
    },
    iconContainerLanded: {
        backgroundColor: "#E9F7F6",
    },
    iconImage: {
        width: 100,
        height: 100,
        resizeMode: "contain",
    },
    iconGreyed: {
        tintColor: "#abababff",
    },
    bottomBar: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingBottom: 10,
        paddingTop: 6,
        backgroundColor: "#fff",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        marginBottom: 2,
    },
    trickName: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#2C3E50",
        flex: 1,
    },
    textGreyed: {
        color: "#BDC3C7",
    },
    infoIcon: {
        width: 18,
        height: 18,
        marginLeft: 8,
        tintColor: "#BDC3C7",
    },
});
export const TrickCard = memo(TrickCardComponent);
