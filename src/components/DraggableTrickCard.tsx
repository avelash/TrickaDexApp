import React, { useRef, useState } from 'react';
import { StyleSheet, View, Text, Image, Animated } from 'react-native';
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
    onDragPositionChange?: (position: number | null) => void;
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
    const cardLayout = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
    const viewRef = useRef<View>(null);

    const onGestureEvent = (event: any) => {
        if (onDragMove) {
            onDragMove(event.nativeEvent.translationX, event.nativeEvent.translationY);
        }
    };

    const handleLayout = () => {
        if (viewRef.current) {
            viewRef.current.measureInWindow((x, y, width, height) => {
                cardLayout.current = { x, y, width, height };
            });
        }
    };

    const calculateDropPosition = (absoluteX: number, absoluteY: number): number => {
        if (!dropZoneLayout || comboTricks.length === 0) return 0;

        const isOverDropZone =
            absoluteX >= dropZoneLayout.x &&
            absoluteX <= dropZoneLayout.x + dropZoneLayout.width &&
            absoluteY >= dropZoneLayout.y &&
            absoluteY <= dropZoneLayout.y + dropZoneLayout.height;

        if (!isOverDropZone) return -1;

        const CARD_WIDTH = 163;
        const relativeX = absoluteX - dropZoneLayout.x;
        const position = Math.floor(relativeX / CARD_WIDTH);
        return Math.max(0, Math.min(position, comboTricks.length));
    };

    const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
        if (event.nativeEvent.state === State.BEGAN) {
            handleLayout();

            if (cardLayout.current && onDragStart) {
                onDragStart(cardLayout.current);
            }
        }

        if (event.nativeEvent.state === State.END || event.nativeEvent.state === State.CANCELLED) {
            if (cardLayout.current && dropZoneLayout) {
                const draggedX = cardLayout.current.x + event.nativeEvent.translationX;
                const draggedY = cardLayout.current.y + event.nativeEvent.translationY;

                const dropPosition = calculateDropPosition(draggedX, draggedY);
                if (dropPosition >= 0) {
                    onDrop(trick, dropPosition);
                }
            }

            if (onDragEnd) onDragEnd();
        }
    };

    return (
        <View ref={viewRef} onLayout={handleLayout} style={styles.cardContainer}>
            <PanGestureHandler
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onHandlerStateChange}
            >
                <Animated.View style={styles.iconContainer}>
                    <Image source={trick.icon} style={styles.iconImage} resizeMode="contain" />
                </Animated.View>
            </PanGestureHandler>

            <View style={styles.bottomBar}>
                <Text style={styles.trickName} numberOfLines={1} ellipsizeMode="tail">
                    {trick.name}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: 'white',
        borderRadius: 18,
        marginHorizontal: 8,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        width: 145,
        height: 145,
        alignItems: 'center',
        borderColor: '#D0D7DE',
        borderWidth: 1,
        elevation: 5,
        overflow: 'hidden',
        justifyContent: 'flex-end',
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
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 8,
        paddingTop: 5,
        backgroundColor: '#fff',
    },
    trickName: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#2C3E50',
        textAlign: 'center',
    },
});