import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing, typography } from '../theme';
import { Recipe } from '../data/mockData';
import { useSavedRecipes } from '../context/SavedRecipesContext';
import { useAppSettings } from '../context/AppSettingsContext';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  variant?: 'grid' | 'list' | 'featured';
  style?: object;
}

type Palette = {
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
};

const { width } = Dimensions.get('window');
const GRID_CARD_WIDTH = (width - spacing.md * 2 - spacing.sm) / 2;

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    gridCard: {
      backgroundColor: palette.surface,
      borderRadius: radius.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: palette.border,
    },
    gridImageWrapper: {
      position: 'relative',
      height: 130,
    },
    gridImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    gridOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.40)',
    },
    gridBookmark: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      backgroundColor: 'rgba(0,0,0,0.4)',
      borderRadius: radius.full,
      padding: 6,
    },
    gridContent: {
      padding: spacing.sm + 2,
    },
    gridTitle: {
      ...typography.titleSmall,
      color: palette.textPrimary,
      marginBottom: 4,
    },
    gridMeta: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    listCard: {
      backgroundColor: palette.surface,
      borderRadius: radius.lg,
      flexDirection: 'row',
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: palette.border,
      alignItems: 'center',
    },
    listImage: {
      width: 80,
      height: 80,
      borderRadius: radius.md,
      resizeMode: 'cover',
    },
    listContent: {
      flex: 1,
      paddingHorizontal: spacing.sm + 2,
    },
    listTitle: {
      ...typography.titleSmall,
      color: palette.textPrimary,
      marginBottom: 6,
    },
    listMeta: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: 6,
    },
    listBookmark: {
      padding: 6,
    },
    tagRow: {
      flexDirection: 'row',
      gap: 4,
    },
    tag: {
      backgroundColor: 'rgba(245,166,35,0.08)',
      borderRadius: radius.full,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    tagText: {
      ...typography.label,
      color: palette.primary,
    },
    featuredCard: {
      width: 200,
      height: 250,
      borderRadius: radius.xl,
      overflow: 'hidden',
      position: 'relative',
    },
    featuredImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    featuredOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.25)',
    },
    bookmarkBtn: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      backgroundColor: 'rgba(0,0,0,0.45)',
      borderRadius: radius.full,
      padding: 7,
    },
    featuredBottom: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: spacing.md,
      paddingBottom: spacing.md,
      backgroundColor: 'rgba(0,0,0,0)',
    },
    featuredTitle: {
      ...typography.titleMedium,
      color: palette.textPrimary,
      marginBottom: 4,
      textShadowColor: 'rgba(0,0,0,0.8)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    featuredMeta: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    metaText: {
      ...typography.bodySmall,
      color: palette.textSecondary,
    },
  });

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onPress,
  variant = 'grid',
  style,
}) => {
  const { isRecipeSaved, toggleRecipeSaved } = useSavedRecipes();
  const { palette } = useAppSettings();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const saved = isRecipeSaved(recipe.id);

  const handleSave = (e: any) => {
    e.stopPropagation();
    toggleRecipeSaved(recipe.id);
  };

  if (variant === 'featured') {
    return (
      <TouchableOpacity style={[styles.featuredCard, style]} onPress={onPress} activeOpacity={0.92}>
        <Image source={{ uri: recipe.image }} style={styles.featuredImage} />
        <View style={styles.featuredOverlay} />
        <TouchableOpacity style={styles.bookmarkBtn} onPress={handleSave} activeOpacity={0.8}>
          <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={18} color={saved ? palette.primary : palette.textPrimary} />
        </TouchableOpacity>
        <View style={styles.featuredBottom}>
          <Text style={styles.featuredTitle} numberOfLines={1}>{recipe.title}</Text>
          <View style={styles.featuredMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={11} color={palette.textSecondary} />
              <Text style={styles.metaText}>{recipe.duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={11} color={palette.primary} />
              <Text style={styles.metaText}>{recipe.rating}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'list') {
    return (
      <TouchableOpacity style={[styles.listCard, style]} onPress={onPress} activeOpacity={0.92}>
        <Image source={{ uri: recipe.image }} style={styles.listImage} />
        <View style={styles.listContent}>
          <Text style={styles.listTitle} numberOfLines={2}>{recipe.title}</Text>
          <View style={styles.listMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={12} color={palette.textSecondary} />
              <Text style={styles.metaText}>{recipe.duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={12} color={palette.primary} />
              <Text style={styles.metaText}>{recipe.rating}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="flame-outline" size={12} color={palette.textSecondary} />
              <Text style={styles.metaText}>{recipe.calories} cal</Text>
            </View>
          </View>
          {recipe.tags.length > 0 && (
            <View style={styles.tagRow}>
              {recipe.tags.slice(0, 2).map((tag) => (
                <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
              ))}
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.listBookmark} onPress={handleSave} activeOpacity={0.8}>
          <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={18} color={saved ? palette.primary : palette.textMuted} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[styles.gridCard, { width: GRID_CARD_WIDTH }, style]} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.gridImageWrapper}>
        <Image source={{ uri: recipe.image }} style={styles.gridImage} />
        <View style={styles.gridOverlay} />
        <TouchableOpacity style={styles.gridBookmark} onPress={handleSave} activeOpacity={0.8}>
          <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={16} color={saved ? palette.primary : palette.textPrimary} />
        </TouchableOpacity>
      </View>
      <View style={styles.gridContent}>
        <Text style={styles.gridTitle} numberOfLines={1}>{recipe.title}</Text>
        <View style={styles.gridMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={11} color={palette.textSecondary} />
            <Text style={styles.metaText}>{recipe.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="star" size={11} color={palette.primary} />
            <Text style={styles.metaText}>{recipe.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
