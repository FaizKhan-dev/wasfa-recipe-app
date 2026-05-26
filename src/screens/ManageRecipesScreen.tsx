import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing, typography } from '../theme';

import { Recipe, Ingredient, Step } from '../data/mockData';
import { useAppSettings, useRecipes } from '../context';
import { RootStackParamList } from '../types/navigation';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80';

type RecipeFormState = {
  title: string;
  image: string;
  duration: string;
  rating: string;
  calories: string;
  servings: string;
  cuisine: string;
  category: string;
  description: string;
  tags: string;
  ingredients: string;
  steps: string;
  isFeatured: boolean;
  isSaved: boolean;
};

const createEmptyForm = (): RecipeFormState => ({
  title: '',
  image: DEFAULT_IMAGE,
  duration: '30 Min',
  rating: '4.5',
  calories: '320',
  servings: '2',
  cuisine: 'american',
  category: 'Main Course',
  description: '',
  tags: 'Quick, Family, Easy',
  ingredients: 'Chicken Breast|250|g\nGarlic|2|cloves\nOlive Oil|1|tbsp',
  steps: 'Season the chicken.|5 min\nCook until golden and done.|15 min',
  isFeatured: false,
  isSaved: false,
});

const createId = (prefix: string, index: number) => `${prefix}-${Date.now()}-${index}`;

const splitLines = (value: string) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const parseIngredients = (value: string): Ingredient[] =>
  splitLines(value)
    .map((line, index) => {
      const [name = '', amount = '', unit = ''] = line.split('|').map((part) => part.trim());

      if (!name) {
        return null;
      }

      return {
        id: createId('ingredient', index),
        name,
        amount,
        unit,
      };
    })
    .filter((item): item is Ingredient => item !== null);

const parseSteps = (value: string): Step[] =>
  splitLines(value)
    .map((line, index) => {
      const [instruction = '', duration = ''] = line.split('|').map((part) => part.trim());

      if (!instruction) {
        return null;
      }

      const step: Step = {
        id: createId('step', index),
        step: index + 1,
        instruction,
      };

      if (duration) {
        step.duration = duration;
      }

      return step;
    })
    .filter((item): item is Step => item !== null);

const recipeToForm = (recipe: Recipe): RecipeFormState => ({
  title: recipe.title,
  image: recipe.image,
  duration: recipe.duration,
  rating: String(recipe.rating),
  calories: String(recipe.calories),
  servings: String(recipe.servings),
  cuisine: recipe.cuisine,
  category: recipe.category,
  description: recipe.description,
  tags: recipe.tags.join(', '),
  ingredients: recipe.ingredients
    .map((ingredient) => [ingredient.name, ingredient.amount, ingredient.unit].join('|'))
    .join('\n'),
  steps: recipe.steps
    .map((step) => [step.instruction, step.duration ?? ''].join('|'))
    .join('\n'),
  isFeatured: recipe.isFeatured,
  isSaved: recipe.isSaved,
});

const formToPayload = (form: RecipeFormState): Omit<Recipe, 'id'> => ({
  title: form.title.trim(),
  image: form.image.trim() || DEFAULT_IMAGE,
  duration: form.duration.trim() || '30 Min',
  rating: Number(form.rating) || 0,
  calories: Number(form.calories) || 0,
  servings: Number(form.servings) || 1,
  cuisine: form.cuisine.trim() || 'american',
  category: form.category.trim() || 'Main Course',
  isFeatured: form.isFeatured,
  isSaved: form.isSaved,
  description: form.description.trim(),
  tags: form.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean),
  ingredients: parseIngredients(form.ingredients),
  steps: parseSteps(form.steps),
});

type ManageStyles = ReturnType<typeof createStyles>;
type ManageNavProp = NativeStackNavigationProp<RootStackParamList>;

const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  styles,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  styles: ManageStyles;
}) => (
  <View style={styles.fieldBlock}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.textArea]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      multiline={multiline}
      keyboardType={keyboardType}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  </View>
);

const ManageRecipesScreen: React.FC = () => {
  const { palette } = useAppSettings();
  const navigation = useNavigation<ManageNavProp>();
  const {
    recipes,
    loading,
    refreshRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
  } = useRecipes();
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [form, setForm] = useState<RecipeFormState>(createEmptyForm());
  const styles = useMemo(() => createStyles(palette), [palette]);

  useEffect(() => {
    void refreshRecipes();
  }, [refreshRecipes]);

  const editingRecipe = useMemo(
    () => recipes.find((recipe) => recipe.id === editingRecipeId),
    [recipes, editingRecipeId],
  );

  const startCreateMode = () => {
    setEditingRecipeId(null);
    setForm(createEmptyForm());
  };

  const startEditMode = (recipe: Recipe) => {
    setEditingRecipeId(recipe.id);
    setForm(recipeToForm(recipe));
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('MainTabs');
  };

  const pickImageFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow gallery access to choose a recipe image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setForm((current) => ({ ...current, image: result.assets[0].uri }));
    }
  };

  const handleSaveRecipe = async () => {
    if (!form.title.trim()) {
      Alert.alert('Missing title', 'Please enter a recipe title before saving.');
      return;
    }

    const payload = formToPayload(form);

    try {
      if (editingRecipeId) {
        await updateRecipe(editingRecipeId, payload);
        Alert.alert('Recipe updated', 'The recipe was updated in JSON Server.');
      } else {
        await createRecipe(payload);
        Alert.alert('Recipe created', 'The recipe was added to JSON Server.');
      }

      startCreateMode();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Unable to save the recipe right now.';
      Alert.alert('Save failed', message);
    }
  };

  const handleDeleteRecipe = (recipeId: string) => {
    Alert.alert(
      'Delete recipe',
      'This will remove the recipe from JSON Server. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await deleteRecipe(recipeId);
                if (editingRecipeId === recipeId) {
                  startCreateMode();
                }
              } catch (cause) {
                const message = cause instanceof Error ? cause.message : 'Unable to delete the recipe.';
                Alert.alert('Delete failed', message);
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <TouchableOpacity style={styles.backBtn} onPress={handleGoBack} activeOpacity={0.8}>
              <Ionicons name="arrow-back" size={20} color={palette.textPrimary} />
            </TouchableOpacity>
            <View style={styles.headerTitleText}>
              <Text style={styles.title}>Manage Recipes</Text>
              <Text style={styles.subtitle}>Manage recipes and sync with JSON Server</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={() => void refreshRecipes()} activeOpacity={0.8}>
            <Ionicons name="sync-outline" size={18} color={palette.primary} />
            <Text style={styles.refreshText}>Sync</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <View>
              <Text style={styles.formTitle}>{editingRecipeId ? 'Edit Recipe' : 'Add Recipe'}</Text>
              <Text style={styles.formSubtitle}>
                {editingRecipeId && editingRecipe ? `Editing ${editingRecipe.title}` : 'Create a new recipe entry'}
              </Text>
            </View>
            <TouchableOpacity style={styles.secondaryBtn} onPress={startCreateMode} activeOpacity={0.8}>
              <Text style={styles.secondaryBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <Field
            label="Title"
            value={form.title}
            onChangeText={(text) => setForm((current) => ({ ...current, title: text }))}
            placeholder="Recipe title"
            styles={styles}
          />
          <Field
            label="Image URL"
            value={form.image}
            onChangeText={(text) => setForm((current) => ({ ...current, image: text }))}
            placeholder="https://..."
            styles={styles}
          />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Field
                label="Duration"
                value={form.duration}
                onChangeText={(text) => setForm((current) => ({ ...current, duration: text }))}
                placeholder="30 Min"
                styles={styles}
              />
            </View>
            <View style={styles.halfField}>
              <Field
                label="Cuisine"
                value={form.cuisine}
                onChangeText={(text) => setForm((current) => ({ ...current, cuisine: text }))}
                placeholder="american"
                styles={styles}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Field
                label="Category"
                value={form.category}
                onChangeText={(text) => setForm((current) => ({ ...current, category: text }))}
                placeholder="Main Course"
                styles={styles}
              />
            </View>
            <View style={styles.halfField}>
              <Field
                label="Tags"
                value={form.tags}
                onChangeText={(text) => setForm((current) => ({ ...current, tags: text }))}
                placeholder="Quick, Healthy"
                styles={styles}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Field
                label="Rating"
                value={form.rating}
                onChangeText={(text) => setForm((current) => ({ ...current, rating: text }))}
                placeholder="4.5"
                keyboardType="numeric"
                styles={styles}
              />
            </View>
            <View style={styles.halfField}>
              <Field
                label="Calories"
                value={form.calories}
                onChangeText={(text) => setForm((current) => ({ ...current, calories: text }))}
                placeholder="300"
                keyboardType="numeric"
                styles={styles}
              />
            </View>
          </View>
          <View style={styles.toggleStack}>
            <View style={styles.toggleField}>
              <View style={styles.toggleCard}>
                <View style={styles.toggleTextBlock}>
                  <Text style={styles.toggleLabel}>Featured</Text>
                  <Text style={styles.toggleSub}>Show on home screen</Text>
                </View>
                <Switch
                  value={form.isFeatured}
                  onValueChange={(value) => setForm((current) => ({ ...current, isFeatured: value }))}
                  trackColor={{ false: palette.border, true: palette.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={palette.border}
                />
              </View>
            </View>
            <View style={styles.toggleField}>
              <View style={styles.toggleCard}>
                <View style={styles.toggleTextBlock}>
                  <Text style={styles.toggleLabel}>Saved</Text>
                  <Text style={styles.toggleSub}>Appear in the saved list</Text>
                </View>
                <Switch
                  value={form.isSaved}
                  onValueChange={(value) => setForm((current) => ({ ...current, isSaved: value }))}
                  trackColor={{ false: palette.border, true: palette.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={palette.border}
                />
              </View>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Field
                label="Servings"
                value={form.servings}
                onChangeText={(text) => setForm((current) => ({ ...current, servings: text }))}
                placeholder="2"
                keyboardType="numeric"
                styles={styles}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <View style={styles.toggleCard}>
                <View>
                  <Text style={styles.toggleLabel}>Saved</Text>
                  <Text style={styles.toggleSub}>Appear in the saved list</Text>
                </View>
                <Switch
                  value={form.isSaved}
                  onValueChange={(value) => setForm((current) => ({ ...current, isSaved: value }))}
                  trackColor={{ false: palette.border, true: palette.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={palette.border}
                />
              </View>
            </View>
          </View>

          <Field
            label="Description"
            value={form.description}
            onChangeText={(text) => setForm((current) => ({ ...current, description: text }))}
            placeholder="Short description"
            multiline
            styles={styles}
          />
          <Field
            label="Ingredients"
            value={form.ingredients}
            onChangeText={(text) => setForm((current) => ({ ...current, ingredients: text }))}
            placeholder="Name|Amount|Unit"
            multiline
            styles={styles}
          />
          <Field
            label="Steps"
            value={form.steps}
            onChangeText={(text) => setForm((current) => ({ ...current, steps: text }))}
            placeholder="Instruction|Duration"
            multiline
            styles={styles}
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={() => void handleSaveRecipe()} activeOpacity={0.9}>
            <Text style={styles.primaryBtnText}>{editingRecipeId ? 'Update Recipe' : 'Create Recipe'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Current Recipes</Text>
          <Text style={styles.sectionCount}>{recipes.length} total</Text>
        </View>

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={palette.primary} />
            <Text style={styles.loadingText}>Loading recipes from JSON Server...</Text>
          </View>
        ) : null}

        <View style={styles.listWrap}>
          {recipes.map((recipe) => (
            <View key={recipe.id} style={styles.recipeCard}>
              <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
              <View style={styles.recipeContent}>
                <Text style={styles.recipeTitle} numberOfLines={1}>
                  {recipe.title}
                </Text>
                <Text style={styles.recipeMeta} numberOfLines={1}>
                  {recipe.category} · {recipe.duration} · {recipe.rating}★
                </Text>
                <Text style={styles.recipeDesc} numberOfLines={2}>
                  {recipe.description}
                </Text>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => startEditMode(recipe)} activeOpacity={0.82}>
                    <Ionicons name="create-outline" size={16} color={palette.primary} />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteRecipe(recipe.id)} activeOpacity={0.82}>
                    <Ionicons name="trash-outline" size={16} color={palette.error} />
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (palette: ReturnType<typeof useAppSettings>['palette']) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: palette.background,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: 120,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      marginTop: spacing.sm,
      marginBottom: spacing.md,
    },
    headerTitleRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    headerTitleText: {
      flex: 1,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.border,
    },
    title: {
      ...typography.displayMedium,
      color: palette.textPrimary,
    },
    subtitle: {
      ...typography.bodySmall,
      color: palette.textSecondary,
      marginTop: 4,
    },
    refreshBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: spacing.md,
      paddingVertical: 10,
      borderRadius: radius.full,
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.border,
    },
    refreshText: {
      ...typography.label,
      color: palette.primary,
    },
    apiCard: {
      flexDirection: 'row',
      gap: spacing.sm,
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    apiTitle: {
      ...typography.titleSmall,
      color: palette.textPrimary,
      marginBottom: 2,
    },
    apiText: {
      ...typography.bodySmall,
      color: palette.textSecondary,
    },
    errorBanner: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
      backgroundColor: 'rgba(255,69,58,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(255,69,58,0.35)',
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    errorText: {
      ...typography.bodySmall,
      color: palette.error,
      flex: 1,
    },
    offlineBanner: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
      backgroundColor: 'rgba(244,180,0,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(244,180,0,0.35)',
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    offlineText: {
      ...typography.bodySmall,
      color: palette.primary,
      flex: 1,
    },
    formCard: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: radius.xl,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },
    formHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    formTitle: {
      ...typography.titleLarge,
      color: palette.textPrimary,
    },
    formSubtitle: {
      ...typography.bodySmall,
      color: palette.textSecondary,
      marginTop: 2,
    },
    secondaryBtn: {
      paddingHorizontal: spacing.md,
      paddingVertical: 10,
      borderRadius: radius.full,
      backgroundColor: palette.elevated,
      borderWidth: 1,
      borderColor: palette.border,
    },
    secondaryBtnText: {
      ...typography.label,
      color: palette.textPrimary,
    },
    mediaActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    galleryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: spacing.md,
      paddingVertical: 12,
      borderRadius: radius.full,
      backgroundColor: palette.primaryMuted,
      borderWidth: 1,
      borderColor: palette.border,
    },
    galleryBtnText: {
      ...typography.bodySmall,
      color: palette.primary,
      fontWeight: '700',
    },
    previewCard: {
      borderRadius: radius.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.elevated,
      marginBottom: spacing.md,
      position: 'relative',
    },
    row: {
      flexDirection: 'row',
      gap: spacing.sm,
      flexWrap: 'wrap',
    },
    halfField: {
      flex: 1,
      minWidth: 150,
    },
    toggleStack: {
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    toggleField: {
      width: '100%',
    },
    fieldBlock: {
      marginBottom: spacing.md,
    },
    fieldLabel: {
      ...typography.label,
      color: palette.textSecondary,
      marginBottom: 8,
      textTransform: 'uppercase',
    },
    input: {
      minHeight: 48,
      borderRadius: radius.md,
      backgroundColor: palette.elevated,
      borderWidth: 1,
      borderColor: palette.border,
      color: palette.textPrimary,
      paddingHorizontal: spacing.md,
      paddingVertical: 12,
      ...typography.bodyMedium,
    },
    textArea: {
      minHeight: 92,
      paddingTop: 12,
      textAlignVertical: 'top',
    },
    toggleCard: {
      minHeight: 84,
      width: '100%',
      borderRadius: radius.md,
      backgroundColor: palette.elevated,
      borderWidth: 1,
      borderColor: palette.border,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      justifyContent: 'space-between',
      flexDirection: 'row',
      alignItems: 'center',
    },
    toggleTextBlock: {
      flex: 1,
      paddingRight: spacing.sm,
    },
    toggleLabel: {
      ...typography.titleSmall,
      color: palette.textPrimary,
      marginBottom: 2,
    },
    toggleSub: {
      ...typography.bodySmall,
      color: palette.textSecondary,
      maxWidth: 160,
    },
    previewImage: {
      width: '100%',
      aspectRatio: 16 / 9,
      resizeMode: 'cover',
    },
    previewBadge: {
      position: 'absolute',
      left: spacing.sm,
      bottom: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(13,13,13,0.78)',
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
    },
    previewBadgeText: {
      ...typography.label,
      color: palette.textPrimary,
    },
    primaryBtn: {
      marginTop: spacing.sm,
      height: 52,
      borderRadius: radius.full,
      backgroundColor: palette.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtnText: {
      ...typography.titleMedium,
      color: '#FFFFFF',
      fontWeight: '700',
    },
    listHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: spacing.sm,
    },
    sectionTitle: {
      ...typography.titleLarge,
      color: palette.textPrimary,
    },
    sectionCount: {
      ...typography.bodySmall,
      color: palette.textMuted,
    },
    loadingCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    loadingText: {
      ...typography.bodySmall,
      color: palette.textSecondary,
    },
    listWrap: {
      gap: spacing.sm,
    },
    recipeCard: {
      flexDirection: 'row',
      gap: spacing.md,
      backgroundColor: palette.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: palette.border,
      padding: spacing.sm,
      alignItems: 'center',
    },
    recipeImage: {
      width: 84,
      height: 84,
      borderRadius: radius.md,
      backgroundColor: palette.elevated,
    },
    recipeContent: {
      flex: 1,
      gap: 6,
    },
    recipeTitle: {
      ...typography.titleSmall,
      color: palette.textPrimary,
    },
    recipeMeta: {
      ...typography.bodySmall,
      color: palette.primary,
      fontWeight: '600',
    },
    recipeDesc: {
      ...typography.bodySmall,
      color: palette.textSecondary,
      lineHeight: 18,
    },
    actionRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: 4,
    },
    editBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: spacing.md,
      paddingVertical: 8,
      borderRadius: radius.full,
      backgroundColor: palette.primaryMuted,
    },
    editBtnText: {
      ...typography.label,
      color: palette.primary,
    },
    deleteBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: spacing.md,
      paddingVertical: 8,
      borderRadius: radius.full,
      backgroundColor: 'rgba(255,69,58,0.12)',
    },
    deleteBtnText: {
      ...typography.label,
      color: palette.error,
    },
  });

export default ManageRecipesScreen;
