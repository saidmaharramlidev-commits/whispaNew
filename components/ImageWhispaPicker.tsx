import i18n from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";

type Props = {
    onImageSelected: (imageUrl: string) => void;
    onCancel: () => void;
};

export default function ImageWhispaPicker({ onImageSelected, onCancel }: Props) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const pickImage = async (useCamera: boolean) => {
        try {
            let result;

            if (useCamera) {
                const permission = await ImagePicker.requestCameraPermissionsAsync();
                if (!permission.granted) {
                    alert(i18n.t("cameraPermissionRequired"));
                    return;
                }
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ["images"],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.7,
                });
            } else {
                const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!permission.granted) {
                    alert(i18n.t("galleryPermissionRequired"));
                    return;
                }
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ["images"],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.7,
                });
            }

            if (!result.canceled) {
                const asset = result.assets[0];

                // check file size — 5MB limit
                const fileInfo = await FileSystem.getInfoAsync(asset.uri);
                if (fileInfo.exists && fileInfo.size && fileInfo.size > 5 * 1024 * 1024) {
                    alert(i18n.t("imageTooLarge"));
                    return;
                }

                setPreview(asset.uri);
                await uploadImage(asset);
            }
        } catch (err) {
            console.error("Failed to pick image:", err);
        }
    };

    const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
        try {
            setUploading(true);
            const mimeType = asset.mimeType || "image/jpeg";

            const base64 = await FileSystem.readAsStringAsync(asset.uri, {
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
                        folder: "whispas",
                    }),
                }
            );

            if (!response.ok) {
                const errData = await response.json();
                console.error("Cloudinary error:", errData);
                alert(i18n.t("failedToUploadAvatar"));
                setPreview(null);
                return;
            }

            const data = await response.json();
            onImageSelected(data.secure_url);

        } catch (err) {
            console.error("Failed to upload image:", err);
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    return (
        <View className="items-center gap-5 py-4">

            {/* Preview */}
            {preview ? (
                <View className="relative">
                    <Image
                        source={{ uri: preview }}
                        style={{ width: 200, height: 200, borderRadius: 16 }}
                    />
                    {uploading && (
                        <View style={{
                            position: "absolute",
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: "rgba(0,0,0,0.6)",
                            borderRadius: 16,
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 8,
                        }}>
                            <ActivityIndicator color="#1DB954" size="large" />
                            <Text className="text-white text-xs">{i18n.t("uploadingImage")}</Text>
                        </View>
                    )}
                </View>
            ) : (
                <View style={{
                    width: 200,
                    height: 200,
                    borderRadius: 16,
                    backgroundColor: "#1a1a1a",
                    borderWidth: 1,
                    borderColor: "#282828",
                    borderStyle: "dashed",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 8,
                }}>
                    <Ionicons name="image-outline" size={40} color="#555" />
                    <Text className="text-[#555] text-xs">{i18n.t("selectImage")}</Text>
                </View>
            )}

            {/* Pick buttons */}
            {!uploading && (
                <View className="flex-row gap-3">
                    <Pressable
                        onPress={() => pickImage(true)}
                        className="flex-row items-center gap-2 bg-[#1a1a1a] border border-[#282828] px-4 py-3 rounded-full"
                    >
                        <Ionicons name="camera-outline" size={16} color="#b3b3b3" />
                        <Text className="text-white text-sm">{i18n.t("camera")}</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => pickImage(false)}
                        className="flex-row items-center gap-2 bg-[#1a1a1a] border border-[#282828] px-4 py-3 rounded-full"
                    >
                        <Ionicons name="images-outline" size={16} color="#b3b3b3" />
                        <Text className="text-white text-sm">{i18n.t("gallery")}</Text>
                    </Pressable>
                </View>
            )}


            {/* Image disclaimer */}
            <Text className="text-[#ff0000a9] text-xs text-center mb-4 px-4">
                {i18n.t("imageDisclaimer")}
            </Text>

            {/* Cancel */}
            {!uploading && (
                <Pressable onPress={onCancel}>
                    <Text className="text-[#555] text-sm">{i18n.t("cancel")}</Text>
                </Pressable>
            )}
        </View>
    );
}