import { useAuth } from "@clerk/expo";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
export const PREMIUM_PRICE_DISPLAY = "$1.99";

export const useApi = () => {
    const { getToken } = useAuth();


    const request = async (endpoint: string, options: RequestInit = {}) => {
        const token = await getToken();

        if (!token) {
            console.log("No token available for:", endpoint)
            throw new Error("Not authenticated");
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...options.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            console.log("API Error:", response.status, endpoint, JSON.stringify(data))
            const err = new Error(data.message || data.error || "Something went wrong") as Error & { status?: number };
            err.status = response.status;
            throw err;
        }

        return data;
    };
    // ── User ──────────────────────────────────────
    const getMe = () => request("/users/me");
    const updateMe = (body: object) => request("/users/me", {
        method: "PATCH",
        body: JSON.stringify(body),
    });
    const getUserByUsername = (username: string) =>
        request(`/users/${username}`);
    const searchUsers = (q: string) => request(`/users/search?q=${q}`);

    // ── Follow ────────────────────────────────────
    const toggleFollow = (username: string) =>
        request(`/users/${username}/toggle`, {
            method: "POST",
        });
    const getFollowers = (username: string) =>
        request(`/users/${username}/followers`);
    const getFollowing = (username: string) =>
        request(`/users/${username}/following`);
    const removeFollower = (username: string) =>
        request(`/users/${username}/remove-follower`, {
            method: "DELETE",
        });

    // ── Feedback ──────────────────────────────────
    const getMyFeedbacks = () => request("/feedbacks/me");
    const getLikedFeedbacks = () => request("/feedbacks/liked");


    const sendFeedback = (
        username: string,
        text: string | null,
        senderUsername?: string | null,
        audioUrl?: string | null,
        type?: "text" | "voice" | "image",
        imageUrl?: string | null,
    ) =>
        request(`/feedbacks/${username}`, {
            method: "POST",
            body: JSON.stringify({ text, senderUsername, audioUrl, imageUrl, type }),
        });


    const deleteFeedback = (id: string) =>
        request(`/feedbacks/${id}`, { method: "DELETE" });


    const toggleLikeFeedback = (id: string) =>
        request(`/feedbacks/${id}/like`, {
            method: "PATCH",
        });


    // ── Replies ───────────────────────────────────
    const sendReply = (feedbackId: string, text: string) =>
        request(`/replies/${feedbackId}/reply`, {
            method: "POST",
            body: JSON.stringify({ text }),
        });

    const getMyReplies = () => request("/replies/inbox");

    const deleteReply = (replyId: string) =>
        request(`/replies/${replyId}`, { method: "DELETE" });

    // ── Streaks ───────────────────────────────────
    const getStreak = (clerkId: string) =>
        request(`/streaks/${clerkId}`);

    const getDailyCount = () => request("/feedbacks/daily-count");
    const reportFeedback = (id: string) =>
        request(`/feedbacks/${id}/report`, { method: "POST" });

    return {
        getMe,
        updateMe,
        getUserByUsername,
        searchUsers,
        toggleFollow,
        getFollowers,
        getFollowing,
        getMyFeedbacks,
        getLikedFeedbacks,
        sendFeedback,
        deleteFeedback,
        toggleLikeFeedback,
        removeFollower,
        sendReply,
        getMyReplies,
        deleteReply,
        getStreak,
        getDailyCount,
        reportFeedback,

    };
};