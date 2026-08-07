import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

type Props = {
    onPress: () => void;
};

export default function PremiumBadge({ onPress }: Props) {
    const glow = useSharedValue(0.4);
    const scale = useSharedValue(1);

    useEffect(() => {
        glow.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.4, { duration: 1400, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
        scale.value = withRepeat(
            withSequence(
                withTiming(1.06, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glow.value,
        transform: [{ scale: scale.value }],
    }));

    return (
        <Pressable onPress={onPress}>
            <View style={{ width: 46, height: 46, alignItems: "center", justifyContent: "center" }}>
                {/* Soft glow ring behind the badge */}
                <Animated.View
                    style={[
                        { position: "absolute", width: 46, height: 46 },
                        glowStyle,
                    ]}
                    pointerEvents="none"
                >
                    <Svg width={46} height={46}>
                        <Defs>
                            <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
                                <Stop offset="0%" stopColor="#1DB954" stopOpacity="0.9" />
                                <Stop offset="100%" stopColor="#1DB954" stopOpacity="0" />
                            </RadialGradient>
                        </Defs>
                        <Circle cx="23" cy="23" r="23" fill="url(#glow)" />
                    </Svg>
                </Animated.View>

                {/* Gradient badge */}
                <View
                    style={{
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: "#1DB954",
                    }}
                >
                    <Svg width={38} height={38} style={{ position: "absolute" }}>
                        <Defs>
                            <RadialGradient id="badge" cx="30%" cy="20%" r="90%">
                                <Stop offset="0%" stopColor="#1DB954" stopOpacity="1" />
                                <Stop offset="55%" stopColor="#0d5c29" stopOpacity="1" />
                                <Stop offset="100%" stopColor="#000000" stopOpacity="1" />
                            </RadialGradient>
                        </Defs>
                        <Circle cx="19" cy="19" r="19" fill="url(#badge)" />
                    </Svg>
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <Ionicons name="diamond" size={17} color="#ffffff" />
                    </View>
                </View>
            </View>
        </Pressable>
    );
}