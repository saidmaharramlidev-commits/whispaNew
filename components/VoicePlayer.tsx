import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type Props = {
    audioUrl: string;
};

export default function VoicePlayer({ audioUrl }: Props) {
    const player = useAudioPlayer({ uri: audioUrl });
    const status = useAudioPlayerStatus(player);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status.isLoaded) setIsLoading(false);
    }, [status.isLoaded]);

    const handlePlayPause = async () => {
        try {
            if (status.playing) {
                player.pause();
            } else {
                player.play();
            }
        } catch (err) {
            console.error("Failed to play audio:", err);
        }
    };

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        return `0:${seconds.toString().padStart(2, "0")}`;
    };

    const position = status.currentTime * 1000 || 0;
    const duration = status.duration * 1000 || 0;
    const progress = duration > 0 ? (position / duration) * 100 : 0;
    const isPlaying = status.playing || false;

    return (
        <View className="flex-row items-center gap-3 bg-[#1a1a1a] border border-[#282828] rounded-2xl px-4 py-3">

            {/* Play/Pause button */}
            <Pressable
                onPress={handlePlayPause}
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#1DB954",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                ) : (
                    <Ionicons
                        name={isPlaying ? "pause" : "play"}
                        size={18}
                        color="white"
                    />
                )}
            </Pressable>

            {/* Progress bar + time */}
            <View className="flex-1 gap-1">
                <View className="w-full h-1 bg-[#282828] rounded-full overflow-hidden">
                    <View
                        className="h-full bg-[#1DB954] rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </View>
                <View className="flex-row justify-between">
                    <Text className="text-[#555] text-xs">
                        {formatTime(position)}
                    </Text>
                    <Text className="text-[#555] text-xs">
                        {formatTime(duration)}
                    </Text>
                </View>
            </View>

            {/* Mic icon */}
            <Ionicons name="mic" size={16} color="#555" />
        </View>
    );
}