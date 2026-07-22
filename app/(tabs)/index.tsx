import LikedOverlay from "@/components/LikedOverlay";
import ShareProfileModal from "@/components/ShareProfileModal";
import SwipeableFeedbackCard from "@/components/SwipeableFeedbackCard"; // ← new
import TutorialModal from "@/components/TutorialModal";
import { useApi } from "@/lib/api";
import i18n from "@/lib/i18n";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Feedback = {
  _id: string;
  text: string;
  isLiked: boolean;
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { isLoaded, isSignedIn } = useAuth();
  const api = useApi();

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [likedFeedbacks, setLikedFeedbacks] = useState<Feedback[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLiked, setShowLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const checkTutorial = async () => {
    const flag = await AsyncStorage.getItem("showTutorial");
    if (flag === "true") {
      setShowTutorial(true);
      await AsyncStorage.removeItem("showTutorial");
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchFeedbacks();
      fetchLikedFeedbacks();
      fetchUsername();
      checkTutorial();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await api.getMyFeedbacks();
      setFeedbacks(data.data);
      setCurrentIndex(0);
    } catch (err) {
      console.error("Failed to load feedbacks:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsername = async () => {
    try {
      const data = await api.getMe();
      setUsername(data.data.username);
    } catch (err) {
      console.error("Failed to fetch username:", err);
    }
  };

  const fetchLikedFeedbacks = async () => {
    try {
      const data = await api.getLikedFeedbacks();
      setLikedFeedbacks(data.data);
    } catch (err) {
      console.error("Failed to load liked feedbacks:", err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchFeedbacks(), fetchLikedFeedbacks()]);
    setRefreshing(false);
  };

  const handleLike = async () => {
    const feedback = feedbacks[currentIndex];
    setCurrentIndex(prev => prev + 1);
    try {
      await api.toggleLikeFeedback(feedback._id);
      const data = await api.getLikedFeedbacks();
      setLikedFeedbacks(data.data);
    } catch (err) {
      console.error("Failed to like feedback:", err);
    }
  };

  const handleDelete = async () => {
    const feedback = feedbacks[currentIndex];
    setCurrentIndex(prev => prev + 1);
    try {
      await api.deleteFeedback(feedback._id);
    } catch (err) {
      console.error("Failed to delete feedback:", err);
    }
  };

  const currentFeedback = feedbacks[currentIndex];
  const isFinished = currentIndex >= feedbacks.length;

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>

      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4">
        <TouchableOpacity
          onPress={() => setShowShareModal(true)}
          className="bg-[#1a1a1a] p-2 rounded-full border border-[#282828]"
        >
          <Ionicons name="share-outline" size={20} color="#b3b3b3" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowLiked(true)}
          className="bg-[#1a1a1a] px-4 py-2 rounded-full border border-[#282828]"
        >
          <Text className="text-white text-sm font-semibold">{i18n.t("liked")}</Text>
        </TouchableOpacity>
      </View>

      {/* Liked Overlay */}
      {showLiked && (
        <LikedOverlay
          likedFeedbacks={likedFeedbacks}
          onClose={() => setShowLiked(false)}
          onUnlike={(id) => setLikedFeedbacks(prev => prev.filter(f => f._id !== id))}
        />
      )}

      <ShareProfileModal
        visible={showShareModal}
        username={username}
        onClose={() => setShowShareModal(false)}
      />

      <TutorialModal
        visible={showTutorial}
        onClose={() => setShowTutorial(false)}
      />

      {/* Feed */}
      <FlatList
        data={[]}
        renderItem={null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1DB954"]}
            progressBackgroundColor="#000000"
          />
        }
        ListEmptyComponent={
          isFinished ? (
            <View className="flex-1 justify-center items-center gap-4">
              <Text className="text-5xl">🎉</Text>
              <Text className="text-white text-lg font-bold">{i18n.t("allCaughtUp")}</Text>
              <Text className="text-[#b3b3b3] text-sm text-center px-10">
                {i18n.t("noMoreWhispas")}
              </Text>
            </View>
          ) : (
            <View className="justify-center items-center px-6 mt-35">
              <Text className="text-[#b3b3b3] text-sm mb-6">
                {currentIndex + 1} / {feedbacks.length}
              </Text>

              {/* Swipeable card */}
              <SwipeableFeedbackCard
                text={currentFeedback.text}
                onLike={handleLike}
                onDelete={handleDelete}
              />

              {/* Swipe hint */}
              <View className="flex-row justify-between items-center px-4 mt-6 w-full">
                <View className="flex-row items-center gap-2">
                  <Text className="text-red-400 text-sm">←</Text>
                  <Text className="text-[#555] text-xs">{i18n.t("swipeDelete")}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-[#555] text-xs">{i18n.t("swipeLike")}</Text>
                  <Text className="text-[#1DB954] text-sm">→</Text>
                </View>
              </View>
            </View>
          )
        }
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom }}
      />
    </View>
  );
}