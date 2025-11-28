import React, { useRef, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Animated, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Trick } from '../types';

interface ComboDropZoneProps {
    tricks: Trick[];
    onRemoveTrick: (index: number) => void;
    onReorderTrick: (fromIndex: number, toIndex: number) => void;
    onLayout?: (layout: { x: number; y: number; width: number; height: number }) => void;
    isOver?: boolean;
    hoverIndex: number | null;
    draggedTrick: Trick | null;
    scrollViewRef?: React.RefObject<ScrollView | null>;
    onStartScroll?: (direction: 'left' | 'right') => void;
    onStopScroll?: () => void;
}

export const ComboDropZone: React.FC<ComboDropZoneProps> = ({
    tricks,
    onRemoveTrick,
    onReorderTrick,
    onLayout,
    isOver = false,
    hoverIndex,
    draggedTrick,
    scrollViewRef,
    onStartScroll,
    onStopScroll
}) => {
    const viewRef = useRef<View>(null);

    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        // We'll handle auto-scroll in the drag move handler instead
        if (onStopScroll) {
            onStopScroll();
        }
    }, [onStopScroll]);

    // Clean up auto-scroll when unmounting
    useEffect(() => {
        if (!isOver && onStopScroll) {
            onStopScroll();
        }
    }, [isOver, onStopScroll]);

    const measureDropZone = () => {
        if (viewRef.current && onLayout) {
            viewRef.current.measureInWindow((x, y, width, height) => {
                onLayout({ x, y, width, height });
            });
        }
    };

    const handleLayout = () => {
        if (viewRef.current && onLayout) {
            viewRef.current.measureInWindow((x, y, width, height) => {
                onLayout({ x, y, width, height });
            });
        }
    };

    if (tricks.length === 0) {
        return (
            <View
                ref={viewRef}
                onLayout={measureDropZone}
                style={[styles.emptyDropZone, isOver && styles.dropZoneActive]}
            >
                <Image style={styles.emptyDropZoneIcon} source={require('../../assets/down-arrow.png')} resizeMethod='resize'/>
                <Text style={styles.emptyDropZoneText}>Drag tricks here</Text>
                <Text style={styles.emptyDropZoneSubtext}>Build your combo by dragging tricks from above</Text>
            </View>
        );
    }

    return (
        <View
            ref={viewRef}
            onLayout={handleLayout}
            style={styles.dropZoneWrapper}
        >
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dropZoneContent}
                style={styles.dropZone}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {tricks.map((trick, index) => (
                    <React.Fragment key={`${trick.id}-${index}`}>
                        {isOver && draggedTrick && hoverIndex === index && (
                            <View style={styles.dropIndicator} />
                        )}
                        <View style={styles.comboCardWrapper}>
                            <View style={styles.comboCard}>
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => onRemoveTrick(index)}
                                >
                                    <Text style={styles.removeButtonText}>✕</Text>
                                </TouchableOpacity>
                                <View style={styles.comboIconContainer}>
                                    <Image
                                        source={trick.icon}
                                        style={styles.comboIconImage}
                                        resizeMode="contain"
                                        resizeMethod='resize'
                                    />
                                </View>
                                <Text
                                    style={styles.comboTrickName}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {trick.name}
                                </Text>
                            </View>
                        </View>
                    </React.Fragment>
                ))}
                {isOver && draggedTrick && hoverIndex === tricks.length && (
                    <View style={styles.dropIndicator} />
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    dropZoneWrapper: {
        // This wrapper helps with measurement
    },
    emptyDropZone: {
        height: 180,
        borderRadius: 20,
        borderWidth: 3,
        borderStyle: 'dashed',
        borderColor: '#BDC3C7',
        backgroundColor: '#F9F9F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    dropZoneActive: {
        borderColor: '#4ECDC4',
        backgroundColor: '#E9F7F6',
    },
    emptyDropZoneIcon: {
        height: 40,
        width: 40,
        resizeMode: 'contain',
        marginBottom: 10,
        tintColor: '#7F8C8D'
    },
    emptyDropZoneText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#7F8C8D',
        marginBottom: 5,
    },
    emptyDropZoneSubtext: {
        fontSize: 14,
        color: '#BDC3C7',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    dropZone: {
        minHeight: 180,
        maxHeight: 180,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: '#4ECDC4',
        backgroundColor: '#E9F7F6',
        marginBottom: 10,
    },
    dropZoneContent: {
        padding: 15,
        alignItems: 'center',
    },
    comboCardWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    comboCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 8,
        marginHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        width: 120,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    removeButton: {
        position: 'absolute',
        top: 2,
        right: 2,
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    removeButtonText: {
        color: 'grey',
        fontSize: 12,
        fontWeight: 'bold',
    },
    comboIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#E9F7F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    comboIconImage: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
    },
    comboTrickName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2C3E50',
        textAlign: 'center',
        paddingHorizontal: 4,
    },
    arrowContainer: {
        marginHorizontal: 5,
    },
    arrow: {
        fontSize: 24,
        color: '#4ECDC4',
        fontWeight: 'bold',
    },
    dropIndicator: {
        width: 120,
        height: 140,
        backgroundColor: '#4ECDC4',
        opacity: 0.2,
        borderRadius: 16,
        marginHorizontal: 5,
    },
});