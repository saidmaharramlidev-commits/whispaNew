import * as WebBrowser from "expo-web-browser";
import { ActivityIndicator, View } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export default function SSOCallback() {

    return (
        <View className="flex-1 bg-black justify-center items-center">
            <ActivityIndicator size="large" color="#1DB954" />
        </View>
    );
}