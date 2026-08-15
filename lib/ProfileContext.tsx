import { useApi } from "@/lib/api";
import { useAuth } from "@clerk/expo";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type ProfileContextType = {
    hasProfile: boolean;
    profileChecked: boolean;
    refreshProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType>({
    hasProfile: true,
    profileChecked: false,
    refreshProfile: async () => { },
});

export function ProfileProvider({ children }: { children: ReactNode }) {
    const { isSignedIn, isLoaded } = useAuth();
    const api = useApi();
    const [hasProfile, setHasProfile] = useState(true);
    const [profileChecked, setProfileChecked] = useState(false);

    const refreshProfile = async () => {
        try {
            await api.getMe();
            setHasProfile(true);
        } catch (err: any) {
            setHasProfile(err?.status !== 404);
        } finally {
            setProfileChecked(true);
        }
    };

    useEffect(() => {
        if (!isLoaded || !isSignedIn) {
            setProfileChecked(false);
            return;
        }
        refreshProfile();
    }, [isSignedIn, isLoaded]);

    return (
        <ProfileContext.Provider value={{ hasProfile, profileChecked, refreshProfile }}>
            {children}
        </ProfileContext.Provider>
    );
}

export const useProfile = () => useContext(ProfileContext);