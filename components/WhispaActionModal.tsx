import i18n from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Modal, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Feedback = { _id: string; text: string };

type Props = {
    visible: boolean;
    feedback: Feedback | null;
    onClose: () => void;
    onDelete: () => void;
    onShare: () => void;
    onReport: () => void;
};

export default function WhispaActionModal({ visible, feedback, onClose, onDelete, onShare, onReport }: Props) {
    const insets = useSafeAreaInsets();
    const slideAnim = useRef(new Animated.Value(300)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: 300,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                className="flex-1 bg-black/60"
                activeOpacity={1}
                onPress={onClose}
            />
            <Animated.View
                style={{
                    transform: [{ translateY: slideAnim }],
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: "#111",
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    borderTopWidth: 1,
                    borderColor: "#282828",
                    paddingBottom: insets.bottom + 16,
                    paddingTop: 8,
                }}
            >
                {/* Handle */}
                <View className="items-center mb-4">
                    <View className="w-10 h-1 rounded-full bg-[#333]" />
                </View>

                {/* Whispa preview */}
                {feedback && (
                    <View className="px-6 mb-4">
                        <Text
                            className="text-[#555] text-sm leading-5"
                            numberOfLines={2}
                            ellipsizeMode="tail"
                        >
                            {feedback.text}
                        </Text>
                    </View>
                )}

                <View className="px-4 gap-2">
                    {/* Delete */}
                    <TouchableOpacity
                        onPress={onDelete}
                        className="flex-row items-center gap-4 px-4 py-4 bg-[#1a1a1a] rounded-2xl border border-[#282828]"
                    >
                        <View className="w-9 h-9 rounded-full bg-red-500/10 items-center justify-center">
                            <Ionicons name="trash-outline" size={18} color="#ef4444" />
                        </View>
                        <Text className="text-red-500 font-semibold text-base">
                            {i18n.t("deleteWhispa")}
                        </Text>
                    </TouchableOpacity>

                    {/* Share */}
                    <TouchableOpacity
                        onPress={onShare}
                        className="flex-row items-center gap-4 px-4 py-4 bg-[#1a1a1a] rounded-2xl border border-[#282828]"
                    >
                        <View className="w-9 h-9 rounded-full bg-[#282828] items-center justify-center">
                            <Ionicons name="share-outline" size={18} color="#b3b3b3" />
                        </View>
                        <Text className="text-white font-semibold text-base">
                            {i18n.t("shareWhispa")}
                        </Text>
                    </TouchableOpacity>

                    {/* Report */}
                    <TouchableOpacity
                        onPress={onReport}
                        className="flex-row items-center gap-4 px-4 py-4 bg-[#1a1a1a] rounded-2xl border border-[#282828]"
                    >
                        <View className="w-9 h-9 rounded-full bg-[#282828] items-center justify-center">
                            <Ionicons name="flag-outline" size={18} color="#b3b3b3" />
                        </View>
                        <Text className="text-white font-semibold text-base">
                            {i18n.t("reportWhispa")}
                        </Text>
                    </TouchableOpacity>

                    {/* Cancel */}
                    <TouchableOpacity
                        onPress={onClose}
                        className="flex-row items-center justify-center px-4 py-4 rounded-2xl mt-1"
                    >
                        <Text className="text-[#555] font-semibold text-base">
                            {i18n.t("cancel")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Modal>
    );
}