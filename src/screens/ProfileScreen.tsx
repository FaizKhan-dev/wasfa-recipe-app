import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing, radius, typography } from '../theme';
import { useAppSettings, useProfile } from '../context';
import { RootStackParamList } from '../types/navigation';

type ProfileNavProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<'metric' | 'imperial'>('metric');
  const [measurementOpen, setMeasurementOpen] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  const { palette, t, themeMode, setThemeMode } = useAppSettings();
  const { name, email, avatarUrl, setName, setEmail, setAvatarUrl } = useProfile();
  const navigation = useNavigation<ProfileNavProp>();
  const darkMode = themeMode === 'dark';
  const styles = useMemo(() => createStyles(palette), [palette]);

  const saveProfile = () => {
    setEditVisible(false);
  };

  const pickAvatarFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow gallery access to choose a profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const signOut = () => {
    Alert.alert('Sign out', 'This demo does not connect to a real account yet.');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>{t.settings}</Text>

        <TouchableOpacity style={styles.profileRow} activeOpacity={0.88} onPress={() => setEditVisible(true)}>
          <Image source={{ uri: avatarUrl }} style={styles.profileAvatar} />
          <View style={styles.profileText}>
            <Text style={styles.profileName}>{name}</Text>
            <Text style={styles.profileEdit}>{t.tapToEditProfile}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={palette.textMuted} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.8} onPress={() => setMeasurementOpen((open) => !open)}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIconWrap}>
                <Ionicons name="scale-outline" size={18} color={palette.textSecondary} />
              </View>
              <View>
                <Text style={styles.settingLabel}>{t.measurementUnits}</Text>
                <Text style={styles.settingValue}>{selectedUnit === 'metric' ? 'kg, ml' : 'lb, fl oz'}</Text>
              </View>
            </View>
            <Ionicons name={measurementOpen ? 'chevron-up' : 'chevron-down'} size={18} color={palette.textMuted} />
          </TouchableOpacity>

          {measurementOpen && (
            <View style={styles.unitOptions}>
              {(['metric', 'imperial'] as const).map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[styles.unitOption, selectedUnit === unit && styles.unitOptionActive]}
                  onPress={() => setSelectedUnit(unit)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.unitLabel, selectedUnit === unit && styles.unitLabelActive]}>
                    {unit === 'metric' ? t.metric : t.imperial}
                  </Text>
                  {selectedUnit === unit && <Ionicons name="checkmark-circle" size={18} color={palette.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIconWrap}>
                <Ionicons name="notifications-outline" size={18} color={palette.textSecondary} />
              </View>
              <View>
                <Text style={styles.settingLabel}>{t.notifications}</Text>
                <Text style={styles.settingValue}>{notifications ? 'Enabled' : 'Disabled'}</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: palette.border, true: palette.primary }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={palette.border}
            />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.manageRecipesRow}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ManageRecipes')}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIconWrap}>
                <Ionicons name="create-outline" size={18} color={palette.textSecondary} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Manage Recipes</Text>
                <Text style={styles.settingValue}>Open the API CRUD demo screen</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIconWrap}>
                <Ionicons name="moon-outline" size={18} color={palette.textSecondary} />
              </View>
              <View>
                <Text style={styles.settingLabel}>{t.darkMode}</Text>
                <Text style={styles.settingValue}>{darkMode ? 'On' : 'Off'}</Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={(value) => setThemeMode(value ? 'dark' : 'light')}
              trackColor={{ false: palette.border, true: palette.primary }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={palette.border}
            />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.card}>
          <TouchableOpacity style={styles.signOutRow} activeOpacity={0.8} onPress={signOut}>
            <Ionicons name="log-out-outline" size={18} color={palette.error} />
            <Text style={styles.signOutText}>{t.signOut}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Recipify v1.0.0 · Made with love</Text>
      </ScrollView>

      <Modal visible={editVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={() => setEditVisible(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t.editProfile}</Text>
            <View style={styles.avatarPickerWrap}>
              <Image source={{ uri: avatarUrl }} style={styles.avatarPreview} />
              <TouchableOpacity style={styles.avatarPickBtn} onPress={pickAvatarFromGallery} activeOpacity={0.85}>
                <Ionicons name="image-outline" size={18} color={palette.primary} />
                <Text style={styles.avatarPickText}>Choose from gallery</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Full name"
              placeholderTextColor={palette.textMuted}
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              placeholderTextColor={palette.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setEditVisible(false)} activeOpacity={0.8}>
                <Text style={styles.secondaryBtnText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={saveProfile} activeOpacity={0.88}>
                <Text style={styles.primaryBtnText}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

type Palette = {
  background: string;
  surface: string;
  elevated: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryMuted: string;
  error: string;
};

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: palette.background },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 100 },
    pageTitle: {
      ...typography.displayMedium,
      color: palette.textPrimary,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      marginBottom: spacing.lg,
    },
    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    profileAvatar: {
      width: 56,
      height: 56,
      borderRadius: radius.full,
      borderWidth: 2,
      borderColor: palette.primary,
    },
    profileText: { flex: 1 },
    profileName: { ...typography.titleMedium, color: palette.textPrimary },
    profileEdit: { ...typography.bodySmall, color: palette.textSecondary, marginTop: 2 },
    divider: {
      height: 1,
      backgroundColor: palette.border,
      marginHorizontal: spacing.md,
      marginVertical: spacing.sm,
    },
    card: {
      marginHorizontal: spacing.md,
      backgroundColor: palette.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: palette.border,
      overflow: 'hidden',
      marginVertical: spacing.xs,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      flex: 1,
    },
    settingIconWrap: {
      width: 34,
      height: 34,
      backgroundColor: palette.elevated,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settingLabel: { ...typography.bodyMedium, color: palette.textPrimary, fontWeight: '600' },
    settingValue: { ...typography.bodySmall, color: palette.textSecondary, marginTop: 2 },
    manageRecipesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    unitOptions: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
      gap: spacing.sm,
    },
    unitOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: 10,
      borderRadius: radius.md,
      backgroundColor: palette.elevated,
      borderWidth: 1,
      borderColor: palette.border,
    },
    unitOptionActive: {
      borderColor: palette.primary,
      backgroundColor: palette.primaryMuted,
    },
    unitLabel: { ...typography.bodySmall, color: palette.textSecondary },
    unitLabelActive: { color: palette.primary, fontWeight: '600' },
    signOutRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    signOutText: { ...typography.bodyMedium, color: palette.error, fontWeight: '600' },
    versionText: {
      ...typography.label,
      color: palette.textMuted,
      textAlign: 'center',
      marginTop: spacing.xl,
      paddingBottom: spacing.md,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.65)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    modalCard: {
      width: '100%',
      backgroundColor: palette.surface,
      borderRadius: radius.xl,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: palette.border,
    },
    modalTitle: {
      ...typography.titleLarge,
      color: palette.textPrimary,
      marginBottom: spacing.md,
      textAlign: 'center',
    },
    avatarPickerWrap: {
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    avatarPreview: {
      width: 88,
      height: 88,
      borderRadius: radius.full,
      borderWidth: 2,
      borderColor: palette.primary,
      marginBottom: spacing.sm,
    },
    avatarPickBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: spacing.md,
      paddingVertical: 10,
      borderRadius: radius.full,
      backgroundColor: palette.primaryMuted,
      borderWidth: 1,
      borderColor: palette.border,
    },
    avatarPickText: {
      ...typography.bodyMedium,
      color: palette.primary,
      fontWeight: '600',
    },
    input: {
      height: 50,
      backgroundColor: palette.elevated,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      ...typography.bodyMedium,
      color: palette.textPrimary,
      borderWidth: 1,
      borderColor: palette.border,
      marginBottom: spacing.sm,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    secondaryBtn: {
      flex: 1,
      height: 50,
      backgroundColor: palette.elevated,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: palette.border,
    },
    secondaryBtnText: { ...typography.bodyMedium, color: palette.textSecondary, fontWeight: '600' },
    primaryBtn: {
      flex: 1,
      height: 50,
      backgroundColor: palette.primary,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtnText: { ...typography.bodyMedium, color: '#FFFFFF', fontWeight: '700' },
  });

export default ProfileScreen;