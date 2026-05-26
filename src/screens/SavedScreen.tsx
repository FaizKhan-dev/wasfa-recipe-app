import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing, radius, typography } from '../theme';
import { RecipeCard } from '../components/RecipeCard';
import { RootStackParamList } from '../types/navigation';
import { useSavedRecipes } from '../context/SavedRecipesContext';
import { useAppSettings } from '../context/AppSettingsContext';
import { useRecipes } from '../context';

type SavedNavProp = NativeStackNavigationProp<RootStackParamList>;

const FILTERS = ['All', 'Breakfast', 'Main Course', 'Desserts'];

const SavedScreen: React.FC = () => {
  const navigation = useNavigation<SavedNavProp>();
  const [activeFilter, setActiveFilter] = useState('All');
  const { savedRecipeIds } = useSavedRecipes();
  const { recipes } = useRecipes();
  const { palette, t } = useAppSettings();
  const styles = React.useMemo(() => createStyles(palette), [palette]);

  const savedRecipes = recipes.filter((r) => savedRecipeIds.has(r.id));
  const filtered =
    activeFilter === 'All'
      ? savedRecipes
      : savedRecipes.filter((r) => r.category === activeFilter);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.saved}</Text>
        <TouchableOpacity style={styles.searchBtn} onPress={() => navigation.navigate('Search')} activeOpacity={0.8}>
          <Ionicons name="search-outline" size={20} color={palette.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <View>
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterScroll}
          renderItem={({ item }) => {
            const active = activeFilter === item;
            return (
              <TouchableOpacity
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setActiveFilter(item)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {item === 'All' ? t.all : item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Saved count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>{filtered.length} {t.itemsCount}</Text>
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState palette={palette} t={t} onExplore={() => navigation.navigate('Search')} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              variant="list"
              onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
              style={{ marginBottom: spacing.sm }}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
};

const EmptyState = ({
  palette,
  t,
  onExplore,
}: {
  palette: ReturnType<typeof useAppSettings>['palette'];
  t: ReturnType<typeof useAppSettings>['t'];
  onExplore: () => void;
}) => {
  const emptyStyles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
    iconWrap: {
      width: 72, height: 72,
      backgroundColor: palette.surface,
      borderRadius: radius.xl,
      alignItems: 'center', justifyContent: 'center',
      marginBottom: spacing.lg,
      borderWidth: 1, borderColor: palette.border,
    },
    title: { ...typography.titleLarge, color: palette.textPrimary, marginBottom: spacing.sm },
    sub: { ...typography.bodyMedium, color: palette.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
    btn: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      backgroundColor: palette.primary,
      borderRadius: radius.full,
    },
    btnText: { ...typography.titleSmall, color: '#FFFFFF', fontWeight: '700' },
  });

  return (
    <View style={emptyStyles.container}>
      <View style={emptyStyles.iconWrap}>
        <Ionicons name="bookmark-outline" size={36} color={palette.textMuted} />
      </View>
      <Text style={emptyStyles.title}>{t.noSavedRecipes}</Text>
      <Text style={emptyStyles.sub}>{t.savedRecipesAppearHere}</Text>
      <TouchableOpacity style={emptyStyles.btn} onPress={onExplore} activeOpacity={0.88}>
        <Text style={emptyStyles.btnText}>{t.exploreRecipes}</Text>
      </TouchableOpacity>
    </View>
  );
};

type Palette = {
  background: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryMuted: string;
};

const createStyles = (palette: Palette) =>
  StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: { ...typography.displaySmall, color: palette.textPrimary },
  searchBtn: {
    width: 40, height: 40,
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: palette.border,
  },
  filterScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  filterChipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  filterChipText: { ...typography.bodySmall, color: palette.textSecondary, fontWeight: '500' },
  filterChipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  countRow: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  countText: { ...typography.bodySmall, color: palette.textMuted },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
});

export default SavedScreen;
