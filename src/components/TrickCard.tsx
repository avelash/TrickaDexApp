import React, { useState } from "react";
import { Linking } from "react-native";
import { TrickCardInfo } from "./TrickCardInfo";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Pressable,
    Image
} from "react-native";
import { Trick } from "../types";

interface TrickCardProps {
    trick: Trick;
    isLanded: boolean;
    onToggle: () => void;
    onInfo: (trick: Trick) => void;
}

export const TrickCard: React.FC<TrickCardProps> = ({
    trick,
    isLanded,
    onToggle,
    onInfo,
}) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const flipToFront = () => setIsFlipped(false);
    const flipToBack = () => setIsFlipped(true);

    return (
        <>
            {isFlipped && (
                <Pressable style={styles.overlay} onPress={flipToFront} />
            )}

            <View style={styles.cardContainer}>
                {!isFlipped ? (
                    <TouchableOpacity
                        style={styles.front}
                        activeOpacity={0.7}
                        onPress={onToggle}
                    >
                        <View style={[styles.iconContainer, isLanded && styles.iconContainerLanded]}>
                            <Image
                                source={trick.icon}
                                style={[styles.iconImage, !isLanded && styles.iconGreyed]}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.bottomBar}>
                            <Text style={[styles.trickName, !isLanded && styles.textGreyed]}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {trick.name}
                            </Text>
                            <TouchableOpacity onPress={() => onInfo(trick)}>
                                <Image
                                    source={require('../../assets/info.png')}
                                    style={styles.infoIcon}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.back}>
                        <TouchableOpacity style={styles.closeButton} onPress={flipToFront}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>
                        <Text style={styles.trickTypes}>
                            {trick.types.map((t) => `#${t}`).join(" ")}
                        </Text>
                        <Text style={styles.trickDescription}>{trick.description}</Text>
                        {trick.tutorialUrl && (
                            <TouchableOpacity
                                style={styles.tutorialButton}
                                onPress={() => Linking.openURL(trick.tutorialUrl!)}
                            >
                                <Text style={styles.tutorialButtonText}>Tutorial</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
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
    front: {
        flex: 1,
        width: "100%",
        height: "100%",
        justifyContent: "flex-end",
        alignItems: "center",
        overflow: "hidden",
    },
    iconContainer: {
        width: 140,
        height: 110,
        borderRadius: 18,
        backgroundColor: "#F0F0F0",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 5,
        overflow: "hidden",
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
        marginBottom:2
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
    back: {
        position: "relative",
        width: "100%",
        height: "100%",
        padding: 16,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    closeButton: {
        position: "absolute",
        top: 0,
        right: 0,
        padding: 5,
    },
    closeText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#E74C3C",
    },
    trickTypes: {
        fontSize: 12,
        color: "#4ECDC4",
        fontWeight: "600",
        marginBottom: 4,
        marginTop: 25,
    },
    trickDescription: {
        fontSize: 13,
        color: "#7F8C8D",
    },
    tutorialButton: {
        marginTop: 12,
        backgroundColor: '#FF5252',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 16,
    },
    tutorialButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
});
