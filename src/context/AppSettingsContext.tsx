import React, { createContext, useContext, useMemo, useState } from 'react';

type ThemeMode = 'dark' | 'light';

const darkPalette = {
  background: '#0D0D0D',
  surface: '#141414',
  elevated: '#1A1A1A',
  border: '#2C2C2E',
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textMuted: '#52525B',
  textInverse: '#0D0D0D',
  primary: '#F5A623',
  primaryMuted: 'rgba(245,166,35,0.12)',
  error: '#FF453A',
};

const lightPalette = {
  background: '#F6F4EF',
  surface: '#FFFFFF',
  elevated: '#F0ECE4',
  border: '#E5DED3',
  textPrimary: '#1A1A1A',
  textSecondary: '#5F5A52',
  textMuted: '#8A8177',
  textInverse: '#FFFFFF',
  primary: '#C77607',
  primaryMuted: 'rgba(199,118,7,0.12)',
  error: '#C0392B',
};

const translations = {
  English: {
    settings: 'Settings',
    home: 'Home',
    saved: 'Saved',
    list: 'List',
    profile: 'Profile',
    all: 'All',
    tapToEditProfile: 'Tap to edit profile',
    measurementUnits: 'Measurement Units',
    notifications: 'Notifications',
    darkMode: 'Dark Mode',
    signOut: 'Sign Out',
    manageRecipes: 'Manage Recipes',
    editProfile: 'Edit Profile',
    cancel: 'Cancel',
    save: 'Save',
    clearDone: 'Clear done',
    itemsCount: 'items',
    yourListIsEmpty: 'Your list is empty',
    addIngredientsOrManual: 'Add ingredients from a recipe or add them manually',
    hideCompleted: 'Hide completed',
    showCompleted: 'Show completed',
    addItem: 'Add Item',
    add: 'Add',
    itemPlaceholder: 'e.g. Cherry Tomatoes',
    noSavedRecipes: 'No saved recipes',
    savedRecipesAppearHere: 'Recipes you save will appear here',
    exploreRecipes: 'Explore Recipes',
    metric: 'Metric (kg, ml)',
    imperial: 'Imperial (lb, fl oz)',
  },
} as const;

type AppSettingsContextValue = {
  themeMode: ThemeMode;
  palette: typeof darkPalette;
  t: typeof translations.English;
  setThemeMode: (mode: ThemeMode) => void;
};

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');

  const palette = themeMode === 'dark' ? darkPalette : lightPalette;
  const t = translations.English;

  const value = useMemo(
    () => ({ themeMode, palette, t, setThemeMode }),
    [themeMode, palette, t],
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
};

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);

  if (!context) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }

  return context;
};
