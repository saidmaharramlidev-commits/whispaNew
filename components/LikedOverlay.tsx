import WhispaActionModal from "@/components/WhispaActionModal";
import WhispaShareModal from "@/components/WhispaShareModal";
import { useApi } from "@/lib/api";
import i18n from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


type Feedback = { _id: string; text: string };
type Props = { likedFeedbacks: Feedback[]; onClose: () => void; onUnlike: (id: string) => void };

export default function LikedOverlay({ likedFeedbacks, onClose, onUnlike }: Props) {
    const insets = useSafeAreaInsets();
    const api = useApi();
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
    const [showActionModal, setShowActionModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareText, setShareText] = useState("");

    const openActionModal = (feedback: Feedback) => {
        setSelectedFeedback(feedback);
        setShowActionModal(true);
    };

    const closeActionModal = () => {
        setShowActionModal(false);
        setSelectedFeedback(null);
    };

    const handleDelete = async () => {
        if (!selectedFeedback) return;
        closeActionModal();
        onUnlike(selectedFeedback._id);
        try {
            await api.deleteFeedback(selectedFeedback._id);
        } catch (err) {
            console.error("Failed to delete feedback:", err);
        }
    };

    const handleShare = () => {
        closeActionModal();
        if (selectedFeedback) {
            setShareText(selectedFeedback.text);
            setShowShareModal(true);
        }
    };

    const handleReport = () => {
        closeActionModal();
        // report/block logic later
    };

    return (
        <View
            className="absolute top-0 left-0 right-0 bottom-0 bg-black z-50 px-6"
            style={{ paddingTop: insets.top }}
        >
            {/* Header */}
            <View className="flex-row justify-between items-center my-6">
                <Text className="text-white text-xl font-bold">{i18n.t("likedWhispas")}</Text>
                <TouchableOpacity
                    onPress={onClose}
                    className="bg-[#1a1a1a] px-4 py-2 rounded-full border border-[#282828]"
                >
                    <Text className="text-[#b3b3b3] text-sm">{i18n.t("close")}</Text>
                </TouchableOpacity>
            </View>

            {/* Empty State */}
            {likedFeedbacks.length === 0 ? (
                <View className="flex-1 justify-center items-center gap-4">
                    <Text className="text-5xl">❤️</Text>
                    <Text className="text-white text-lg font-bold">{i18n.t("noLikedWhispas")}</Text>
                    <Text className="text-[#b3b3b3] text-sm text-center px-8">
                        {i18n.t("likeWhispasToSee")}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={likedFeedbacks}
                    keyExtractor={(item) => item._id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
                    renderItem={({ item }) => (
                        <View className="bg-[#111] rounded-2xl p-5 mb-3 border border-[#282828]">
                            <View className="flex-row items-start justify-between gap-3">
                                {/* Whispa text — flex-1 ensures it never pushes the dots */}
                                <Text
                                    className="text-white leading-6 flex-1"
                                    style={{
                                        fontSize: item.text.length > 120 ? 14 : item.text.length > 60 ? 15 : 16,
                                        lineHeight: item.text.length > 120 ? 22 : 24,
                                    }}
                                >
                                    {item.text}
                                </Text>

                                {/* Dots — always pinned to right, never pushed */}
                                <TouchableOpacity
                                    onPress={() => openActionModal(item)}
                                    className="bg-[#1a1a1a] rounded-full p-2 border border-[#282828]"
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    style={{ alignSelf: "flex-start" }}
                                >
                                    <Ionicons name="ellipsis-horizontal" size={16} color="#888" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}

            {/* Action Modal */}
            <WhispaActionModal
                visible={showActionModal}
                feedback={selectedFeedback}
                onClose={closeActionModal}
                onDelete={handleDelete}
                onShare={handleShare}
                onReport={handleReport}
            />

            <WhispaShareModal
                visible={showShareModal}
                text={shareText}
                onClose={() => setShowShareModal(false)}
            />
        </View>
    );
}