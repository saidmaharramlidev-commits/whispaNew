import { useApi } from "@/lib/api";
import i18n from "@/lib/i18n";
import { router } from "expo-router";
import { memo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type User = {
    _id: string;
    username: string;
    bio: string;
    avatarUrl: string;
    isFollowing: boolean;
};

type Props = {
    _id: string;
    username: string;
    bio: string;
    isFollowing: boolean;
    onClose?: () => void;
    onFollowToggle?: () => void;
};
function UserCardFollow({ _id, username, bio, isFollowing, onClose, onFollowToggle }: Props) {
    const api = useApi();
    const [isFollowingstate, setIsFollowingstate] = useState(isFollowing);

    const handleToggleFollow = async () => {
        setIsFollowingstate(prev => !prev);
        try {
            await api.toggleFollow(username);
            onFollowToggle?.();
        } catch (err) {
            setIsFollowingstate(prev => !prev);
            console.error("Failed to toggle follow:", err);
        }
    };

    return (
        <TouchableOpacity
            onPress={() => {
                onClose?.();
                router.push({
                    pathname: "/user/[username]",
                    params: { username: username }
                });
            }}
            className="flex-row items-center gap-4 py-4 border-b border-[#1a1a1a]"
        >
            {/* Avatar */}
            <View className="w-12 h-12 rounded-full bg-[#1a1a1a] border border-[#282828] justify-center items-center">
                <Text className="text-white text-lg font-bold">
                    {username[0].toUpperCase()}
                </Text>
            </View>

            {/* Info */}
            <View className="flex-1">
                <Text className="text-white font-semibold text-base">
                    {username}
                </Text>
                {bio ? (
                    <Text className="text-[#b3b3b3] text-sm" numberOfLines={1}>
                        {bio}
                    </Text>
                ) : null}
            </View>

            {/* Follow Button */}
            <TouchableOpacity
                onPress={(e) => {
                    e.stopPropagation();
                    handleToggleFollow();
                }}
                className={`px-4 py-2 rounded-full border ${isFollowingstate ? "bg-[#1a1a1a] border-[#282828]" : "bg-white border-white"}`}
            >
                <Text className={`text-sm font-bold ${isFollowingstate ? "text-white" : "text-black"}`}>
                    {isFollowingstate ? i18n.t("unfollow") : i18n.t("follow")}
                </Text>
            </TouchableOpacity>

        </TouchableOpacity>
    );
}

export default memo(UserCardFollow);