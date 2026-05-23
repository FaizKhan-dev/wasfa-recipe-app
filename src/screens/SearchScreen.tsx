import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Animated,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing, radius, typography } from '../theme';
import { recipes, popularTags } from '../data/mockData';
import { RecipeCard } from '../components/RecipeCard';
import { SearchBar } from '../components/SearchBar';
import { RootStackParamList } from '../types/navigation';

type SearchNavProp = NativeStackNavigationProp<RootStackParamList>;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const AT_HOME_CATEGORIES = [
  { id: 'dairy', label: 'Dairy Products' },
  { id: 'meat', label: 'Meat & Fish' },
  { id: 'veg', label: 'Vegetables' },
  { id: 'grains', label: 'Grains' },
];

const COOKING_METHODS = [
  { id: 'frying', label: 'Frying', image: 'https://images.unsplash.com/photo-1626197031507-c17099753214?w=200&q=80' },
  { id: 'baking', label: 'Baking', image: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=200&q=80' },
  { id: 'grilling', label: 'Grilling', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80' },
  { id: 'boiling', label: 'Boiling', image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=200&q=80' },
];

const DISH_TYPES = [
  { id: 'desserts', label: 'Desserts', image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=200&q=80' },
  { id: 'soups', label: 'Soups', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&q=80' },
  { id: 'main', label: 'Main Courses', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&q=80' },
  { id: 'apps', label: 'Appetizers', image: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=200&q=80' },
];

// Filter Modal Cuisines / Diets
const FILTER_CUISINES = ['Italian', 'Mexican', 'Indian', 'Middle Eastern'];
const FILTER_DIETS = ['Vegetarian', 'Vegan', 'Keto', 'Gluten-Free', 'Healthy'];
const PREP_MIN = 10;
const PREP_MAX = 60;

const METHOD_MATCHES: Record<string, string[]> = {
  frying: ['omelette', 'skillet', 'fried', 'seared', 'toast'],
  baking: ['bake', 'baking', 'cake', 'bread', 'pie'],
  grilling: ['grill', 'grilled', 'shawarma', 'steak', 'bbq'],
  boiling: ['boil', 'boiled', 'soup', 'pasta', 'carbonara'],
};

const DISH_MATCHES: Record<string, string[]> = {
  desserts: ['dessert', 'cake', 'sweet', 'berry'],
  soups: ['soup', 'broth', 'stew'],
  main: ['main course', 'steak', 'shawarma', 'pasta', 'carbonara'],
  apps: ['appetizer', 'toast', 'bite', 'salad', 'omelette'],
};

const HOME_MATCHES: Record<string, string[]> = {
  dairy: ['cheese', 'butter', 'cream', 'feta'],
  meat: ['beef', 'steak', 'chicken', 'guanciale', 'shawarma'],
  veg: ['vegetable', 'pepper', 'onion', 'avocado', 'berries'],
  grains: ['spaghetti', 'flour', 'bread', 'rice', 'toast'],
};

const SearchScreen = () => {
  const navigation = useNavigation<SearchNavProp>();
  const [query, setQuery] = useState('');
  const [activeAtHome, setActiveAtHome] = useState<string[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [selectedDishTypes, setSelectedDishTypes] = useState<string[]>([]);
  const [searchApplied, setSearchApplied] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);

  // Filter state
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [prepTime, setPrepTime] = useState(30);

  const isTyping = query.length > 0;

  const filteredRecipes = recipes.filter((recipe) => {
    const text = [
      recipe.title,
      recipe.description,
      recipe.category,
      recipe.cuisine,
      recipe.tags.join(' '),
      recipe.ingredients.map((ingredient) => ingredient.name).join(' '),
    ]
      .join(' ')
      .toLowerCase();

    const queryMatch = !query || text.includes(query.toLowerCase());

    const homeMatch =
      activeAtHome.length === 0 ||
      activeAtHome.some((home) => HOME_MATCHES[home]?.some((keyword) => text.includes(keyword)));

    const methodMatch =
      selectedMethods.length === 0 ||
      selectedMethods.some((method) => METHOD_MATCHES[method]?.some((keyword) => text.includes(keyword)));

    const dishMatch =
      selectedDishTypes.length === 0 ||
      selectedDishTypes.some((dish) => DISH_MATCHES[dish]?.some((keyword) => text.includes(keyword)));

    return queryMatch && homeMatch && methodMatch && dishMatch;
  });

  const hasSearchCriteria =
    query.length > 0 ||
    activeAtHome.length > 0 ||
    selectedMethods.length > 0 ||
    selectedDishTypes.length > 0;

  const toggleFilter = <T,>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

  const applyFilters = () => setFilterVisible(false);
  const resetFilters = () => {
    setSelectedCuisines([]);
    setSelectedDiets([]);
    setPrepTime(30);
  };

  const toggleSelection = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setter((current) => toggleFilter(current, value));
    setSearchApplied(true);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.searchWrap}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onFilterPress={() => setFilterVisible(true)}
            onClearPress={() => setQuery('')}
            autoFocus
          />
        </View>
      </View>

      {isTyping ? (
        /* ── Results Mode ── */
        <ScrollView style={styles.scroll} contentContainerStyle={styles.resultsContent}>
          {/* Popular tags */}
          <View style={styles.tagsSection}>
            <View style={styles.tagsHeader}>
              <Ionicons name="heart-outline" size={16} color={colors.primary} />
              <Text style={styles.tagsTitle}>Most popular</Text>
              <TouchableOpacity activeOpacity={0.7} style={{ marginLeft: 'auto' }}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagsGrid}>
              {popularTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.popularTag}
                  activeOpacity={0.8}
                  onPress={() => setQuery(tag)}
                >
                  <Text style={styles.popularTagText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Results */}
          {filteredRecipes.length > 0 && (
            <View style={styles.resultsList}>
              {filteredRecipes.map((r) => (
                <RecipeCard
                  key={r.id}
                  recipe={r}
                  variant="list"
                  onPress={() => navigation.navigate('RecipeDetail', { recipeId: r.id })}
                  style={{ marginBottom: spacing.sm }}
                />
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        /* ── Browse Mode ── */
        <ScrollView style={styles.scroll} contentContainerStyle={styles.browseContent}>
          {/* At Home */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>At Home I Have:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {AT_HOME_CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.atHomeChip,
                    activeAtHome.includes(c.id) && styles.atHomeChipActive,
                  ]}
                  onPress={() => toggleSelection(setActiveAtHome, c.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.atHomeChipText,
                      activeAtHome.includes(c.id) && styles.atHomeChipTextActive,
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Cooking Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cooking Method:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {COOKING_METHODS.map((m) => (
                <ImageChip
                  key={m.id}
                  label={m.label}
                  image={m.image}
                  selected={selectedMethods.includes(m.id)}
                  onPress={() => toggleSelection(setSelectedMethods, m.id)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Dish Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dish Type:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {DISH_TYPES.map((d) => (
                <ImageChip
                  key={d.id}
                  label={d.label}
                  image={d.image}
                  selected={selectedDishTypes.includes(d.id)}
                  onPress={() => toggleSelection(setSelectedDishTypes, d.id)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Find CTA */}
          <TouchableOpacity
            style={styles.findBtn}
            activeOpacity={0.88}
            onPress={() => setSearchApplied(true)}
          >
            <Text style={styles.findBtnText}>Find</Text>
          </TouchableOpacity>

          {(searchApplied || hasSearchCriteria) && (
            <View style={styles.findResultsSection}>
              <Text style={styles.resultsTitle}>
                {filteredRecipes.length} recipe{filteredRecipes.length === 1 ? '' : 's'} found
              </Text>
              {filteredRecipes.length > 0 ? (
                filteredRecipes.map((r) => (
                  <RecipeCard
                    key={r.id}
                    recipe={r}
                    variant="list"
                    onPress={() => navigation.navigate('RecipeDetail', { recipeId: r.id })}
                    style={{ marginBottom: spacing.sm }}
                  />
                ))
              ) : (
                <View style={styles.emptyResults}>
                  <Ionicons name="search-outline" size={28} color={colors.textMuted} />
                  <Text style={styles.emptyResultsTitle}>No matches yet</Text>
                  <Text style={styles.emptyResultsSub}>
                    Try another combination of ingredients, method, or dish type.
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* ── Filter Modal ── */}
      <Modal visible={filterVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setFilterVisible(false)}
          />
          <View style={styles.filterSheet}>
            {/* Handle */}
            <View style={styles.handle} />

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setFilterVisible(false)}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={18} color={colors.textPrimary} />
            </TouchableOpacity>

            <Text style={styles.filterTitle}>Set Filters</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Cuisine */}
              <Text style={styles.filterGroup}>Cuisine</Text>
              <View style={styles.chipRow}>
                {FILTER_CUISINES.map((c) => (
                  <FilterChip
                    key={c}
                    label={c}
                    selected={selectedCuisines.includes(c)}
                    onPress={() => setSelectedCuisines((p) => toggleFilter(p, c))}
                  />
                ))}
              </View>

              {/* Prep Time */}
              <Text style={styles.filterGroup}>Preparation Time</Text>
              <View style={styles.sliderRow}>
                {[10, 20, 30, 40, 50, 60].map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[styles.sliderDot, prepTime >= val && styles.sliderDotActive]}
                    onPress={() => setPrepTime(val)}
                    activeOpacity={0.8}
                  />
                ))}
              </View>
              <View style={styles.sliderLabels}>
                {[10, 20, 30, 40, 50, '60+'].map((v) => (
                  <Text key={String(v)} style={styles.sliderLabel}>{v}</Text>
                ))}
              </View>

              {/* Diet */}
              <Text style={styles.filterGroup}>Diet</Text>
              <View style={styles.chipRow}>
                {FILTER_DIETS.map((d) => (
                  <FilterChip
                    key={d}
                    label={d}
                    selected={selectedDiets.includes(d)}
                    onPress={() => setSelectedDiets((p) => toggleFilter(p, d))}
                  />
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.applyBtn} onPress={applyFilters} activeOpacity={0.88}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetBtn} onPress={resetFilters} activeOpacity={0.8}>
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

/* ── Sub-components ── */
const ImageChip = ({
  label,
  image,
  selected,
  onPress,
}: {
  label: string;
  image: string;
  selected?: boolean;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    style={[chipStyles.wrap, selected && chipStyles.wrapSelected]}
    activeOpacity={0.88}
    onPress={onPress}
  >
    <Image source={{ uri: image }} style={chipStyles.img} />
    <View style={[chipStyles.overlay, selected && chipStyles.overlaySelected]} />
    <Text style={chipStyles.label}>{label}</Text>
  </TouchableOpacity>
);

const chipStyles = StyleSheet.create({
  wrap: { width: 90, height: 90, borderRadius: radius.lg, overflow: 'hidden', marginRight: spacing.sm, borderWidth: 1, borderColor: 'transparent' },
  wrapSelected: { borderColor: colors.primary },
  img: { width: '100%', height: '100%', resizeMode: 'cover' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  overlaySelected: { backgroundColor: 'rgba(245,166,35,0.20)' },
  label: { position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', ...typography.label, color: colors.textPrimary },
});

const FilterChip = ({
  label, selected, onPress,
}: {
  label: string; selected: boolean; onPress: () => void;
}) => (
  <TouchableOpacity
    style={[filterChipStyles.chip, selected && filterChipStyles.chipSelected]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={[filterChipStyles.text, selected && filterChipStyles.textSelected]}>{label}</Text>
  </TouchableOpacity>
);

const filterChipStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  text: { ...typography.bodySmall, color: colors.textSecondary },
  textSelected: { color: colors.primary, fontWeight: '600' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  backBtn: {
    width: 40, height: 40,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  searchWrap: { flex: 1 },
  scroll: { flex: 1 },
  browseContent: { paddingBottom: 100 },
  resultsContent: { paddingBottom: 100 },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  hScroll: { paddingHorizontal: spacing.md, gap: spacing.sm },
  atHomeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  atHomeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  atHomeChipText: { ...typography.bodySmall, color: colors.textSecondary },
  atHomeChipTextActive: { color: colors.textInverse, fontWeight: '700' },
  findBtn: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  findBtnText: { ...typography.titleMedium, color: colors.textInverse, fontWeight: '700' },
  findResultsSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  resultsTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.lg,
  },
  emptyResultsTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  emptyResultsSub: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Results
  tagsSection: { padding: spacing.md },
  tagsHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  tagsTitle: { ...typography.titleSmall, color: colors.textPrimary },
  seeAll: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  popularTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  popularTagText: { ...typography.bodySmall, color: colors.textSecondary },
  resultsList: { paddingHorizontal: spacing.md },

  // Filter Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  filterSheet: {
    backgroundColor: colors.bgSurface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  handle: {
    width: 40, height: 4,
    backgroundColor: colors.cardBorder,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  closeBtn: {
    width: 36, height: 36,
    backgroundColor: colors.card,
    borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center',
    position: 'absolute',
    top: spacing.md,
    left: spacing.lg,
  },
  filterTitle: {
    ...typography.titleLarge,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  filterGroup: {
    ...typography.titleSmall,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  sliderRow: {
    flexDirection: 'row',
    height: 4,
    backgroundColor: colors.cardBorder,
    borderRadius: radius.full,
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  sliderDot: {
    flex: 1, height: 4, backgroundColor: colors.cardBorder,
  },
  sliderDotActive: { backgroundColor: colors.primary },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  sliderLabel: { ...typography.label, color: colors.textMuted },
  applyBtn: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center',
    marginTop: spacing.lg,
  },
  applyBtnText: { ...typography.titleMedium, color: colors.textInverse, fontWeight: '700' },
  resetBtn: {
    height: 56,
    backgroundColor: 'transparent',
    borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.cardBorder,
    marginTop: spacing.sm,
  },
  resetBtnText: { ...typography.titleMedium, color: colors.primary },
});

export default SearchScreen;
