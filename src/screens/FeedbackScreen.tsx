// FeedbackScreen.tsx
import React, { useMemo, useState } from "react";
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { useLanguage } from "../i18n";

const FeedbackScreen: React.FC = () => {
    const { t } = useLanguage();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const insets = useSafeAreaInsets();

    // dropdown states
    const [open, setOpen] = useState(false);
    const [subject, setSubject] = useState("Bug Report");
    // Values stay English because they are submitted to the feedback backend;
    // only the labels are translated.
    const items = useMemo(
        () => [
            { label: t("feedback.subjectBug"), value: "Bug Report" },
            { label: t("feedback.subjectContributeDev"), value: "Contribute to Development" },
            { label: t("feedback.subjectContributeFunds"), value: "Contribute Funds" },
            { label: t("feedback.subjectWrongInfo"), value: "Wrong Trick Info" },
        ],
        [t]
    );

    // navigation (typed)
    type FeedbackNavigationProp = NativeStackNavigationProp<RootStackParamList, "FeedbackScreen">;
    const navigation = useNavigation<FeedbackNavigationProp>();

    const validate = () => {
        if (!name || name.length > 30) {
            Alert.alert(t("feedback.validationTitle"), t("feedback.validationName"));
            return false;
        }
        if (!email || email.length > 30) {
            Alert.alert(t("feedback.validationTitle"), t("feedback.validationEmail"));
            return false;
        }
        if (message.length < 20 || message.length > 300) {
            Alert.alert(t("feedback.validationTitle"), t("feedback.validationMessage"));
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

            Alert.alert(t("feedback.successTitle"), t("feedback.successMessage"));
            setName("");
            setEmail("");
            setMessage("");
            setSubject("Bug Report");
        } catch (error) {
            Alert.alert(t("feedback.errorTitle"), t("feedback.errorMessage"));
            console.error(error);
        } finally {
            setLoading(false);
            navigation.replace("MainTabs");
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" hidden={true} />
            <View style={[styles.header, { height: insets.top + 60 }]}>
                <TouchableOpacity style={[styles.backButton, { paddingTop: insets.top + 20 }]} onPress={navigation.goBack}>
                    <Image source={require("../../assets/return.png")} style={styles.backIcon} />
                </TouchableOpacity>
            </View>

            <View style={[styles.card, { top: insets.top + 40 }]}>
                <Text style={styles.title}>{t("feedback.title")}</Text>

                <TextInput
                    placeholder={t("feedback.namePlaceholder")}
                    value={name}
                    onChangeText={setName}
                    maxLength={30}
                    style={styles.input}
                />

                <TextInput
                    placeholder={t("feedback.emailPlaceholder")}
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
                        setItems={() => { }}
                        placeholder={t("feedback.subjectPlaceholder")}
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
                    placeholder={t("feedback.messagePlaceholder")}
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
                        <Text style={styles.buttonText}>{t("feedback.submit")}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F7F7F7",
        alignItems: "center",
    },
    header: {
        width: "100%",
        backgroundColor: "#4ECDC4",
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: 20,
    },
    backIcon: { width: 24, height: 24, tintColor: "white", resizeMode: "contain" },
    card: {
        position: "absolute",
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
