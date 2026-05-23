import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '../theme';
import { cuisineCategories, recipes, aiRecommendations } from '../data/mockData';
import { RecipeCard } from '../components/RecipeCard';
import { SearchBar } from '../components/SearchBar';
import { SectionHeader } from '../components/SectionHeader';
import { RootStackParamList } from '../types/navigation';
import { useDrawerControls } from '../navigation/DrawerContext';
import { useAppSettings } from '../context/AppSettingsContext';

type HomeNavProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavProp>();
  const { openDrawer } = useDrawerControls();
  const insets = useSafeAreaInsets();
  const { palette } = useAppSettings();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [activeCuisine, setActiveCuisine] = useState('all');
  const [query, setQuery] = useState('');

  const featuredRecipes = useMemo(
    () => recipes.filter((recipe) => recipe.isFeatured),
    [],
  );

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesCuisine = activeCuisine === 'all' || recipe.cuisine === activeCuisine;
      const matchesQuery = query.trim().length === 0
        || recipe.title.toLowerCase().includes(query.toLowerCase())
        || recipe.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));

      return matchesCuisine && matchesQuery;
    });
  }, [activeCuisine, query]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 128 }]}
      >
        <View style={styles.headerBlock}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={openDrawer}
              activeOpacity={0.85}
            >
              <Ionicons name="menu" size={22} color={palette.textPrimary} />
            </TouchableOpacity>

            <Text style={styles.kicker}>Good evening</Text>

          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => navigation.navigate('Search')}
            activeOpacity={0.85}
          >
            <Ionicons name="search-outline" size={20} color={palette.textPrimary} />
          </TouchableOpacity>
        </View>

          <Text style={styles.title}>What would you like to cook?</Text>
        </View>

        <View style={styles.searchWrap}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onClearPress={() => setQuery('')}
            onFilterPress={() => navigation.navigate('Search')}
            onMicPress={() => navigation.navigate('Search')}
            placeholder="Search recipes, tags, cuisines"
          />
        </View>

        <View style={styles.sectionBlock}>
          <SectionHeader title="Browse Categories" showSeeAll={false} />
          <FlatList
            data={cuisineCategories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.categoryRow}
            renderItem={({ item }) => {
              const active = activeCuisine === item.id;
              return (
                <TouchableOpacity
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                  onPress={() => setActiveCuisine(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.categoryIcon}>{item.icon}</Text>
                  <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        <View style={styles.sectionBlock}>
          <SectionHeader title="Featured Recipes" onSeeAll={() => navigation.navigate('Search')} />
          <FlatList
            data={featuredRecipes}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.featuredRow}
            renderItem={({ item }) => (
              <RecipeCard
                recipe={item}
                variant="featured"
                onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
                style={styles.featuredCardSpacing}
              />
            )}
          />
        </View>

        <View style={styles.sectionBlock}>
          <SectionHeader title="AI Picks For You" onSeeAll={() => navigation.navigate('Search')} />
          {aiRecommendations.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.recommendationCard}
              onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.recipe.id })}
              activeOpacity={0.88}
            >
              <View style={styles.recommendationBadge}>
                <Ionicons name="sparkles" size={14} color={palette.primary} />
                <Text style={styles.recommendationBadgeText}>{item.label}</Text>
              </View>
              <Text style={styles.recommendationTitle}>{item.recipe.title}</Text>
              <Text style={styles.recommendationSub} numberOfLines={2}>
                {item.recipe.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionBlock}>
          <SectionHeader title="All Recipes" onSeeAll={() => navigation.navigate('Search')} />
          <FlatList
            data={filteredRecipes}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            renderItem={({ item }) => (
              <RecipeCard
                recipe={item}
                onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
                style={styles.gridCardSpacing}
              />
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

type Palette = {
  background: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  primary: string;
  primaryMuted: string;
};

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: palette.background,
    },
    content: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
    },
    headerBlock: {
      marginBottom: spacing.md,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    kicker: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: palette.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginTop: 2,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: palette.textPrimary,
      lineHeight: 34,
      marginRight: spacing.md,
    },
    menuButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.border,
    },
    searchButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.border,
    },
    searchWrap: {
      marginBottom: spacing.lg,
    },
    sectionBlock: {
      marginBottom: spacing.xl,
    },
    categoryRow: {
      paddingTop: spacing.md,
      gap: spacing.sm,
    },
    categoryChip: {
      minWidth: 86,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderRadius: 18,
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.border,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    categoryChipActive: {
      backgroundColor: palette.primaryMuted,
      borderColor: palette.primary,
    },
    categoryIcon: {
      fontSize: 18,
    },
    categoryLabel: {
      color: palette.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    categoryLabelActive: {
      color: palette.primary,
    },
    featuredRow: {
      paddingTop: spacing.md,
      gap: spacing.md,
    },
    featuredCardSpacing: {
      marginRight: spacing.sm,
    },
    recommendationCard: {
      backgroundColor: palette.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: palette.border,
      padding: spacing.md,
      marginTop: spacing.md,
    },
    recommendationBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: spacing.sm,
    },
    recommendationBadgeText: {
      color: palette.primary,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    recommendationTitle: {
      color: palette.textPrimary,
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 6,
    },
    recommendationSub: {
      color: palette.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    gridRow: {
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    gridCardSpacing: {
      marginBottom: spacing.sm,
    },
  });

export default HomeScreen;
