import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

export interface UserProfile {
  personalDetails?: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: string;
  };
  avatarUrl?: string;
  preferences?: {
    dietaryRestrictions: string[];
    notifications: boolean;
    newsletter: boolean;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface ProfileState {
  profile: UserProfile;
  currentStep: number;
  isComplete: boolean;
}

interface UserProfileContextType extends ProfileState {
  updatePersonalDetails: (details: UserProfile["personalDetails"]) => void;
  updatePreferences: (preferences: UserProfile["preferences"]) => void;
  updateAddress: (address: UserProfile["address"]) => void;
  uploadAvatar: (file: File) => Promise<void>;
  removeAvatar: () => Promise<void>;
  setCurrentStep: (step: number) => void;
  skipStep: (step: number) => void;
  completeProfile: () => void;
  resetProfile: () => void;
}

const UserProfileContext = createContext<UserProfileContextType | null>(null);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { user, updateUser } = useAuth();
  const API_BASE = (import.meta as any).env.VITE_API_URL || "";
  const [state, setState] = useState<ProfileState>({
    profile: {},
    currentStep: 0,
    isComplete: false,
  });

  // Load profile from localStorage on mount or when user changes
  useEffect(() => {
    if (user?.id) {
      const savedProfile = localStorage.getItem(
        `organic-life-profile-${user.id}`,
      );
      if (savedProfile) {
        try {
          const profileData = JSON.parse(savedProfile);
          setState({
            profile: profileData.profile,
            currentStep: profileData.currentStep || 0,
            isComplete: profileData.isComplete || false,
          });
        } catch (error) {
          console.error("Failed to load profile from localStorage:", error);
        }
      }
    }
  }, [user?.id]);

  // Save profile to localStorage
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(
        `organic-life-profile-${user.id}`,
        JSON.stringify({
          profile: state.profile,
          currentStep: state.currentStep,
          isComplete: state.isComplete,
        }),
      );
    }
  }, [state, user?.id]);

  const updatePersonalDetails = (details: UserProfile["personalDetails"]) => {
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, personalDetails: details },
    }));
  };

  const updatePreferences = (preferences: UserProfile["preferences"]) => {
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, preferences },
    }));
  };

  const updateAddress = (address: UserProfile["address"]) => {
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, address },
    }));
  };

  const uploadAvatar = async (file: File) => {
    if (!user?.id) return;
    // Optimistic local preview: read as data URL and set locally
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setState((prev) => ({
        ...prev,
        profile: { ...prev.profile, avatarUrl: dataUrl },
      }));
    };
    reader.readAsDataURL(file);

    try {
      const data = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = reject;
        r.readAsDataURL(file);
      });

      const resp = await fetch(`${API_BASE}/api/profile/avatar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, filename: file.name, data }),
      });
      if (!resp.ok) throw new Error("Upload failed");
      const body = await resp.json();
      if (body?.url) {
        setState((prev) => ({
          ...prev,
          profile: { ...prev.profile, avatarUrl: body.url },
        }));
      }
    } catch (err) {
      console.error("Failed to upload avatar", err);
    }
  };

  const removeAvatar = async () => {
    if (!user?.id) return;
    // remove locally
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, avatarUrl: undefined },
    }));
    try {
      await fetch(`${API_BASE}/api/profile/avatar/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
    } catch (err) {
      // ignore
    }
  };

  const setCurrentStep = (step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  const skipStep = (step: number) => {
    // Mark step as skipped and move to next
    setState((prev) => ({ ...prev, currentStep: step + 1 }));
  };

  const completeProfile = () => {
    setState((prev) => ({ ...prev, isComplete: true }));
    if (user) {
      updateUser({ profileComplete: true });
    }
  };

  const resetProfile = () => {
    setState({
      profile: {},
      currentStep: 0,
      isComplete: false,
    });
    if (user?.id) {
      localStorage.removeItem(`organic-life-profile-${user.id}`);
    }
  };

  const value: UserProfileContextType = {
    ...state,
    updatePersonalDetails,
    updatePreferences,
    updateAddress,
    uploadAvatar,
    removeAvatar,
    setCurrentStep,
    skipStep,
    completeProfile,
    resetProfile,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
}
