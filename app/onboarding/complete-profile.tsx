import { useApi } from "@/lib/api";
import i18n from "@/lib/i18n";
import { useAuth, useUser } from "@clerk/expo";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CompleteProfileScreen() {
    const insets = useSafeAreaInsets();
    const { user } = useUser();
    const { userId } = useAuth();
    const api = useApi();

    const [username, setUsername] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleContinue = async () => {
        setError("");

        if (username.trim().length < 2) {
            setError(i18n.t("usernameTooShort"));
            return;
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            setError(i18n.t("usernameInvalidChars"));
            return;
        }

        setLoading(true);
        try {
            const email = user?.primaryEmailAddress?.emailAddress;
            await api.syncUser(userId!, username.trim(), email!);
            router.replace("/(tabs)" as any);
        } catch (err: any) {
            const message = err?.message || "";
            if (message.toLowerCase().includes("username") || message.toLowerCase().includes("taken")) {
                setError(i18n.t("usernameTaken"));
            } else {
                setError(i18n.t("somethingWentWrong"));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-black"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
        >
            <View className="flex-1 px-7 justify-center" style={{ paddingTop: insets.top }}>
                <Text className="text-white text-3xl font-extrabold mb-2">{i18n.t("chooseUsername")}</Text>
                <Text className="text-[#888] text-base mb-8">{i18n.t("chooseUsernameSubtitle")}</Text>

                <TextInput
                    className={`bg-[#111] border rounded-2xl px-5 py-5 text-white text-lg mb-2 ${error ? "border-red-500" : "border-[#282828]"}`}
                    placeholder={i18n.t("usernamePlaceholder")}
                    placeholderTextColor="#444"
                    value={username}
                    onChangeText={(v) => { setUsername(v); setError(""); }}
                    autoCapitalize="none"
                    autoFocus
                />
                {error ? <Text className="text-red-500 text-sm font-medium mb-4">{error}</Text> : <View className="mb-6" />}

                <Pressable
                    className="bg-[#1DB954] rounded-full py-5 items-center"
                    onPress={handleContinue}
                    disabled={!username || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="black" />
                    ) : (
                        <Text className="text-black font-extrabold text-lg">{i18n.t("continue")}</Text>
                    )}
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}