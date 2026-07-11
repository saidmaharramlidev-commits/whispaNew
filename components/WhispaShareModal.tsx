import i18n from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { ActivityIndicator, Modal, Share, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ViewShot, { ViewShotRef } from "react-native-view-shot";
import WhispaShareCard from "./WhispaShareCard";

type Props = {
    visible: boolean;
    text: string;
    onClose: () => void;
};

export default function WhispaShareModal({ visible, text, onClose }: Props) {
    const insets = useSafeAreaInsets();
    const viewShotRef = useRef<ViewShotRef>(null);
    const [sharing, setSharing] = useState(false);

    const handleShare = async () => {
        if (!viewShotRef.current) return;
        try {
            setSharing(true);
            const uri = await viewShotRef.current.capture();
            await Share.share({
                url: uri, // iOS
                message: `💬 Received an anonymous whispa on WhispaMe\nDownload: https://play.google.com/store/apps/details?id=com.saidovery.whispame`,
            });
        } catch (err) {
            console.error("Share error:", err);
        } finally {
            setSharing(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View
                className="flex-1 bg-black"
                style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }}
            >
                {/* Header */}
                <View className="flex-row justify-between items-center px-6 mb-8">
                    <Text className="text-white text-xl font-bold">{i18n.t("shareWhispa")}</Text>
                    <TouchableOpacity
                        onPress={onClose}
                        className="bg-[#1a1a1a] p-2 rounded-full border border-[#282828]"
                    >
                        <Ionicons name="close" size={20} color="#b3b3b3" />
                    </TouchableOpacity>
                </View>

                {/* Card Preview */}
                <View className="flex-1 items-center justify-center px-6">
                    <ViewShot
                        ref={viewShotRef}
                        options={{
                            format: "png",
                            quality: 1,
                        }}
                    >
                        <WhispaShareCard text={text} />
                    </ViewShot>
                </View>

                {/* Share Button */}
                <View className="px-6 mt-6">
                    <TouchableOpacity
                        onPress={handleShare}
                        disabled={sharing}
                        className="flex-row items-center justify-center gap-3 bg-[#1DB954] rounded-full py-4"
                    >
                        {sharing ? (
                            <ActivityIndicator color="black" />
                        ) : (
                            <>
                                <Ionicons name="share-outline" size={20} color="black" />
                                <Text className="text-black font-bold text-base">{i18n.t("shareWhispa")}</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}