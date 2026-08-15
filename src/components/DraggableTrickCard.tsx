import React, { useRef, useState } from 'react';
import { StyleSheet, View, Text, Image, Animated } from 'react-native';
import {
    Gesture,
    GestureDetector,
} from 'react-native-gesture-handler';
import { Trick } from '../types';
import { useTrickText } from '../i18n';
import { isPointInside } from '../utils/comboDragGeometry';
import { dragFeedback } from '../utils/haptics';

interface DraggableTrickCardProps {
    trick: Trick;
    onDrop: (trick: Trick) => void;
    dropZoneLayout?: { x: number; y: number; width: number; height: number } | null;
    comboTricks?: Trick[];
    onDragStart?: (layout: { x: number; y: number; width: number; height: number }) => void;
    onDragMove?: (translateX: number, translateY: number) => void;
    onDragEnd?: () => void;
    onDragPositionChange?: (position: number | null) => void;
}

const DraggableTrickCard: React.FC<DraggableTrickCardProps> = ({
    trick,
    onDrop,
    dropZoneLayout,
    comboTricks = [],
    onDragStart,
    onDragMove,
    onDragEnd,
}) => {
    const { trickName } = useTrickText();
    const cardLayout = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
    const viewRef = useRef<View>(null);
    const dragStartedRef = useRef(false);

    const onGestureEvent = (event: any) => {
        const movementDistance = Math.sqrt(
            event.translationX ** 2 +
            event.translationY ** 2
        );

        // Trigger drag start on first significant movement
        if (movementDistance > 2 && !dragStartedRef.current && cardLayout.current && onDragStart) {
            dragStartedRef.current = true;
            dragFeedback();
            onDragStart(cardLayout.current);
        }

        if (onDragMove) {
            onDragMove(event.translationX, event.translationY);
        }
    };

    const handleLayout = () => {
        if (viewRef.current) {
            viewRef.current.measureInWindow((x, y, width, height) => {
                cardLayout.current = { x, y, width, height };
            });
        }
    };

    // The screen owns the insert index (it tracks hover position and scroll),
    // so this only decides whether the drop lands inside the zone at all.
    const isOverDropZone = (absoluteX: number, absoluteY: number): boolean =>
        !!dropZoneLayout && isPointInside(dropZoneLayout, absoluteX, absoluteY);

    const panGesture = Gesture.Pan()
        .onStart(() => {
            handleLayout();
            dragStartedRef.current = false;
        })
        .onUpdate((event) => {
            onGestureEvent(event);
        })
        .onEnd((event) => {
            if (cardLayout.current && dropZoneLayout) {
                const draggedX = cardLayout.current.x + event.translationX;
                const draggedY = cardLayout.current.y + event.translationY;

                if (isOverDropZone(draggedX, draggedY)) {
                    onDrop(trick);
                }
            }

            if (onDragEnd) onDragEnd();
            dragStartedRef.current = false;
        });

    return (
        <View ref={viewRef} onLayout={handleLayout} style={styles.cardContainer}>
            <GestureDetector gesture={panGesture}>
                <Animated.View style={styles.iconContainer}>
                    <Image source={trick.icon} style={styles.iconImage} resizeMode="contain" resizeMethod='resize' />
                </Animated.View>
            </GestureDetector>

            <View style={styles.bottomBar}>
                <Text style={styles.trickName} numberOfLines={1} ellipsizeMode="tail">
                    {trickName(trick)}
                </Text>
            </View>
        </View>
    );
};
export default React.memo(DraggableTrickCard);

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