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
    dropZoneLayout?: { x: number; y: number; width: number; height: number } | null;
    comboTricks?: Trick[];
    onDragStart?: (layout: { x: number; y: number; width: number; height: number }) => void;
    onDragMove?: (translateX: number, translateY: number) => void;
    onDragEnd?: () => void;
    onDragPositionChange?: (position: number | null) => void; // NEW: Report hover position
}

export const DraggableTrickCard: React.FC<DraggableTrickCardProps> = ({
    trick,
    onDrop,
    dropZoneLayout,
    comboTricks = [],
    onDragStart,
    onDragMove,
    onDragEnd,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(1)).current; // Add opacity for ghost effect

    // Store the card's absolute position
    const cardLayout = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
    const viewRef = useRef<View>(null);

    const onGestureEvent = Animated.event(
        [
            {
                nativeEvent: {
                    translationX: translateX,
                    translationY: translateY,
                },
            },
        ],
        {
            useNativeDriver: true,
            listener: (event: any) => {
                // Pass translation to parent for overlay
                if (onDragMove) {
                    onDragMove(event.nativeEvent.translationX, event.nativeEvent.translationY);
                }
            }
        }
    );

    const handleLayout = () => {
        if (viewRef.current) {
            viewRef.current.measureInWindow((x, y, width, height) => {
                cardLayout.current = { x, y, width, height };
            });
        }
    };

    const calculateDropPosition = (absoluteX: number, absoluteY: number): number => {
        if (!dropZoneLayout || comboTricks.length === 0) {
            return 0; // Drop at beginning if empty
        }

        // Check if dropped over the drop zone
        const isOverDropZone =
            absoluteX >= dropZoneLayout.x &&
            absoluteX <= dropZoneLayout.x + dropZoneLayout.width &&
            absoluteY >= dropZoneLayout.y &&
            absoluteY <= dropZoneLayout.y + dropZoneLayout.height;

        if (!isOverDropZone) {
            return -1; // Not over drop zone
        }

        // Calculate position based on X coordinate within drop zone
        // Each card is ~120px wide + 10px margin + ~33px for arrow = ~163px per card
        const CARD_WIDTH = 163;
        const relativeX = absoluteX - dropZoneLayout.x;
        const position = Math.floor(relativeX / CARD_WIDTH);

        return Math.max(0, Math.min(position, comboTricks.length));
    };

    const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
        if (event.nativeEvent.state === State.BEGAN) {
            setIsDragging(true);
            handleLayout(); // Update card position when drag starts

            // Notify parent about drag start with card layout
            if (cardLayout.current && onDragStart) {
                onDragStart(cardLayout.current);
            }

            Animated.parallel([
                Animated.spring(scale, {
                    toValue: 1.1,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3, // Make original card semi-transparent
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }

        if (event.nativeEvent.state === State.END) {
            setIsDragging(false);

            // Calculate absolute position of the dragged card
            if (cardLayout.current && dropZoneLayout) {
                const draggedX = cardLayout.current.x + event.nativeEvent.translationX;
                const draggedY = cardLayout.current.y + event.nativeEvent.translationY;

                const dropPosition = calculateDropPosition(draggedX, draggedY);

                if (dropPosition >= 0) {
                    // Valid drop - call onDrop
                    onDrop(trick, dropPosition);
                }
            }

            // Notify parent about drag end
            if (onDragEnd) {
                onDragEnd();
            }

            // Reset animation
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
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }

        if (event.nativeEvent.state === State.CANCELLED) {
            setIsDragging(false);

            // Notify parent about drag end
            if (onDragEnd) {
                onDragEnd();
            }

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
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 150,
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
                ref={viewRef}
                onLayout={handleLayout}
                style={[
                    styles.cardContainer,
                    {
                        transform: [
                            { translateX },
                            { translateY },
                            { scale },
                        ],
                        opacity, // Add opacity animation
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
        borderColor: '#D0D7DE',
        borderWidth: 1,
        elevation: 5,
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