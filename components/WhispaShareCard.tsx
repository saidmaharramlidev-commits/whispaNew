import { Image, Text, View } from "react-native";

type Props = {
    text: string;
};

export default function WhispaShareCard({ text }: Props) {
    return (
        <View
            style={{
                width: 380,
                height: 560,
                backgroundColor: "#000000",
                borderRadius: 24,
                padding: 36,
                justifyContent: "space-between",
                borderWidth: 1,
                borderColor: "#1a1a1a",
            }}
        >
            {/* Top — logo + app name */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Image
                    source={require("../assets/images/Logo.png")}
                    style={{ width: 36, height: 36, borderRadius: 10 }}
                />
                <Text style={{ color: "#1DB954", fontSize: 18, fontWeight: "800", letterSpacing: 2 }}>
                    WhispaMe
                </Text>
            </View>

            {/* Middle — whispa text */}
            <View style={{
                flex: 1,
                justifyContent: "center",
                paddingVertical: 32,
            }}>


                <Text style={{
                    color: "#ffffff",
                    fontSize: text.length > 120 ? 20 : text.length > 60 ? 24 : 28,
                    fontWeight: "600",
                    lineHeight: text.length > 120 ? 30 : text.length > 60 ? 34 : 38,
                    letterSpacing: 0.3,
                }}>
                    "{text}"
                </Text>


            </View>

            {/* Bottom — anonymous badge */}
            <View style={{ gap: 12 }}>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    backgroundColor: "#1a1a1a",
                    borderRadius: 999,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    alignSelf: "flex-start",
                    borderWidth: 1,
                    borderColor: "#282828",
                }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#1DB954" }} />
                    <Text style={{ color: "#888", fontSize: 12, fontWeight: "600", letterSpacing: 1 }}>
                        SENT ANONYMOUSLY
                    </Text>
                </View>


            </View>
        </View>
    );
}