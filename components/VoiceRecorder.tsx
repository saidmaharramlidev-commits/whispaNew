import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type Props = {
    onRecordingComplete: (uri: string) => void;
    onCancel: () => void;
};

export default function VoiceRecorder({ onRecordingComplete, onCancel }: Props) {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const MAX_SECONDS = 8;

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (recording) recording.stopAndUnloadAsync();
        };
    }, []);

    const startRecording = async () => {
        try {
            const { granted } = await Audio.requestPermissionsAsync();
            if (!granted) {
                alert("Microphone permission required");
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording: newRecording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(newRecording);
            setIsRecording(true);
            setSeconds(0);

            // start timer
            timerRef.current = setInterval(() => {
                setSeconds(prev => {
                    if (prev >= MAX_SECONDS - 1) {
                        stopRecording(newRecording);
                        return MAX_SECONDS;
                    }
                    return prev + 1;
                });
            }, 1000);

        } catch (err) {
            console.error("Failed to start recording:", err);
        }
    };

    const stopRecording = async (rec?: Audio.Recording) => {
        try {
            if (timerRef.current) clearInterval(timerRef.current);
            const activeRecording = rec || recording;
            if (!activeRecording) return;

            setIsRecording(false);
            await activeRecording.stopAndUnloadAsync();
            const uri = activeRecording.getURI();
            setRecording(null);

            if (uri) {
                onRecordingComplete(uri);
            }
        } catch (err) {
            console.error("Failed to stop recording:", err);
        }
    };

    const progress = (seconds / MAX_SECONDS) * 100;

    return (
        <View className="items-center gap-6 py-4">

            {/* Timer */}
            <View className="items-center gap-2">
                <Text className="text-white text-4xl font-bold">
                    {MAX_SECONDS - seconds}s
                </Text>
                <Text className="text-[#555] text-xs">
                    {isRecording ? "Recording..." : "Tap to record"}
                </Text>
            </View>

            {/* Progress bar */}
            <View className="w-full h-1.5 bg-[#282828] rounded-full overflow-hidden">
                <View
                    className="h-full bg-[#1DB954] rounded-full"
                    style={{ width: `${progress}%` }}
                />
            </View>

            {/* Record button */}
            {isUploading ? (
                <ActivityIndicator color="#1DB954" size="large" />
            ) : (
                <Pressable
                    onPress={isRecording ? () => stopRecording() : startRecording}
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        backgroundColor: isRecording ? "#ef4444" : "#1DB954",
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 4,
                        borderColor: isRecording ? "#ef444440" : "#1DB95440",
                    }}
                >
                    <Ionicons
                        name={isRecording ? "stop" : "mic"}
                        size={32}
                        color="white"
                    />
                </Pressable>
            )}

            <Text className="text-[#555] text-xs text-center">
                {isRecording ? "Tap to stop" : "Max 10 seconds"}
            </Text>

            {/* Cancel */}
            {!isRecording && (
                <Pressable onPress={onCancel}>
                    <Text className="text-[#555] text-sm">Cancel</Text>
                </Pressable>
            )}
        </View>
    );
}