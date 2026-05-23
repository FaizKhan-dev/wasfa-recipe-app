import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, radius, typography } from '../theme';
import { RootStackParamList, TabParamList } from '../types/navigation';
import { useAppSettings, useProfile } from '../context';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import SavedScreen from '../screens/SavedScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import { DrawerProvider } from './DrawerContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.78;

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

/* ─── Bottom Tab ─── */
const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  const { palette, t } = useAppSettings();
  const ProfileScreen = require('../screens/ProfileScreen').default;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 78 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 12),
            paddingTop: 10,
          },
        ],
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color }) => {
          const icons: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
            Home:    ['home',     'home-outline'],
            Saved:   ['bookmark', 'bookmark-outline'],
            List:    ['list',     'list-outline'],
            Profile: ['person',   'person-outline'],
          };
          const [active, inactive] = icons[route.name] ?? ['ellipse', 'ellipse-outline'];
          return <Ionicons name={focused ? active : inactive} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"    component={HomeScreen} options={{ tabBarLabel: t.home }} />
      <Tab.Screen name="Saved"   component={SavedScreen} options={{ tabBarLabel: t.saved }} />
      <Tab.Screen name="List"    component={ShoppingListScreen} options={{ tabBarLabel: t.list }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t.profile }} />
    </Tab.Navigator>
  );
};

/* ─── Root Stack ─── */
const RootStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs"     component={TabNavigator} />
    <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen}
      options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name="Search"       component={SearchScreen}
      options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
  </Stack.Navigator>
);

/* ─── Custom Drawer Content ─── */
type DrawerItem = {
  icon: keyof typeof Ionicons.glyphMap;
  screen: string;
  labelKey: 'home' | 'saved' | 'list' | 'profile';
};

const DRAWER_ITEMS: DrawerItem[] = [
  { icon: 'home-outline',     labelKey: 'home',    screen: 'MainTabs' },
  { icon: 'bookmark-outline', labelKey: 'saved',   screen: 'Saved' },
  { icon: 'list-outline',     labelKey: 'list',    screen: 'List' },
  { icon: 'person-outline',   labelKey: 'profile', screen: 'Profile' },
];

const DrawerContent = ({
  onClose,
  onNavigate,
  activeScreen,
}: {
  onClose: () => void;
  onNavigate: (screen: string) => void;
  activeScreen: string;
}) => {
  const insets = useSafeAreaInsets();
  const { palette, t } = useAppSettings();
  const { name, email, avatarUrl } = useProfile();
  return (
    <View style={[drawerStyles.container, { paddingTop: insets.top + spacing.md, backgroundColor: palette.surface }]}> 
      {/* Profile */}
      <View style={drawerStyles.profile}>
        <Image
          source={{ uri: avatarUrl }}
          style={drawerStyles.avatar}
        />
        <View>
          <Text style={[drawerStyles.name, { color: palette.textPrimary }]}>{name}</Text>
          <Text style={[drawerStyles.email, { color: palette.textSecondary }]}>{email}</Text>
        </View>
      </View>

      <View style={drawerStyles.divider} />

      {/* Nav items */}
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {DRAWER_ITEMS.map((item) => {
          const active = activeScreen === item.screen;
          return (
            <TouchableOpacity
              key={item.screen}
              style={[drawerStyles.item, active && drawerStyles.itemActive]}
              onPress={() => { onNavigate(item.screen); onClose(); }}
              activeOpacity={0.75}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={active ? palette.primary : palette.textSecondary}
              />
              <Text style={[drawerStyles.itemLabel, { color: active ? palette.primary : palette.textSecondary }]}>
                {t[item.labelKey]}
              </Text>
              {active && <View style={drawerStyles.activeBar} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={drawerStyles.divider} />

      {/* Sign out */}
      <TouchableOpacity style={drawerStyles.signOut} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={palette.error} />
        <Text style={drawerStyles.signOutText}>{t.signOut}</Text>
      </TouchableOpacity>

      <Text style={[drawerStyles.version, { paddingBottom: insets.bottom + spacing.md }]}> 
        Recipify v1.0.0
      </Text>
    </View>
  );
};

/* ─── App Navigator (Custom Drawer Wrapper) ─── */
const AppNavigator = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState('MainTabs');
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const navigationRef = useRef<any>(null);
  const insets = useSafeAreaInsets();

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const closeDrawer = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: -DRAWER_WIDTH,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setDrawerOpen(false));
  }, []);

  const handleNavigate = useCallback((screen: string) => {
    setActiveScreen(screen);
    if (navigationRef.current) {
      if (screen === 'MainTabs' || screen === 'Home') {
        navigationRef.current.navigate('MainTabs');
      } else {
        navigationRef.current.navigate('MainTabs', { screen });
      }
    }
  }, []);

  return (
    <DrawerProvider value={{ openDrawer, closeDrawer, drawerOpen }}>
      <NavigationContainer ref={navigationRef}>
        <RootStack />

        {drawerOpen && (
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <Animated.View
              style={[styles.overlay, { opacity: overlayOpacity }]}
            />
          </TouchableWithoutFeedback>
        )}

        <Animated.View
          style={[
            styles.drawer,
            { transform: [{ translateX }] },
          ]}
          pointerEvents={drawerOpen ? 'auto' : 'none'}
        >
          <DrawerContent
            onClose={closeDrawer}
            onNavigate={handleNavigate}
            activeScreen={activeScreen}
          />
        </Animated.View>
      </NavigationContainer>
    </DrawerProvider>
  );
};

export default AppNavigator;

/* ─── Drawer item styles ─── */
const drawerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSurface,
    paddingHorizontal: spacing.md,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  avatar: {
    width: 52, height: 52,
    borderRadius: radius.full,
    borderWidth: 2, borderColor: colors.primary,
  },
  name: { ...typography.titleMedium, color: colors.textPrimary },
  email: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    marginVertical: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  itemActive: {
    backgroundColor: colors.primaryMuted,
  },
  itemLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  itemLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  activeBar: {
    position: 'absolute',
    right: 0, top: 8, bottom: 8,
    width: 3,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  signOutText: {
    ...typography.bodyMedium,
    color: colors.error,
    fontWeight: '500',
  },
  version: {
    ...typography.label,
    color: colors.textMuted,
    textAlign: 'center',
    paddingTop: spacing.sm,
  },
});

/* ─── Main styles ─── */
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.bgSurface,
    borderTopColor: colors.cardBorder,
    borderTopWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    ...typography.label,
    marginTop: 2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 50,
  },
  drawer: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0,
    width: DRAWER_WIDTH,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  hamburger: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 48,
    left: spacing.md,
    width: 40, height: 40,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.cardBorder,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});
