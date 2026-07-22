import i18n from "@/lib/i18n";
import { useEffect } from "react";
import { Dimensions, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = 120;

type Props = {
    text: string;
    onLike: () => void;
    onDelete: () => void;
};

export default function SwipeableFeedbackCard({ text, onLike, onDelete }: Props) {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    // reset position when text changes (new card)
    useEffect(() => {
        translateX.value = 0;
        translateY.value = 0;
    }, [text]);

    const gesture = Gesture.Pan()
        .onUpdate((e) => {
            translateX.value = e.translationX;
            translateY.value = e.translationY * 0.2; // slight vertical movement
        })
        .onEnd((e) => {
            if (e.translationX > SWIPE_THRESHOLD) {
                // swipe right → like
                translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 });
                runOnJS(onLike)();
            } else if (e.translationX < -SWIPE_THRESHOLD) {
                // swipe left → delete
                translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 });
                runOnJS(onDelete)();
            } else {
                // snap back
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
            }
        });

    const cardStyle = useAnimatedStyle(() => {
        const rotate = interpolate(
            translateX.value,
            [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            [-20, 0, 20]
        );

        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { rotate: `${rotate}deg` },
            ],
        };
    });

    // green overlay opacity when swiping right
    const likeOverlayStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            translateX.value,
            [0, SWIPE_THRESHOLD],
            [0, 1],
            "clamp"
        );
        return { opacity };
    });

    // red overlay opacity when swiping left
    const deleteOverlayStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            translateX.value,
            [-SWIPE_THRESHOLD, 0],
            [1, 0],
            "clamp"
        );
        return { opacity };
    });

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View style={[{ width: "100%" }, cardStyle]}>
                <View
                    className="w-full rounded-3xl border border-[#1DB954]/20 bg-[#0a0a0a]"
                    style={{ minHeight: 280 }}
                >
                    {/* Like overlay — green */}
                    <Animated.View
                        style={[
                            {
                                position: "absolute",
                                top: 0, left: 0, right: 0, bottom: 0,
                                borderRadius: 24,
                                backgroundColor: "#1DB954",
                                opacity: 0,
                                zIndex: 10,
                                justifyContent: "center",
                                alignItems: "center",
                            },
                            likeOverlayStyle,
                        ]}
                        pointerEvents="none"
                    >
                        <Text style={{ fontSize: 60 }}>❤️</Text>
                        <Text style={{ color: "white", fontWeight: "800", fontSize: 24, marginTop: 8 }}>
                            LIKED
                        </Text>
                    </Animated.View>

                    {/* Delete overlay — red */}
                    <Animated.View
                        style={[
                            {
                                position: "absolute",
                                top: 0, left: 0, right: 0, bottom: 0,
                                borderRadius: 24,
                                backgroundColor: "#ef4444",
                                opacity: 0,
                                zIndex: 10,
                                justifyContent: "center",
                                alignItems: "center",
                            },
                            deleteOverlayStyle,
                        ]}
                        pointerEvents="none"
                    >
                        <Text style={{ fontSize: 60 }}>🗑️</Text>
                        <Text style={{ color: "white", fontWeight: "800", fontSize: 24, marginTop: 8 }}>
                            DELETE
                        </Text>
                    </Animated.View>

                    {/* Text content */}
                    <View className="px-8 py-6 flex-1 justify-center" style={{ minHeight: 180 }}>
                        <Text className="text-white text-xl text-center leading-9 tracking-wide">
                            {text}
                        </Text>
                    </View>

                    {/* Bottom */}
                    <View className="flex-row justify-between items-center px-8 pb-8">
                        <View className="flex-row items-center gap-2">
                            <View className="w-2 h-2 rounded-full bg-[#1DB954]" />
                            <Text className="text-[#1DB954] text-xs tracking-widest uppercase font-semibold">
                                {i18n.t("appName").toLowerCase()}
                            </Text>
                        </View>
                        <View className="bg-[#1a1a1a] border border-[#282828] px-3 py-1 rounded-full">
                            <Text className="text-[#555] text-xs tracking-wider uppercase">
                                {i18n.t("anonymous")}
                            </Text>
                        </View>
                    </View>
                </View>
            </Animated.View>
        </GestureDetector>
    );
}