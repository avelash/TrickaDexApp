// FeedbackScreen.tsx
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ActivityIndicator,
    StatusBar,
    Image,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

const FeedbackScreen: React.FC = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // dropdown states
    const [open, setOpen] = useState(false);
    const [subject, setSubject] = useState("Bug Report");
    const [items, setItems] = useState([
        { label: "Bug Report", value: "Bug Report" },
        { label: "Contribute to Development", value: "Contribute to Development" },
        { label: "Contribute Funds", value: "Contribute Funds" },
        { label: "Wrong Trick Info", value: "Wrong Trick Info" },
    ]);

    // navigation (typed)
    type FeedbackNavigationProp = NativeStackNavigationProp<RootStackParamList, "FeedbackScreen">;
    const navigation = useNavigation<FeedbackNavigationProp>();

    const validate = () => {
        if (!name || name.length > 30) {
            Alert.alert("Validation Error", "Name is required (max 30 characters).");
            return false;
        }
        if (!email || email.length > 30) {
            Alert.alert("Validation Error", "Email is required (max 30 characters).");
            return false;
        }
        if (message.length < 20 || message.length > 300) {
            Alert.alert("Validation Error", "Message must be between 20 and 300 characters.");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);

        try {
            const response = await fetch("https://sparkling-firefly-b4be.avrahamking.workers.dev/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    _replyto: "avrahamking@gmail.com",
                    _subject: "Feedback from app",
                    subject,
                    type: subject,
                    fullName: name,
                    email,
                    message,
                }),
            });

            if (!response.ok) throw new Error("Network response was not ok");

            Alert.alert("✅ Success", "Your feedback was sent successfully!");
            setName("");
            setEmail("");
            setMessage("");
            setSubject("Bug Report");
        } catch (error) {
            Alert.alert("❌ Error", "Failed to send feedback. Please try again later.");
            console.error(error);
        } finally {
            setLoading(false);
            navigation.replace("TrickListScreen");
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" hidden={true} />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={navigation.goBack}>
                    <Image source={require("../../assets/return.png")} style={styles.backIcon} />
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <Text style={styles.title}>Send Feedback</Text>

                <TextInput
                    placeholder="Your Name"
                    value={name}
                    onChangeText={setName}
                    maxLength={30}
                    style={styles.input}
                />

                <TextInput
                    placeholder="Your Email"
                    value={email}
                    onChangeText={setEmail}
                    maxLength={30}
                    keyboardType="email-address"
                    style={styles.input}
                />

                {/* Modern Dropdown */}
                <View style={{ zIndex: 10, marginBottom: 15 }}>
                    <DropDownPicker
                        open={open}
                        value={subject}
                        items={items}
                        setOpen={setOpen}
                        setValue={setSubject}
                        setItems={setItems}
                        placeholder="Select subject"
                        style={styles.dropdown}
                        dropDownContainerStyle={styles.dropdownContainer}
                        textStyle={styles.dropdownText}
                        listItemLabelStyle={{ color: "#333" }}
                        selectedItemLabelStyle={{ color: "#4ECDC4", fontWeight: "600" }}
                        arrowIconStyle={{ tintColor: "#4ECDC4" } as any
                    }
                    />
                </View>

                <TextInput
                    placeholder="Your Message"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    numberOfLines={5}
                    maxLength={300}
                    style={[styles.input, styles.messageBox]}
                />

                <TouchableOpacity
                    style={[styles.button, loading && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Submit</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F7F7F7",
        alignItems: "center",
    },
    header: {
        height: 100,
        width: "100%",
        backgroundColor: "#4ECDC4",
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: 20,
        paddingTop: 60,
    },
    backIcon: { width: 24, height: 24, tintColor: "white", resizeMode: "contain" },
    card: {
        position: "absolute",
        top: 80,
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        backgroundColor: "#fafafa",
    },
    messageBox: {
        height: 120,
        textAlignVertical: "top",
    },
    dropdown: {
        borderColor: "#ddd",
        borderRadius: 10,
        backgroundColor: "#fafafa",
    },
    dropdownContainer: {
        borderColor: "#ddd",
        borderRadius: 10,
    },
    dropdownText: {
        fontSize: 16,
        color: "#333",
    },
    button: {
        backgroundColor: "#4ECDC4",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: 5,
        shadowColor: "#4ECDC4",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
        elevation: 3,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default FeedbackScreen;
