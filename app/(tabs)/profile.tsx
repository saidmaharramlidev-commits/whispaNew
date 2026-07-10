import FollowListModal from "@/components/FollowListModal";
import { useApi } from "@/lib/api";
import i18n from "@/lib/i18n";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from "react-native";
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
};

type FollowUser = {
    _id: string;
    username: string;
    bio: string;
};

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const { isLoaded, isSignedIn } = useAuth();
    const api = useApi();

    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState("");
    const [modalType, setModalType] = useState<"followers" | "following">("followers");
    const [modalVisible, setModalVisible] = useState(false);
    const [followers, setFollowers] = useState<FollowUser[]>([]);
    const [following, setFollowing] = useState<FollowUser[]>([]);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            fetchProfile(false);
        } else if (isLoaded && !isSignedIn) {
            setLoading(false);
        }
    }, [isLoaded, isSignedIn]);

    const fetchProfile = async (background = false) => {
        try {
            if (!background) setLoading(true);
            const data = await api.getMe();
            setUser(data.data);
            setAvatarUrl(data.data.avatarUrl || "");
        } catch (err) {
            console.error("Failed to load profile:", err);
        } finally {
            if (!background) setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchProfile(true);
    };

    const handleRemoveFollower = (username: string) => {
        setFollowers(prev => prev.filter(f => f.username !== username));
        api.removeFollower(username).catch(err =>
            console.error("Failed to remove follower:", err)
        );
    };

    const fetchFollowers = async () => {
        try {
            if (!user) return;
            const data = await api.getFollowers(user.username);
            setFollowers(data.data);
        } catch (err) {
            console.error("Failed to load followers:", err);
        }
    };

    const fetchFollowing = async () => {
        try {
            if (!user) return;
            const data = await api.getFollowing(user.username);
            setFollowing(data.data);
        } catch (err) {
            console.error("Failed to load following:", err);
        }
    };

    const openModal = async (type: "followers" | "following") => {
        setModalType(type);
        setModalVisible(true);
        setFollowLoading(true);
        try {
            if (type === "followers") {
                await fetchFollowers();
            } else {
                await fetchFollowing();
            }
        } finally {
            setFollowLoading(false);
        }
    };

    const handlePickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            alert(i18n.t("galleryPermissionRequired"));
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            const asset = result.assets[0];
            const uri = asset.uri;
            const mimeType = asset.mimeType || "image/jpeg";

            try {
                const base64 = await FileSystem.readAsStringAsync(uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            file: `data:${mimeType};base64,${base64}`,
                            upload_preset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
                        }),
                    }
                );

                if (!response.ok) {
                    const errData = await response.json();
                    console.error("Cloudinary error:", errData);
                    alert(i18n.t("failedToUploadAvatar"));
                    return;
                }

                const data = await response.json();
                const cloudUrl = data.secure_url;

                setAvatarUrl(cloudUrl);
                await api.updateMe({ avatarUrl: cloudUrl });

            } catch (err) {
                console.error("Failed to upload avatar:", err);
                alert(i18n.t("failedToUploadAvatar"));
            }
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
                <Text className="text-[#b3b3b3]">{i18n.t("failedToLoadProfile")}</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>

            <FollowListModal
                visible={modalVisible}
                type={modalType}
                users={modalType === "followers" ? followers : following}
                loading={followLoading}
                currentUserFollowing={user.following.map((f: any) => f._id ?? f)}
                onClose={() => setModalVisible(false)}
                onFollowToggle={() => fetchProfile(true)}
                onRefresh={() => fetchProfile(true)}
                onRemoveFollower={handleRemoveFollower}
            />

            <FlatList
                data={[]}
                keyExtractor={() => "key"}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#1DB954"
                        colors={["#1DB954"]}
                        progressBackgroundColor="#000000"
                    />
                }
                ListHeaderComponent={() => (
                    <View className="px-6">

                        {/* Top Bar */}
                        <View className="flex-row justify-between items-center py-4">
                            <Text className="text-white text-2xl font-bold tracking-wider">
                                {i18n.t("profile")}
                            </Text>
                            <TouchableOpacity
                                onPress={() => router.push("/settings")}
                                className="bg-[#1a1a1a] p-2 rounded-full border border-[#282828]"
                            >
                                <Ionicons name="settings-outline" size={20} color="#b3b3b3" />
                            </TouchableOpacity>
                        </View>

                        {/* Avatar */}
                        <View className="items-center mt-4 mb-6">
                            <TouchableOpacity onPress={handlePickImage} className="mb-4">
                                <View className="w-24 h-24 rounded-full bg-[#1a1a1a] border border-[#282828] justify-center items-center">
                                    {avatarUrl ? (
                                        <Image
                                            source={{ uri: avatarUrl }}
                                            className="w-24 h-24 rounded-full"
                                        />
                                    ) : (
                                        <Text className="text-white text-4xl font-bold">
                                            {user.username[0].toUpperCase()}
                                        </Text>
                                    )}
                                </View>
                                <View className="absolute bottom-0 right-0 bg-[#1DB954] rounded-full p-1.5 border-2 border-black">
                                    <Ionicons name="camera" size={12} color="white" />
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
                            <TouchableOpacity
                                className="items-center"
                                onPress={() => openModal("followers")}
                            >
                                <Text className="text-white text-lg font-bold">
                                    {user.followers?.length ?? 0}
                                </Text>
                                <Text className="text-[#b3b3b3] text-sm">{i18n.t("followers")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="items-center"
                                onPress={() => openModal("following")}
                            >
                                <Text className="text-white text-lg font-bold">
                                    {user.following?.length ?? 0}
                                </Text>
                                <Text className="text-[#b3b3b3] text-sm">{i18n.t("following")}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Edit Profile */}
                        <TouchableOpacity
                            className="bg-[#1a1a1a] border border-[#282828] rounded-full py-3 items-center mb-3"
                            onPress={() => router.push("/settings")}
                        >
                            <Text className="text-white font-semibold text-base">{i18n.t("editProfile")}</Text>
                        </TouchableOpacity>

                        {/* Accepting Whispas */}
                        <View className="flex-row justify-between items-center bg-[#1a1a1a] border border-[#282828] rounded-2xl px-5 py-4 mt-2">
                            <View>
                                <Text className="text-white font-semibold">{i18n.t("acceptingWhispas")}</Text>
                                <Text className="text-[#b3b3b3] text-xs mt-1">
                                    {!user.isAcceptingFeedback
                                        ? i18n.t("whispasOff")
                                        : user.followersOnly
                                            ? i18n.t("onlyFollowersCanWhispa")
                                            : i18n.t("everyoneCanWhispa")}
                                </Text>
                            </View>
                            <View className={`w-3 h-3 rounded-full ${!user.isAcceptingFeedback
                                ? "bg-red-500"
                                : user.followersOnly
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`} />
                        </View>
                    </View>
                )}
                renderItem={() => null}
            />
        </View>
    );
}