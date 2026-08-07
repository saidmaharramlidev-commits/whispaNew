import ImageWhispaPicker from "@/components/ImageWhispaPicker";
import VoicePlayer from "@/components/VoicePlayer";
import VoiceRecorder from "@/components/VoiceRecorder";
import { useApi } from "@/lib/api";
import i18n from "@/lib/i18n";
import { containsForbiddenWord } from "@/lib/wordFilter";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Modal, Pressable, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type UserProfile = {
    _id: string;
    username: string;
    bio: string;
    avatarUrl: string;
    followers: any[];
    following: any[];
    isAcceptingFeedback: boolean;
    followersOnly: boolean;
    isFollowedByThem: boolean;
    showFollowers: boolean;
    showFollowing: boolean;
    isBlockedByThem: boolean;
};

export default function UserProfileScreen() {
    const insets = useSafeAreaInsets();
    const { username } = useLocalSearchParams();
    const { user: clerkUser } = useUser();
    const api = useApi();

    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowedByThem, setIsFollowedByThem] = useState(false);
    const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [feedbackSent, setFeedbackSent] = useState(false);
    const [feedbackError, setFeedbackError] = useState("");
    const [avatarModalVisible, setAvatarModalVisible] = useState(false);
    const [showUsername, setShowUsername] = useState(false);
    const [currentUserIsPremium, setCurrentUserIsPremium] = useState(false);
    const [dailyCount, setDailyCount] = useState(0);
    const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
    const [audioUri, setAudioUri] = useState<string | null>(null);
    const [audioUploading, setAudioUploading] = useState(false);
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);



    const handleSendImageFeedback = async () => {
        if (!imageUrl) return;
        try {
            setFeedbackLoading(true);
            await api.sendFeedback(
                user!.username,
                null,
                null,
                null,
                "image",
                imageUrl
            );
            setFeedbackSent(true);
            setImageUrl(null);
            setTimeout(() => {
                setFeedbackModalVisible(false);
                setFeedbackSent(false);
            }, 1500);
        } catch (err: any) {
            const message = err?.message || "";
            if (message.includes("Premium required")) {
                setFeedbackError(i18n.t("premiumFeature"));
            } else {
                console.error("Failed to send image feedback:", err);
            }
        } finally {
            setFeedbackLoading(false);
        }
    };


    const fetchUser = async () => {
        try {
            setLoading(true);
            const data = await api.getUserByUsername(username as string);
            setUser(data.data);
            setIsFollowing(data.data.isFollowing);
            setIsFollowedByThem(data.data.isFollowedByThem);
        } catch (err) {
            console.error("Failed to load user:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
        fetchCurrentUser(); // ← add this
        fetchDailyCount(); // ← add this
    }, [username]);

    const fetchCurrentUser = async () => {
        try {
            const meData = await api.getMe();
            setCurrentUserIsPremium(meData.data.isPremium);
        } catch (err) {
            console.error("Failed to fetch current user:", err);
        }
    };

    const fetchDailyCount = async () => {
        try {
            const data = await api.getDailyCount();
            setDailyCount(data.data.count);
        } catch (err) {
            console.error("Failed to fetch daily count:", err);
        }
    };



    const handleToggleFollow = async () => {
        if (!clerkUser || !user) return;
        setIsFollowing(prev => !prev);
        try {
            await api.toggleFollow(user.username);
            await fetchUser();
        } catch (err) {
            setIsFollowing(prev => !prev);
            console.error("Failed to toggle follow:", err);
        }
    };

    const handleSendFeedback = async () => {
        setFeedbackError("");

        if (feedbackText.trim().length < 2) {
            setFeedbackError(i18n.t("whispaTooShort"));
            return;
        }

        if (feedbackText.trim().length > 200) {
            setFeedbackError(i18n.t("whispaToLong"));
            return;
        }

        if (containsForbiddenWord(feedbackText)) {
            setFeedbackError(i18n.t("forbiddenWord"));
            return;
        }

        if (!feedbackText.trim()) return;

        try {
            setFeedbackLoading(true);
            const clerkUsername = clerkUser?.username || null;
            await api.sendFeedback(
                user!.username,
                feedbackText,
                showUsername ? clerkUsername : null
            );
            setFeedbackSent(true);
            setFeedbackText("");
            setDailyCount(prev => prev + 1);
            setTimeout(() => {
                setFeedbackModalVisible(false);
                setFeedbackSent(false);
                setShowUsername(false);
            }, 1500);
        } catch (err: any) {
            const message = err?.message || "";
            if (message.includes("Daily limit reached")) {
                setFeedbackError(i18n.t("dailyLimitReached"));
            } else {
                console.error("Failed to send feedback:", err);
            }
        } finally {
            setFeedbackLoading(false);
        }
    };

    const uploadAudio = async (uri: string): Promise<string | null> => {
        try {
            setAudioUploading(true);
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        file: `data:audio/m4a;base64,${base64}`,
                        upload_preset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
                        resource_type: "video", // cloudinary uses video for audio
                    }),
                }
            );

            const data = await response.json();
            return data.secure_url;
        } catch (err) {
            console.error("Failed to upload audio:", err);
            return null;
        } finally {
            setAudioUploading(false);
        }
    };

    const handleRecordingComplete = async (uri: string) => {
        setShowVoiceRecorder(false);
        const url = await uploadAudio(uri);
        if (url) setAudioUri(url);
    };

    const handleSendVoiceFeedback = async () => {
        if (!audioUri) return;
        try {
            setFeedbackLoading(true);
            await api.sendFeedback(
                user!.username,
                null,
                null,
                audioUri,
                "voice"
            );
            setFeedbackSent(true);
            setAudioUri(null);
            setTimeout(() => {
                setFeedbackModalVisible(false);
                setFeedbackSent(false);
            }, 1500);
        } catch (err: any) {
            const message = err?.message || "";
            if (message.includes("Premium required")) {
                setFeedbackError(i18n.t("premiumFeature"));
            } else {
                console.error("Failed to send voice feedback:", err);
            }
        } finally {
            setFeedbackLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator size="large" color="#1DB954" />
            </View>
        );
    }

    if (!user) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <Text className="text-[#b3b3b3]">{i18n.t("userNotFound")}</Text>
            </View>
        );
    }

    const canWhispa = user.isAcceptingFeedback && (!user.followersOnly || isFollowedByThem) && !user.isBlockedByThem;
    return (
        <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>

            {/* Avatar Full Screen Modal */}
            <Modal
                visible={avatarModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setAvatarModalVisible(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/90 justify-center items-center"
                    onPress={() => setAvatarModalVisible(false)}
                    activeOpacity={1}
                >
                    {user.avatarUrl ? (
                        <Image
                            source={{ uri: user.avatarUrl }}
                            style={{ width: 300, height: 300, borderRadius: 150 }}
                        />
                    ) : (
                        <View
                            style={{ width: 300, height: 300, borderRadius: 150 }}
                            className="bg-[#1a1a1a] border border-[#282828] justify-center items-center"
                        >
                            <Text className="text-white font-bold" style={{ fontSize: 120 }}>
                                {user.username[0].toUpperCase()}
                            </Text>
                        </View>
                    )}
                    <Text className="text-[#555] text-sm mt-6">{i18n.t("tapToClose")}</Text>
                </TouchableOpacity>
            </Modal>

            {/* Send Whispa Modal */}
            <Modal
                visible={feedbackModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setFeedbackModalVisible(false)}
            >
                <View className="flex-1 bg-black px-6" style={{ paddingTop: insets.top }}>
                    <View className="flex-row justify-between items-center py-4 mb-4">
                        <Text className="text-white text-xl font-bold">{i18n.t("sendWhispa")}</Text>
                        <TouchableOpacity
                            onPress={() => setFeedbackModalVisible(false)}
                            className="bg-[#1a1a1a] px-4 py-2 rounded-full border border-[#282828]"
                        >
                            <Text className="text-[#b3b3b3] text-sm">{i18n.t("cancel")}</Text>
                        </TouchableOpacity>
                    </View>

                    {feedbackSent ? (
                        <View className="flex-1 justify-center items-center gap-4">
                            <Text className="text-5xl">🎉</Text>
                            <Text className="text-white text-lg font-bold">{i18n.t("whispaSent")}</Text>
                        </View>
                    ) : showVoiceRecorder ? (
                        <VoiceRecorder
                            onRecordingComplete={handleRecordingComplete}
                            onCancel={() => setShowVoiceRecorder(false)}
                        />
                    ) : audioUploading ? (
                        <View className="flex-1 justify-center items-center gap-4">
                            <ActivityIndicator size="large" color="#1DB954" />
                            <Text className="text-[#555] text-sm">{i18n.t("uploadingAudio")}</Text>
                        </View>
                    ) : showImagePicker ? (
                        <ImageWhispaPicker
                            onImageSelected={(url) => {
                                setImageUrl(url);
                                setShowImagePicker(false);
                            }}
                            onCancel={() => setShowImagePicker(false)}
                        />
                    ) : imageUrl ? (
                        <View className="gap-4">
                            <Text className="text-[#b3b3b3] text-sm">{i18n.t("imagePreview")}</Text>
                            <Image
                                source={{ uri: imageUrl }}
                                style={{ width: "100%", aspectRatio: 1, borderRadius: 16 }}
                            />
                            <Pressable
                                onPress={handleSendImageFeedback}
                                disabled={feedbackLoading}
                                className="bg-[#1DB954] rounded-full py-4 items-center"
                            >
                                {feedbackLoading ? (
                                    <ActivityIndicator color="black" />
                                ) : (
                                    <Text className="text-black font-bold text-base">{i18n.t("send")}</Text>
                                )}
                            </Pressable>
                            <Pressable
                                onPress={() => setImageUrl(null)}
                                className="items-center py-2"
                            >
                                <Text className="text-[#555] text-sm">{i18n.t("selectImage")}</Text>
                            </Pressable>
                        </View>
                    ) : audioUri ? (
                        // preview recorded audio before sending
                        <View className="gap-4">
                            <Text className="text-[#b3b3b3] text-sm">{i18n.t("voicePreview")}</Text>
                            <VoicePlayer audioUrl={audioUri} />
                            <Pressable
                                onPress={handleSendVoiceFeedback}
                                disabled={feedbackLoading}
                                className="bg-[#1DB954] rounded-full py-4 items-center"
                            >
                                {feedbackLoading ? (
                                    <ActivityIndicator color="black" />
                                ) : (
                                    <Text className="text-black font-bold text-base">{i18n.t("send")}</Text>
                                )}
                            </Pressable>
                            <Pressable
                                onPress={() => setAudioUri(null)}
                                className="items-center py-2"
                            >
                                <Text className="text-[#555] text-sm">{i18n.t("recordAgain")}</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <>
                            {/* Daily count */}
                            {!currentUserIsPremium && (
                                <View className="flex-row justify-between items-center mb-3">
                                    <Text className="text-[#555] text-xs">{i18n.t("dailyLimit")}</Text>
                                    <View className={`px-3 py-1 rounded-full border ${dailyCount >= 10 ? "border-red-500 bg-red-500/10" : "border-[#282828] bg-[#1a1a1a]"}`}>
                                        <Text className={`text-xs font-semibold ${dailyCount >= 10 ? "text-red-500" : "text-[#555]"}`}>
                                            {dailyCount}/10
                                        </Text>
                                    </View>
                                </View>
                            )}

                            <Text className="text-[#b3b3b3] text-sm mb-3">
                                {i18n.t("whispaAnonymous")}
                            </Text>

                            <TextInput
                                className="bg-[#1a1a1a] text-white px-4 py-4 rounded-2xl border border-[#282828] mb-4"
                                placeholder={i18n.t("writeWhispaPlaceholder")}
                                placeholderTextColor="#555"
                                value={feedbackText}
                                onChangeText={(v) => { setFeedbackText(v); setFeedbackError(""); }}
                                multiline
                                numberOfLines={5}
                                maxLength={200}
                                textAlignVertical="top"
                            />
                            <Text className="text-[#555] text-xs text-right mb-2">
                                {feedbackText.length}/200
                            </Text>

                            {feedbackError ? (
                                <Text className="text-red-500 text-xs mb-3">{feedbackError}</Text>
                            ) : null}

                            {/* Show username toggle */}
                            <TouchableOpacity
                                activeOpacity={currentUserIsPremium ? 1 : 0.7}
                                onPress={() => {
                                    if (!currentUserIsPremium) {
                                        setFeedbackModalVisible(false);
                                        router.push("/premium");
                                        return;
                                    }
                                }}
                                className="flex-row justify-between items-center bg-[#1a1a1a] border border-[#282828] rounded-2xl px-4 py-3 mb-4"
                            >
                                <View>
                                    <View className="flex-row items-center gap-2">
                                        <Text className="text-white font-semibold text-sm">{i18n.t("showMyUsername")}</Text>
                                        {!currentUserIsPremium && <Text className="text-yellow-400 text-xs">💎</Text>}
                                    </View>
                                    <Text className="text-[#555] text-xs mt-0.5">{i18n.t("showMyUsernameDesc")}</Text>
                                </View>
                                <Switch
                                    value={showUsername}
                                    onValueChange={currentUserIsPremium ? setShowUsername : () => {
                                        setFeedbackModalVisible(false);
                                        router.push("/premium");
                                    }}
                                    trackColor={{ false: "#282828", true: "#1DB954" }}
                                    thumbColor="white"
                                    disabled={!currentUserIsPremium}
                                />
                            </TouchableOpacity>

                            {/* Image whispa button — premium only */}
                            <TouchableOpacity
                                onPress={() => {
                                    if (!currentUserIsPremium) {
                                        setFeedbackModalVisible(false);
                                        router.push("/premium");
                                        return;
                                    }
                                    setShowImagePicker(true);
                                }}
                                className="flex-row items-center justify-center gap-2 border border-[#282828] bg-[#1a1a1a] rounded-full py-3 mb-4"
                            >
                                <Ionicons name="image-outline" size={16} color={currentUserIsPremium ? "#1DB954" : "#555"} />
                                <Text className={`text-sm font-semibold ${currentUserIsPremium ? "text-[#1DB954]" : "text-[#555]"}`}>
                                    {i18n.t("sendImageWhispa")}
                                </Text>
                                {!currentUserIsPremium && <Text className="text-yellow-400 text-xs">💎</Text>}
                            </TouchableOpacity>



                            {/* Voice whispa button — premium only */}
                            <TouchableOpacity
                                onPress={() => {
                                    if (!currentUserIsPremium) {
                                        setFeedbackModalVisible(false);
                                        router.push("/premium");
                                        return;
                                    }
                                    setShowVoiceRecorder(true);
                                }}
                                className="flex-row items-center justify-center gap-2 border border-[#282828] bg-[#1a1a1a] rounded-full py-3 mb-4"
                            >
                                <Ionicons name="mic-outline" size={16} color={currentUserIsPremium ? "#1DB954" : "#555"} />
                                <Text className={`text-sm font-semibold ${currentUserIsPremium ? "text-[#1DB954]" : "text-[#555]"}`}>
                                    {i18n.t("sendVoiceWhispa")}
                                </Text>
                                {!currentUserIsPremium && <Text className="text-yellow-400 text-xs">💎</Text>}
                            </TouchableOpacity>






                            <TouchableOpacity
                                onPress={handleSendFeedback}
                                disabled={feedbackLoading || !feedbackText.trim()}
                                className="bg-white rounded-full py-4 items-center mt-2"
                            >
                                {feedbackLoading ? (
                                    <ActivityIndicator color="black" />
                                ) : (
                                    <Text className="text-black font-bold text-base">{i18n.t("send")}</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </Modal>

            {/* Back Button */}
            <TouchableOpacity onPress={() => router.push("/(tabs)/search")} className="px-6 py-4">
                <Text className="text-[#b3b3b3] text-base">{i18n.t("back")}</Text>
            </TouchableOpacity>

            <FlatList
                data={[]}
                keyExtractor={() => "key"}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
                ListHeaderComponent={() => (
                    <View className="px-6">

                        {/* Avatar */}
                        <View className="items-center mt-4 mb-6">
                            <TouchableOpacity
                                onPress={() => setAvatarModalVisible(true)}
                                className="mb-4"
                            >
                                <View className="w-24 h-24 rounded-full bg-[#1a1a1a] border border-[#282828] justify-center items-center">
                                    {user.avatarUrl ? (
                                        <Image
                                            source={{ uri: user.avatarUrl }}
                                            className="w-24 h-24 rounded-full"
                                        />
                                    ) : (
                                        <Text className="text-white text-4xl font-bold">
                                            {user.username[0].toUpperCase()}
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                            <Text className="text-white text-xl font-bold mb-1">
                                @{user.username}
                            </Text>
                            {user.bio ? (
                                <Text className="text-[#b3b3b3] text-sm text-center px-8">
                                    {user.bio}
                                </Text>
                            ) : null}
                        </View>

                        {/* Stats */}
                        <View className="flex-row justify-center gap-10 mb-6">
                            {user.showFollowers !== false && (
                                <View className="items-center">
                                    <Text className="text-white text-lg font-bold">
                                        {user.followers?.length ?? 0}
                                    </Text>
                                    <Text className="text-[#b3b3b3] text-sm">{i18n.t("followers")}</Text>
                                </View>
                            )}
                            {user.showFollowing !== false && (
                                <View className="items-center">
                                    <Text className="text-white text-lg font-bold">
                                        {user.following?.length ?? 0}
                                    </Text>
                                    <Text className="text-[#b3b3b3] text-sm">{i18n.t("following")}</Text>
                                </View>
                            )}
                        </View>

                        {/* Follow Button */}
                        {clerkUser?.username !== user.username && (
                            <TouchableOpacity
                                onPress={handleToggleFollow}
                                className={`rounded-full py-3 items-center mb-4 ${isFollowing ? "bg-[#1a1a1a] border border-[#282828]" : "bg-white"}`}
                            >
                                <Text className={`font-bold text-base ${isFollowing ? "text-white" : "text-black"}`}>
                                    {isFollowing ? i18n.t("unfollow") : i18n.t("follow")}
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* Send Whispa */}
                        {user.isBlockedByThem ? (
                            <View className="bg-[#1a1a1a] border border-[#282828] rounded-2xl px-5 py-4 items-center gap-2">
                                <Text className="text-[#555] font-semibold text-base text-center">
                                    {i18n.t("youAreBlocked")}
                                </Text>
                            </View>
                        ) : !user.isAcceptingFeedback ? (
                            <View className="bg-[#1a1a1a] border border-[#282828] rounded-2xl px-5 py-4 items-center gap-2">
                                <Text className="text-[#555] font-semibold text-base text-center">
                                    {i18n.t("inboxClosed")}
                                </Text>
                            </View>
                        ) : canWhispa ? (
                            <TouchableOpacity
                                onPress={() => {
                                    setFeedbackModalVisible(true);
                                    fetchDailyCount(); // ← add this
                                }}
                                className="bg-[#1a1a1a] border border-[#282828] rounded-full py-3 items-center"
                            >
                                <Text className="text-white font-semibold text-base">
                                    {i18n.t("sendAnonymousWhispa")}
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <View className="bg-[#1a1a1a] border border-[#282828] rounded-2xl px-5 py-4 items-center gap-2">
                                <Text className="text-[#555] font-semibold text-base text-center">
                                    {i18n.t("userDoesntFollowBack")}
                                </Text>
                            </View>
                        )}



                    </View>
                )}
                renderItem={() => null}
            />
        </View>
    );
}