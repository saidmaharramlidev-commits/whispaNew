import i18n from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Share, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
    visible: boolean;
    username: string;
    onClose: () => void;
};

export default function ShareProfileModal({ visible, username, onClose }: Props) {
    const insets = useSafeAreaInsets();
    const profileUrl = `https://feedbackapp-drsj.onrender.com/u/${username}`;

    const handleShareLink = async () => {
        try {
            await Share.share({
                message: `Send me an anonymous whispa 👻\n${profileUrl}`,
                title: `@${username} on WhispaMe`,
            });
        } catch (err) {
            console.error("Share error:", err);
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
                className="flex-1 bg-black px-6"
                style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }}
            >
                {/* Header */}
                <View className="flex-row justify-between items-center mb-10">
                    <Text className="text-white text-xl font-bold">{i18n.t("shareProfile")}</Text>
                    <TouchableOpacity
                        onPress={onClose}
                        className="bg-[#1a1a1a] p-2 rounded-full border border-[#282828]"
                    >
                        <Ionicons name="close" size={20} color="#b3b3b3" />
                    </TouchableOpacity>
                </View>

                {/* QR Code */}
                <View className="flex-1 justify-center items-center gap-6">
                    <View className="bg-white p-6 rounded-3xl">
                        <QRCode
                            value={profileUrl}
                            size={220}
                            color="#000000"
                            backgroundColor="#ffffff"
                        />
                    </View>

                    <View className="items-center gap-1">
                        <Text className="text-white text-lg font-bold">@{username}</Text>
                        <Text className="text-[#555] text-sm">{i18n.t("scanToWhispa")}</Text>
                    </View>
                </View>

                {/* Share Link Button */}
                <TouchableOpacity
                    onPress={handleShareLink}
                    className="flex-row items-center justify-center gap-3 bg-[#1a1a1a] border border-[#282828] rounded-full py-4 mt-6"
                >
                    <Ionicons name="share-outline" size={20} color="#b3b3b3" />
                    <Text className="text-white font-semibold text-base">{i18n.t("shareLink")}</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
}