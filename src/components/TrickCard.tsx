import React, {memo } from "react";
import { Linking, StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import { Trick } from "../types";

interface TrickCardProps {
    trick: Trick;
    isLanded: boolean;
    onToggle: () => void;
    onInfo: (trick: Trick) => void;
}

const TrickCardComponent: React.FC<TrickCardProps> = ({
    trick,
    isLanded,
    onToggle,
    onInfo,
}) => {
    return (
        <View style={styles.cardContainer}>
            <TouchableOpacity
                style={styles.iconContainerWrapper}
                activeOpacity={0.7}
                onPress={onToggle}
            >
                <View
                    style={[
                        styles.iconContainer,
                        isLanded && styles.iconContainerLanded,
                    ]}
                >
                    <Image
                        source={trick.icon}
                        style={[styles.iconImage, !isLanded && styles.iconGreyed]}
                        resizeMode='contain'
                        resizeMethod='resize'
                    />
                </View>
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
                    {trick.name}
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
