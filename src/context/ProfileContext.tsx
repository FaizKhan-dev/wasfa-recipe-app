import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_STORAGE_KEY = 'recipify.profile.v1';

const DEFAULT_PROFILE = {
  name: 'Ayesha',
  email: 'Ayesha@recipify.app',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
};

type ProfileContextValue = {
  name: string;
  email: string;
  avatarUrl: string;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setAvatarUrl: (avatarUrl: string) => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [name, setName] = useState(DEFAULT_PROFILE.name);
  const [email, setEmail] = useState(DEFAULT_PROFILE.email);
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_PROFILE.avatarUrl);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const stored = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
        if (!stored || !mounted) {
          return;
        }

        const parsed = JSON.parse(stored) as Partial<typeof DEFAULT_PROFILE>;
        if (parsed.name) {
          setName(parsed.name);
        }
        if (parsed.email) {
          setEmail(parsed.email);
        }
        if (parsed.avatarUrl) {
          setAvatarUrl(parsed.avatarUrl);
        }
      } catch (error) {
        console.warn('Failed to load profile settings:', error);
      } finally {
        if (mounted) {
          setHydrated(true);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const saveProfile = async () => {
      try {
        await AsyncStorage.setItem(
          PROFILE_STORAGE_KEY,
          JSON.stringify({ name, email, avatarUrl }),
        );
      } catch (error) {
        console.warn('Failed to save profile settings:', error);
      }
    };

    saveProfile();
  }, [hydrated, name, email, avatarUrl]);

  const value = useMemo(
    () => ({ name, email, avatarUrl, setName, setEmail, setAvatarUrl }),
    [name, email, avatarUrl],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export const useProfile = () => {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }

  return context;
};