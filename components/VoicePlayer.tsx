import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type Props = {
    audioUrl: string;
};

export default function VoicePlayer({ audioUrl }: Props) {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        return () => {
            if (sound) sound.unloadAsync();
        };
    }, [sound]);

    const handlePlayPause = async () => {
        try {
            if (isPlaying && sound) {
                await sound.pauseAsync();
                setIsPlaying(false);
                return;
            }

            if (sound) {
                await sound.playAsync();
                setIsPlaying(true);
                return;
            }

            // load sound for first time
            setIsLoading(true);
            await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: audioUrl },
                { shouldPlay: true },
                (status) => {
                    if (status.isLoaded) {
                        setPosition(status.positionMillis || 0);
                        setDuration(status.durationMillis || 0);
                        if (status.didJustFinish) {
                            setIsPlaying(false);
                            setPosition(0);
                        }
                    }
                }
            );

            setSound(newSound);
            setIsPlaying(true);
            setIsLoading(false);

        } catch (err) {
            console.error("Failed to play audio:", err);
            setIsLoading(false);
        }
    };

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        return `0:${seconds.toString().padStart(2, "0")}`;
    };

    const progress = duration > 0 ? (position / duration) * 100 : 0;

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