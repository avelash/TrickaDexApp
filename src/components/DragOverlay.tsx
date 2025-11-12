import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Image, Animated } from 'react-native';
import { Trick } from '../types';

interface DragOverlayProps {
    trick: Trick | null;
    startPosition: { x: number; y: number } | null;
    translateX: Animated.Value;
    translateY: Animated.Value;
}

export const DragOverlay: React.FC<DragOverlayProps> = ({
    trick,
    startPosition,
    translateX,
    translateY,
}) => {
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (trick && startPosition) {
            // Animate scale when drag starts
            Animated.spring(scale, {
                toValue: 1.1,
                useNativeDriver: true,
            }).start();
        } else {
            // Reset scale when drag ends
            scale.setValue(1);
        }
    }, [trick, startPosition]);

    if (!trick || !startPosition) {
        return null;
    }

    return (
        <View style={styles.overlayContainer} pointerEvents="none">
            <Animated.View
                style={[
                    styles.cardContainer,
                    {
                        position: 'absolute',
                        left: startPosition.x,
                        top: startPosition.y,
                        transform: [
                            { translateX },
                            { translateY },
                            { scale },
                        ],
                    },
                ]}
            >
                <View style={styles.front}>
                    <View style={styles.iconContainer}>
                        <Image
                            source={trick.icon}
                            style={styles.iconImage}
                            resizeMode="contain"
                        />
                    </View>
                    <View style={styles.bottomBar}>
                        <Text
                            style={styles.trickName}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {trick.name}
                        </Text>
                    </View>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 10000,
        elevation: 10000,
    },
    cardContainer: {
        backgroundColor: 'white',
        borderRadius: 18,
        padding: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        width: 145,
        height: 145,
        overflow: 'hidden',
        justifyContent: 'flex-end',
        alignItems: 'center',
        elevation: 20,
    },
    front: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
        overflow: 'hidden',
    },
    iconContainer: {
        width: 120,
        height: 95,
        borderRadius: 16,
        backgroundColor: '#E9F7F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
        overflow: 'hidden',
    },
    iconImage: {
        width: 85,
        height: 85,
        resizeMode: 'contain',
    },
    bottomBar: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingBottom: 8,
        paddingTop: 5,
        backgroundColor: '#fff',
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
    },
    trickName: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#2C3E50',
        textAlign: 'center',
    },
});