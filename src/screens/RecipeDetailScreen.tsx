import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing, radius, typography } from '../theme';
import { useRecipes } from '../context';
import { RootStackParamList } from '../types/navigation';
import { useSavedRecipes, useShoppingList } from '../context/SavedRecipesContext';

type RecipeDetailRouteProp = RouteProp<RootStackParamList, 'RecipeDetail'>;

const { width, height } = Dimensions.get('window');
const IMAGE_HEIGHT = height * 0.42;

type Tab = 'Ingredients' | 'Steps' | 'Reviews';

const STAR_REVIEWS = [
  { author: 'Sarah M.', rating: 5, text: 'Absolutely perfect! The steak was juicy and full of flavor. Will make again.', date: '2 days ago' },
  { author: 'Ahmed K.', rating: 4, text: 'Great recipe, followed the steps exactly. Turned out amazing.', date: '1 week ago' },
];

const RecipeDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RecipeDetailRouteProp>();
  const { recipeId } = route.params;

  const { recipes } = useRecipes();
  const { isRecipeSaved, toggleRecipeSaved } = useSavedRecipes();
  const { addIngredientsFromRecipe } = useShoppingList();

  const recipe = recipes.find((r) => r.id === recipeId) ?? recipes[0];
  const [activeTab, setActiveTab] = useState<Tab>('Ingredients');
  const [servings, setServings] = useState(recipe?.servings ?? 1);
  const scrollY = useRef(new Animated.Value(0)).current;

  if (!recipe) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']}>
          <Text style={[styles.title, { padding: spacing.md }]}>Recipe not found.</Text>
        </SafeAreaView>
      </View>
    );
  }

  const saved = isRecipeSaved(recipe.id);

  const headerOpacity = scrollY.interpolate({
    inputRange: [IMAGE_HEIGHT - 100, IMAGE_HEIGHT - 40],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Floating Header (appears on scroll) */}
      <Animated.View style={[styles.floatingHeader, { opacity: headerOpacity }]}>
        <SafeAreaView edges={['top']}>
          <View style={styles.floatingHeaderInner}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.floatingTitle} numberOfLines={1}>{recipe.title}</Text>
            <TouchableOpacity style={styles.headerBtn} onPress={() => void toggleRecipeSaved(recipe.id)} activeOpacity={0.8}>
              <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={20} color={saved ? colors.primary : colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: recipe.image }} style={styles.heroImage} />
          <LinearGradient
            colors={['transparent', 'rgba(13,13,13,0.7)', colors.bg]}
            style={StyleSheet.absoluteFillObject}
            locations={[0.4, 0.75, 1]}
          />
          {/* Back + Bookmark overlayed on image */}
          <SafeAreaView style={styles.heroActions} edges={['top']}>
            <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroBtn} onPress={() => void toggleRecipeSaved(recipe.id)} activeOpacity={0.8}>
              <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={22} color={saved ? colors.primary : colors.textPrimary} />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title + Stars */}
          <Text style={styles.title}>{recipe.title}</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Ionicons key={s} name={s <= Math.floor(recipe.rating) ? 'star' : 'star-outline'} size={18} color={colors.primary} />
            ))}
            <Text style={styles.ratingCount}>({recipe.rating})</Text>
          </View>

          {/* Stats Pills */}
          <View style={styles.statRow}>
            <TouchableOpacity style={styles.statPill} activeOpacity={0.85}>
              <Ionicons name="restaurant-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.statValue}>{servings} Servings</Text>
              <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
            </TouchableOpacity>
            <View style={styles.statPill}>
              <Ionicons name="flame-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.statValue}>{recipe.calories} Cal</Text>
            </View>
            <View style={styles.statPill}>
              <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.statValue}>{recipe.duration}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descSection}>
            <Text style={styles.descLabel}>Description</Text>
            <Text style={styles.desc}>{recipe.description}</Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabRow}>
            {(['Ingredients', 'Steps', 'Reviews'] as Tab[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={styles.tabBtn}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                {activeTab === tab && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          {activeTab === 'Ingredients' && (
            <View style={styles.ingredientsList}>
              {recipe.ingredients.map((ing) => (
                <View key={ing.id} style={styles.ingredientRow}>
                  <View style={styles.ingredientDot} />
                  <Text style={styles.ingredientName}>{ing.name}</Text>
                  <Text style={styles.ingredientAmount}>
                    {ing.amount}{ing.unit}
                  </Text>
                </View>
              ))}
              {recipe.ingredients.length === 0 && (
                <Text style={styles.emptyText}>No ingredients listed yet.</Text>
              )}
            </View>
          )}

          {activeTab === 'Steps' && (
            <View style={styles.stepsList}>
              {recipe.steps.map((step) => (
                <View key={step.id} style={styles.stepRow}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{step.step}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepText}>{step.instruction}</Text>
                    {step.duration && (
                      <View style={styles.stepDuration}>
                        <Ionicons name="time-outline" size={12} color={colors.primary} />
                        <Text style={styles.stepDurationText}>{step.duration}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
              {recipe.steps.length === 0 && (
                <Text style={styles.emptyText}>Steps coming soon.</Text>
              )}
            </View>
          )}

          {activeTab === 'Reviews' && (
            <View style={styles.reviewsList}>
              {STAR_REVIEWS.map((rev, i) => (
                <View key={i} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewAvatarText}>{rev.author[0]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewAuthor}>{rev.author}</Text>
                      <Text style={styles.reviewDate}>{rev.date}</Text>
                    </View>
                    <View style={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons key={s} name={s <= rev.rating ? 'star' : 'star-outline'} size={12} color={colors.primary} />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewText}>{rev.text}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomCTA}>
        <TouchableOpacity
          style={styles.ctaBtn}
          activeOpacity={0.88}
          onPress={() => {
            addIngredientsFromRecipe(recipe);
            navigation.navigate('MainTabs', { screen: 'List' });
          }}
        >
          <Ionicons name="cart-outline" size={20} color={colors.textInverse} />
          <Text style={styles.ctaBtnText}>Create Shopping List</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  // Floating header
  floatingHeader: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    backgroundColor: colors.bg,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  floatingHeaderInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  floatingTitle: {
    flex: 1,
    ...typography.titleMedium,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerBtn: {
    width: 38, height: 38,
    backgroundColor: colors.card,
    borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.cardBorder,
  },

  // Hero
  heroContainer: { height: IMAGE_HEIGHT, position: 'relative' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroActions: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  heroBtn: {
    width: 42, height: 42,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center',
  },

  // Content
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.lg },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: spacing.sm,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: spacing.lg,
  },
  ratingCount: { ...typography.bodySmall, color: colors.textMuted, marginLeft: 4 },

  // Stats
  statRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  statValue: { ...typography.bodySmall, color: colors.textPrimary, fontWeight: '500' },

  // Description
  descSection: { marginBottom: spacing.lg },
  descLabel: { ...typography.titleSmall, color: colors.textPrimary, marginBottom: spacing.sm },
  desc: { ...typography.bodyMedium, color: colors.textSecondary, lineHeight: 22 },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    marginBottom: spacing.lg,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: spacing.sm,
    position: 'relative',
  },
  tabText: { ...typography.bodyMedium, color: colors.textMuted, fontWeight: '500' },
  tabTextActive: { color: colors.textPrimary, fontWeight: '700' },
  tabIndicator: {
    position: 'absolute',
    bottom: -1, left: '20%', right: '20%',
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },

  // Ingredients
  ingredientsList: { gap: 0 },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    gap: spacing.sm,
  },
  ingredientDot: {
    width: 10, height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  ingredientName: { ...typography.bodyMedium, color: colors.textPrimary, flex: 1 },
  ingredientAmount: { ...typography.bodySmall, color: colors.textSecondary },

  // Steps
  stepsList: { gap: spacing.md },
  stepRow: { flexDirection: 'row', gap: spacing.md },
  stepNumber: {
    width: 32, height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  stepNumberText: { ...typography.label, color: colors.primary, fontWeight: '700' },
  stepContent: { flex: 1 },
  stepText: { ...typography.bodyMedium, color: colors.textPrimary, lineHeight: 22 },
  stepDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  stepDurationText: { ...typography.label, color: colors.primary },

  // Reviews
  reviewsList: { gap: spacing.md },
  reviewCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  reviewAvatar: {
    width: 36, height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.primary,
  },
  reviewAvatarText: { ...typography.titleSmall, color: colors.primary },
  reviewAuthor: { ...typography.bodyMedium, color: colors.textPrimary, fontWeight: '600' },
  reviewDate: { ...typography.bodySmall, color: colors.textMuted },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewText: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 18 },

  // Empty state
  emptyText: { ...typography.bodyMedium, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xl },

  // Bottom CTA
  bottomCTA: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: spacing.md,
    paddingBottom: 32,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  ctaBtn: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  ctaBtnText: { ...typography.titleMedium, color: colors.textInverse, fontWeight: '700' },
});

export default RecipeDetailScreen;
