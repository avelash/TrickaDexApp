import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const TestScreen: React.FC = () => {
    return (
        <View style={styles.container}>
            <Text>Test Screen Works!</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});