import i18n from "@/lib/i18n";
import { useAuth, useSignUp } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Page() {
    const { signUp, fetchStatus } = useSignUp();
    const { isSignedIn } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [emailAddress, setEmailAddress] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [username, setUsername] = React.useState("");
    const [code, setCode] = React.useState("");
    const [showPassword, setShowPassword] = React.useState(false);

    // per-field errors
    const [usernameError, setUsernameError] = React.useState("");
    const [emailError, setEmailError] = React.useState("");
    const [passwordError, setPasswordError] = React.useState("");
    const [codeError, setCodeError] = React.useState("");

    useEffect(() => {
        if (signUp.status === "missing_requirements") {
            signUp.reset();
        }
    }, []);

    const parseClerkError = (err: any) => {
        const clerkErrors = err?.errors || [];

        // reset all field errors
        setUsernameError("");
        setEmailError("");
        setPasswordError("");

        if (clerkErrors.length === 0) {
            setUsernameError(i18n.t("somethingWentWrong"));
            return;
        }

        clerkErrors.forEach((e: any) => {
            const msg = e.longMessage || e.message || "";
            const meta = e.meta?.paramName || "";

            if (
                meta === "username" ||
                msg.toLowerCase().includes("username")
            ) {
                setUsernameError(
                    msg.toLowerCase().includes("taken") || msg.toLowerCase().includes("exist")
                        ? i18n.t("usernameTaken")
                        : msg.toLowerCase().includes("short") || msg.toLowerCase().includes("least")
                            ? i18n.t("usernameTooShort")
                            : msg.toLowerCase().includes("long") || msg.toLowerCase().includes("exceed")
                                ? i18n.t("usernameTooLong")
                                : msg.toLowerCase().includes("character") || msg.toLowerCase().includes("invalid")
                                    ? i18n.t("usernameInvalidChars")
                                    : msg
                );
            } else if (
                meta === "email_address" ||
                msg.toLowerCase().includes("email")
            ) {
                setEmailError(
                    msg.toLowerCase().includes("taken") || msg.toLowerCase().includes("exist") || msg.toLowerCase().includes("use")
                        ? i18n.t("emailTaken")
                        : msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("format")
                            ? i18n.t("emailInvalid")
                            : msg
                );
            } else if (
                meta === "password" ||
                msg.toLowerCase().includes("password")
            ) {
                setPasswordError(
                    msg.toLowerCase().includes("short") || msg.toLowerCase().includes("least")
                        ? i18n.t("passwordTooShort")
                        : msg.toLowerCase().includes("special") || msg.toLowerCase().includes("uppercase") || msg.toLowerCase().includes("number")
                            ? i18n.t("passwordTooWeak")
                            : msg
                );
            } else {
                // fallback — show under username
                setUsernameError(msg);
            }
        });
    };

    const handleSubmit = async () => {
        setUsernameError("");
        setEmailError("");
        setPasswordError("");

        // client-side validation first
        if (username.trim().length < 2) {
            setUsernameError(i18n.t("usernameTooShort"));
            return;
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            setUsernameError(i18n.t("usernameInvalidChars"));
            return;
        }

        if (!emailAddress.includes("@")) {
            setEmailError(i18n.t("emailInvalid"));
            return;
        }

        if (!/^[\x20-\x7E]+$/.test(password)) {
            setPasswordError(i18n.t("passwordInvalidChars"));
            return;
        }

        if (password.length < 8) {
            setPasswordError(i18n.t("passwordTooShort"));
            return;
        }

        if (!/[a-zA-Z]/.test(password)) {
            setPasswordError(i18n.t("passwordTooWeak"));
            return;
        }

        if (!/[0-9]/.test(password)) {
            setPasswordError(i18n.t("passwordTooWeak"));
            return;
        }

        try {
            const result = await signUp.create({ emailAddress, password, username });

            if (result.error) {
                parseClerkError({ errors: [result.error] });
                return;
            }

            await signUp.verifications.sendEmailCode();

        } catch (err: any) {
            parseClerkError(err);
        }
    };

    const handleVerify = async () => {
        setCodeError("");
        try {
            const { error } = await signUp.verifications.verifyEmailCode({ code });
            if (error) {
                setCodeError(error.message);
                return;
            }

            try {
                await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/sync`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        clerkId: signUp.createdUserId,
                        username,
                        email: emailAddress,
                    }),
                });
            } catch (err) {
                console.error("Failed to sync user:", err);
            }

            await signUp.finalize();
            await AsyncStorage.setItem("showTutorial", "true");
            router.replace("/(tabs)" as any);
        } catch (err: any) {
            setCodeError(
                err?.errors?.[0]?.longMessage ||
                err?.errors?.[0]?.message ||
                i18n.t("invalidCode")
            );
        }
    };

    const handleStartOver = () => {
        signUp.reset();
        setEmailAddress("");
        setPassword("");
        setUsername("");
        setCode("");
        setUsernameError("");
        setEmailError("");
        setPasswordError("");
        setCodeError("");
    };

    if (signUp.status === "complete" || isSignedIn) return null;

    // VERIFY SCREEN
    if (
        signUp.status === "missing_requirements" &&
        signUp.unverifiedFields.includes("email_address") &&
        signUp.missingFields.length === 0
    ) {
        return (
            <View className="flex-1 bg-black px-6" style={{ paddingTop: insets.top + 48 }}>
                <View className="items-center mb-10">
                    <Text className="text-white text-3xl font-bold tracking-widest">{i18n.t("appName")}</Text>
                    <Text className="text-[#555] text-sm mt-2">{i18n.t("checkYourCode")}</Text>
                </View>

                <View className="bg-[#111] border border-[#282828] rounded-3xl p-6">
                    <Text className="text-[#888] text-xs tracking-widest uppercase mb-2">{i18n.t("code")}</Text>
                    <TextInput
                        className="bg-black border border-[#282828] rounded-xl px-4 py-4 text-white text-base"
                        placeholder={i18n.t("codePlaceholder")}
                        placeholderTextColor="#444"
                        value={code}
                        onChangeText={(v) => { setCode(v); setCodeError(""); }}
                        keyboardType="numeric"
                    />

                    {codeError ? (
                        <Text className="text-red-500 text-xs mt-2">{codeError}</Text>
                    ) : null}

                    <Pressable
                        className="bg-[#1DB954] rounded-full py-4 items-center mt-5"
                        onPress={handleVerify}
                        disabled={fetchStatus === "fetching"}
                    >
                        <Text
                            className="text-black font-bold text-base"
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.8}
                        >
                            {fetchStatus === "fetching" ? i18n.t("verifying") : i18n.t("verify")}
                        </Text>
                    </Pressable>

                    <Pressable
                        className="mt-3 border border-[#282828] rounded-full py-4 items-center"
                        onPress={() => signUp.verifications.sendEmailCode()}
                    >
                        <Text className="text-[#888] text-sm">{i18n.t("resendCode")}</Text>
                    </Pressable>

                    <Pressable
                        className="mt-3 border border-[#282828] rounded-full py-4 items-center"
                        onPress={handleStartOver}
                    >
                        <Text className="text-[#888] text-sm">{i18n.t("startOver")}</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    // SIGN UP SCREEN
    return (
        <View className="flex-1 bg-black px-6" style={{ paddingTop: insets.top + 32 }}>

            {/* Brand */}
            <View className="items-center mb-8">
                <View className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-[#282828] items-center justify-center mb-4">
                    <Text className="text-[#1DB954] text-2xl">💬</Text>
                </View>
                <Text className="text-white text-3xl font-bold tracking-widest">{i18n.t("appName")}</Text>
                <Text className="text-[#555] text-sm mt-2">{i18n.t("createAccount")}</Text>
                <View className="flex-row items-center gap-2 bg-[#1a1a1a] border border-[#282828] rounded-full px-4 py-2 mt-3">
                    <View className="w-1.5 h-1.5 rounded-full bg-[#1DB954]" />
                    <Text className="text-[#888] text-xs">{i18n.t("appAnonymousBadge")}</Text>
                </View>
            </View>

            {/* Card */}
            <View className="bg-[#111] border border-[#282828] rounded-3xl p-6">

                {/* Username */}
                <Text className="text-[#888] text-xs tracking-widest uppercase mb-2">{i18n.t("username")}</Text>
                <TextInput
                    className={`bg-black border rounded-xl px-4 py-4 text-white text-base mb-1 ${usernameError ? "border-red-500" : "border-[#282828]"}`}
                    placeholder={i18n.t("usernamePlaceholder")}
                    placeholderTextColor="#444"
                    value={username}
                    onChangeText={(v) => { setUsername(v); setUsernameError(""); }}
                    autoCapitalize="none"
                />
                {usernameError ? (
                    <Text className="text-red-500 text-xs mb-3">{usernameError}</Text>
                ) : <View className="mb-4" />}

                {/* Email */}
                <Text className="text-[#888] text-xs tracking-widest uppercase mb-2">{i18n.t("email")}</Text>
                <TextInput
                    className={`bg-black border rounded-xl px-4 py-4 text-white text-base mb-1 ${emailError ? "border-red-500" : "border-[#282828]"}`}
                    placeholder={i18n.t("emailPlaceholder")}
                    placeholderTextColor="#444"
                    value={emailAddress}
                    onChangeText={(v) => { setEmailAddress(v); setEmailError(""); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                {emailError ? (
                    <Text className="text-red-500 text-xs mb-3">{emailError}</Text>
                ) : <View className="mb-4" />}

                {/* Password */}
                <Text className="text-[#888] text-xs tracking-widest uppercase mb-2">{i18n.t("password")}</Text>
                <View className="relative">
                    <TextInput
                        className={`bg-black border rounded-xl px-4 py-4 text-white text-base pr-12 ${passwordError ? "border-red-500" : "border-[#282828]"}`}
                        placeholder={i18n.t("passwordPlaceholder")}
                        placeholderTextColor="#444"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={(v) => { setPassword(v); setPasswordError(""); }}
                    />
                    <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4"
                    >
                        <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#555" />
                    </Pressable>
                </View>
                {passwordError ? (
                    <Text className="text-red-500 text-xs mt-1 mb-2">{passwordError}</Text>
                ) : <View className="mb-4" />}

                <Pressable
                    className="bg-[#1DB954] rounded-full py-4 items-center mt-2"
                    onPress={handleSubmit}
                    disabled={!emailAddress || !password || !username || fetchStatus === "fetching"}
                >
                    <Text className="text-black font-bold text-base tracking-wide">
                        {fetchStatus === "fetching" ? i18n.t("creatingAccount") : i18n.t("signUp")}
                    </Text>
                </Pressable>
            </View>

            {/* Footer */}
            <View className="flex-row justify-center mt-6 gap-1">
                <Text className="text-[#555]">{i18n.t("alreadyHaveAccount")}</Text>
                <Link href="/(auth)/sign-in">
                    <Text className="text-white font-semibold">{i18n.t("signIn")}</Text>
                </Link>
            </View>

            <View nativeID="clerk-captcha" />
        </View>
    );
}