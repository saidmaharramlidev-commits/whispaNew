import i18n from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
    visible: boolean;
    onClose: () => void;
};

const steps = [
    {
        emoji: "💬",
        titleKey: "tutorialStep1Title",
        descKey: "tutorialStep1Desc",
    },
    {
        emoji: "❤️",
        titleKey: "tutorialStep2Title",
        descKey: "tutorialStep2Desc",
    },
    {
        emoji: "🔗",
        titleKey: "tutorialStep3Title",
        descKey: "tutorialStep3Desc",
    },
];

export default function TutorialModal({ visible, onClose }: Props) {
    const insets = useSafeAreaInsets();
    const [currentStep, setCurrentStep] = useState(0);

    const isLast = currentStep === steps.length - 1;
    const step = steps[currentStep];

    const handleNext = () => {
        if (isLast) {
            onClose();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View
                className="flex-1 bg-black/80 justify-center items-center px-8"
            >
                <View
                    className="bg-[#111] border border-[#282828] rounded-3xl w-full overflow-hidden"
                    style={{ paddingBottom: insets.bottom + 8 }}
                >
                    {/* Green top bar */}
                    <View className="h-1 bg-[#1DB954]" style={{
                        width: `${((currentStep + 1) / steps.length) * 100}%`
                    }} />

                    <View className="p-8">
                        {/* Step indicator */}
                        <Text className="text-[#555] text-xs tracking-widest uppercase mb-6">
                            {i18n.t("step")} {currentStep + 1} / {steps.length}
                        </Text>

                        {/* Emoji */}
                        <Text className="text-6xl mb-6">{step.emoji}</Text>

                        {/* Title */}
                        <Text className="text-white text-2xl font-bold mb-3">
                            {i18n.t(step.titleKey)}
                        </Text>

                        {/* Description */}
                        <Text className="text-[#888] text-base leading-6 mb-10">
                            {i18n.t(step.descKey)}
                        </Text>

                        {/* Dot indicators */}
                        <View className="flex-row gap-2 mb-8">
                            {steps.map((_, index) => (
                                <View
                                    key={index}
                                    className="h-1.5 rounded-full"
                                    style={{
                                        width: index === currentStep ? 24 : 8,
                                        backgroundColor: index === currentStep ? "#1DB954" : "#282828",
                                    }}
                                />
                            ))}
                        </View>

                        {/* Next / Get Started button */}
                        <TouchableOpacity
                            onPress={handleNext}
                            className="bg-[#1DB954] rounded-full py-4 items-center flex-row justify-center gap-2"
                        >
                            <Text className="text-black font-bold text-base">
                                {isLast ? i18n.t("getStarted") : i18n.t("next")}
                            </Text>
                            {!isLast && (
                                <Ionicons name="arrow-forward" size={18} color="black" />
                            )}
                        </TouchableOpacity>

                        {/* Skip */}
                        {!isLast && (
                            <TouchableOpacity
                                onPress={onClose}
                                className="items-center mt-4 py-2"
                            >
                                <Text className="text-[#555] text-sm">{i18n.t("skip")}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
}