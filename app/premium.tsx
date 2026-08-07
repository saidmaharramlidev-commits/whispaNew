import { PREMIUM_PRICE_DISPLAY } from "@/lib/api";
import i18n from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FEATURES: { icon: keyof typeof Ionicons.glyphMap; key: string }[] = [
    { icon: "infinite-outline", key: "premiumFeatureUnlimited" },
    { icon: "at-outline", key: "premiumFeatureUsername" },
    { icon: "mic-outline", key: "premiumFeatureVoiceImage" },
    { icon: "return-down-forward-outline", key: "premiumFeatureReply" },
];

export default function PremiumScreen() {
    const insets = useSafeAreaInsets();
    const [purchasing, setPurchasing] = useState(false);
    const [restoring, setRestoring] = useState(false);

    // ── Placeholder subscribe handler ──
    // Once RevenueCat credentials are connected, replace the body of this
    // function with Purchases.purchasePackage(...) for the monthly package.
    const handleSubscribe = async () => {
        setPurchasing(true);
        try {
            // TODO: swap this stub for RevenueCat's purchasePackage() call
            await new Promise((resolve) => setTimeout(resolve, 800));
            alert(i18n.t("premiumComingSoon"));
        } finally {
            setPurchasing(false);
        }
    };

    // ── Placeholder restore handler ──
    // Once connected, replace with Purchases.restorePurchases().
    const handleRestore = async () => {
        setRestoring(true);
        try {
            // TODO: swap this stub for RevenueCat's restorePurchases() call
            await new Promise((resolve) => setTimeout(resolve, 800));
            alert(i18n.t("premiumRestoreNothingFound"));
        } finally {
            setRestoring(false);
        }
    };

    const isBusy = purchasing || restoring;

    return (
        <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
            <TouchableOpacity onPress={() => router.back()} className="px-6 py-4">
                <Text className="text-[#b3b3b3] text-base">{i18n.t("back")}</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
                {/* Header */}
                <View className="items-center px-6 mt-4 mb-10">
                    <View className="w-20 h-20 rounded-full bg-[#1DB954]/10 border border-[#1DB954]/30 justify-center items-center mb-5">
                        <Text style={{ fontSize: 36 }}>💎</Text>
                    </View>
                    <Text className="text-white text-2xl font-bold text-center mb-2">
                        {i18n.t("premiumTitle")}
                    </Text>
                    <Text className="text-[#b3b3b3] text-sm text-center px-6">
                        {i18n.t("premiumSubtitle")}
                    </Text>
                </View>

                {/* Feature list */}
                <View className="px-6 gap-4 mb-10">
                    {FEATURES.map((f) => (
                        <View
                            key={f.key}
                            className="flex-row items-center gap-4 bg-[#1a1a1a] border border-[#282828] rounded-2xl px-5 py-4"
                        >
                            <View className="w-10 h-10 rounded-full bg-[#1DB954]/15 justify-center items-center">
                                <Ionicons name={f.icon} size={18} color="#1DB954" />
                            </View>
                            <Text className="text-white text-sm font-semibold flex-1">
                                {i18n.t(f.key)}
                            </Text>
                            <Ionicons name="checkmark-circle" size={20} color="#1DB954" />
                        </View>
                    ))}
                </View>

                {/* Price + subscribe button */}
                <View className="px-6">
                    <View className="items-center mb-6 flex-row justify-center">
                        <Text className="text-white text-3xl font-bold">{PREMIUM_PRICE_DISPLAY}</Text>
                        <Text className="text-[#b3b3b3] text-base font-semibold mb-1">
                            {i18n.t("premiumPerMonth")}
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={handleSubscribe}
                        disabled={isBusy}
                        className="bg-[#1DB954] rounded-full py-4 items-center mb-4"
                    >
                        {purchasing ? (
                            <ActivityIndicator color="black" />
                        ) : (
                            <Text className="text-black font-bold text-base">
                                {i18n.t("premiumBuyButton")}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Required disclosure — must stay visible near the subscribe button */}
                    <Text className="text-[#555] text-xs text-center px-2 mb-1">
                        {i18n.t("premiumRenewsAutomatically")}
                    </Text>
                    <Text className="text-[#555] text-xs text-center px-2 mb-6">
                        {i18n.t("premiumManageSubscription")}
                    </Text>

                    <TouchableOpacity
                        onPress={handleRestore}
                        disabled={isBusy}
                        className="items-center py-2"
                    >
                        {restoring ? (
                            <ActivityIndicator color="#1DB954" />
                        ) : (
                            <Text className="text-[#1DB954] text-sm font-semibold">
                                {i18n.t("premiumRestorePurchases")}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}