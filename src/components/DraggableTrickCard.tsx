import React, { useRef, useState } from 'react';
import { StyleSheet, View, Text, Image, Animated, Platform } from 'react-native';
import {
    PanGestureHandler,
    PanGestureHandlerGestureEvent,
    State,
} from 'react-native-gesture-handler';
import { Trick } from '../types';

interface DraggableTrickCardProps {
    trick: Trick;
    onDrop: (trick: Trick, position: number) => void;
}

export const DraggableTrickCard: React.FC<DraggableTrickCardProps> = ({
    trick,
    onDrop,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1)).current;

    const onGestureEvent = Animated.event(
        [
            {
                nativeEvent: {
                    translationX: translateX,
                    translationY: translateY,
                },
            },
        ],
        { useNativeDriver: true }
    );

    const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
        if (event.nativeEvent.state === State.BEGAN) {
            setIsDragging(true);
            Animated.spring(scale, {
                toValue: 1.1,
                useNativeDriver: true,
            }).start();
        }

        if (event.nativeEvent.state === State.END || event.nativeEvent.state === State.CANCELLED) {
            setIsDragging(false);
            Animated.parallel([
                Animated.spring(translateX, {
                    toValue: 0,
                    useNativeDriver: true,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                }),
                Animated.spring(scale, {
                    toValue: 1,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    };

    return (
        <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
        >
            <Animated.View
                style={[
                    styles.cardContainer,
                    {
                        transform: [
                            { translateX },
                            { translateY },
                            { scale },
                        ],
                        zIndex: isDragging ? 9999 : 0,
                        elevation: isDragging ? 20 : 3,
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
        </PanGestureHandler>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: 'white',
        borderRadius: 18,
        padding: 0,
        marginHorizontal: 8,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        width: 145,
        height: 145,
        overflow: 'hidden',
        justifyContent: 'flex-end',
        alignItems: 'center',
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