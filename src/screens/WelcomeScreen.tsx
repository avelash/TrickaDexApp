import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, StatusBar, Image, Dimensions, TextInput, Button, Modal } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../App'; // adjust path if needed

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WelcomeScreen'>;

export const WelcomeScreen: React.FC = () => {
    const navigation = useNavigation<WelcomeScreenNavigationProp>();
    const { width, height } = Dimensions.get('window');

    const [name, setName] = useState('');
    const [showNameModal, setShowNameModal] = useState(false);

    useEffect(() => {
        const checkName = async () => {
            const storedName = await AsyncStorage.getItem('userName');
            if (!storedName) {
                setShowNameModal(true); // ask for name
            }
        };
        checkName();
    }, []);

    const handleSaveName = async () => {
        if (name.trim()) {
            await AsyncStorage.setItem('userName', name.trim());
            setShowNameModal(false);
        }
    };


    useEffect(() => {
        // Only start timer if modal is hidden
        if (!showNameModal) {
            const timer = setTimeout(() => {
                navigation.replace('MainTabs');
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [showNameModal, navigation]);

    const icons = [
        require('../../assets/540_icon.png'),
        require('../../assets/backflip_icon.png'),
        require('../../assets/bhs_icon.png'),
        require('../../assets/cartwheel_icon.png'),
        require('../../assets/handstand_icon.png'),
        require('../../assets/hook_icon.png'),
        require('../../assets/round_icon.png'),
        require('../../assets/tornado_icon.png'),
        require('../../assets/scoot_icon.png'),
        require('../../assets/rocketboi_icon.png'),
        require('../../assets/corkRodeo_icon.png'),
        require('../../assets/btwistShuriken_icon.png')
    ];

    const percentPositions = [
        { top: 8, left: 30 },
        { top: 15, left: 70 },
        { top: 70, left: 15 },
        { top: 80, left: 65 },
        { top: 30, left: 40 },
        { top: 60, left: 80 },
        { top: 50, left: 5 },
        { top: 85, left: 40 },
        { top: 40, left: 75 },
        { top: 75, left: 40 },
        { top: 20, left: 10 },
        { top: 60, left: 45 }
    ];

    const iconPositions = percentPositions.map(pos => ({
        top: (pos.top / 100) * height,
        left: (pos.left / 100) * width,
    }));

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content"/>
            {icons.map((icon, idx) => (
                <Image
                    key={idx}
                    source={icon}
                    style={[styles.bgIcon, iconPositions[idx]]}
                    resizeMode="contain"
                />
            ))}
            <View style={styles.centerContent}>
                <Text style={styles.appName}>TrickaDex</Text>
                <Text style={styles.subtitle}>Track your tricking journey</Text>
            </View>

            {/* Name input modal */}
            <Modal visible={showNameModal} transparent={true} animationType="fade">
                <View style={styles.modalBackground}>
                    <View style={styles.modalContent}>
                        <Text style={styles.label}>What's your name?</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your name"
                            value={name}
                            onChangeText={setName}
                        />
                        <Button title="Save" onPress={handleSaveName} />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bgIcon: {
        position: 'absolute',
        width: 80,
        height: 80,
        opacity: 0.5,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appName: {
        fontSize: 54,
        fontWeight: 'bold',
        color: '#222',
        letterSpacing: 2,
        marginBottom: 18,
        textAlign: 'center',
        //fontFamily: 'sans-serif-condensed',
    },
    subtitle: {
        fontSize: 20,
        color: '#444',
        opacity: 0.8,
        textAlign: 'center',
        fontWeight: '500',
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 30,
        borderRadius: 12,
        width: '80%',
        alignItems: 'center',
    },
    label: { fontSize: 18, marginBottom: 10 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        width: '100%',
        marginBottom: 10,
    },
});
