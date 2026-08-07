import { Ionicons } from "@expo/vector-icons";
import { AudioModule, RecordingPresets, useAudioRecorder } from "expo-audio";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
    onRecordingComplete: (uri: string) => void;
    onCancel: () => void;
};

export default function VoiceRecorder({ onRecordingComplete, onCancel }: Props) {
    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const [isRecording, setIsRecording] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const MAX_SECONDS = 8;

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (isRecording) audioRecorder.stop();
        };
    }, []);

    const startRecording = async () => {
        try {
            const status = await AudioModule.requestRecordingPermissionsAsync();
            if (!status.granted) {
                alert("Microphone permission required");
                return;
            }

            await audioRecorder.prepareToRecordAsync();
            audioRecorder.record();
            setIsRecording(true);
            setSeconds(0);

            timerRef.current = setInterval(() => {
                setSeconds(prev => {
                    if (prev >= MAX_SECONDS - 1) {
                        stopRecording();
                        return MAX_SECONDS;
                    }
                    return prev + 1;
                });
            }, 1000);

        } catch (err) {
            console.error("Failed to start recording:", err);
        }
    };

    const stopRecording = async () => {
        try {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsRecording(false);
            await audioRecorder.stop();
            const uri = audioRecorder.uri;
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

            <Text className="text-[#555] text-xs text-center">
                {isRecording ? "Tap to stop" : "Max 8 seconds"}
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