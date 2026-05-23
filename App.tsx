import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppNavigator from './src/navigation';
import { AppSettingsProvider, ProfileProvider, SavedRecipesProvider, ShoppingListProvider } from './src/context';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('Error during app startup:', e);
      } finally {
        setAppReady(true);
      }
    }
    prepare();
  }, []);

  if (!appReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#0D0D0D" />
        <AppSettingsProvider>
          <ProfileProvider>
            <SavedRecipesProvider>
              <ShoppingListProvider>
                <AppNavigator />
              </ShoppingListProvider>
            </SavedRecipesProvider>
          </ProfileProvider>
        </AppSettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
