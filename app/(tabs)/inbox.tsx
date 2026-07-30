import { useApi } from "@/lib/api";
import i18n from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Reply = {
    _id: string;
    text: string;
    createdAt: string;
    receiverId: {
        username: string;
        avatarUrl: string;
    };
    feedbackId: {
        text: string;
    };
};

export default function InboxScreen() {
    const insets = useSafeAreaInsets();
    const api = useApi();

    const [replies, setReplies] = useState<Reply[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchReplies();
    }, []);

    const fetchReplies = async (background = false) => {
        try {
            if (!background) setLoading(true);
            const data = await api.getMyReplies();
            setReplies(data.data);
        } catch (err) {
            console.error("Failed to load replies:", err);
        } finally {
            if (!background) setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchReplies(true);
    };

    const handleDelete = async (replyId: string) => {
        // remove locally first
        setReplies(prev => prev.filter(r => r._id !== replyId));
        try {
            await api.deleteReply(replyId);
        } catch (err) {
            console.error("Failed to delete reply:", err);
            fetchReplies(true); // restore if failed
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator size="large" color="#1DB954" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>

            {/* Header */}
            <View className="px-6 py-4">
                <Text className="text-white text-2xl font-bold tracking-wider">
                    {i18n.t("inbox")}
                </Text>
            </View>

            {replies.length === 0 ? (
                <View className="flex-1 justify-center items-center gap-4">
                    <Text className="text-4xl">💌</Text>
                    <Text className="text-white text-lg font-bold">{i18n.t("noRepliesYet")}</Text>
                    <Text className="text-[#b3b3b3] text-sm text-center px-10">
                        {i18n.t("noRepliesDesc")}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={replies}
                    keyExtractor={(item) => item._id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 80 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#1DB954"]}
                            progressBackgroundColor="#000000"
                        />
                    }
                    renderItem={({ item }) => (
                        <View className="bg-[#111] border border-[#282828] rounded-2xl p-5 mb-3">

                            {/* Who replied */}
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="flex-row items-center gap-2">
                                    <View className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#282828] justify-center items-center">
                                        <Text className="text-white text-sm font-bold">
                                            {item.receiverId?.username?.[0]?.toUpperCase() || "?"}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text className="text-white text-sm font-semibold">
                                            @{item.receiverId?.username}
                                        </Text>
                                        <Text className="text-[#555] text-xs">
                                            {i18n.t("repliedToYourWhispa")}
                                        </Text>
                                    </View>
                                </View>

                                {/* Delete button */}
                                <TouchableOpacity
                                    onPress={() => handleDelete(item._id)}
                                    className="bg-[#1a1a1a] p-2 rounded-full border border-[#282828]"
                                >
                                    <Ionicons name="trash-outline" size={14} color="#DC2626" />
                                </TouchableOpacity>
                            </View>

                            {/* Original whispa context */}
                            <View className="bg-black border border-[#282828] rounded-xl px-3 py-2 mb-3">
                                <Text className="text-[#555] text-xs mb-1">{i18n.t("yourWhispa")}</Text>
                                <Text className="text-[#888] text-sm" numberOfLines={2}>
                                    {item.feedbackId?.text}
                                </Text>
                            </View>

                            {/* Reply text */}
                            <Text className="text-white text-base leading-6">
                                {item.text}
                            </Text>

                        </View>
                    )}
                />
            )}
        </View>
    );
}