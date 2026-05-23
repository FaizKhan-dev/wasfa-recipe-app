import React, { useMemo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing, typography } from '../theme';
import { useAppSettings } from '../context/AppSettingsContext';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress?: () => void;
  onMicPress?: () => void;
  onClearPress?: () => void;
  placeholder?: string;
  showFilter?: boolean;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onFilterPress,
  onMicPress,
  onClearPress,
  placeholder = 'Search For Recipes',
  showFilter = true,
  autoFocus = false,
}) => {
  const { palette } = useAppSettings();
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Ionicons name="search-outline" size={18} color={palette.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={palette.textMuted}
          value={value}
          onChangeText={onChangeText}
          autoFocus={autoFocus}
          returnKeyType="search"
          selectionColor={palette.primary}
        />
        {value.length > 0 ? (
          <TouchableOpacity onPress={onClearPress} style={styles.actionBtn} activeOpacity={0.7}>
            <Ionicons name="close-circle" size={18} color={palette.textMuted} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onMicPress} style={styles.actionBtn} activeOpacity={0.7}>
            <Ionicons name="mic-outline" size={18} color={palette.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {showFilter && (
        <TouchableOpacity style={styles.filterBtn} onPress={onFilterPress} activeOpacity={0.85}>
          <Ionicons name="options-outline" size={18} color={palette.textInverse} />
        </TouchableOpacity>
      )}
    </View>
  );
};

type Palette = {
  card: string;
  cardBorder: string;
  textMuted: string;
  textPrimary: string;
  primary: string;
  textInverse: string;
};

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    inputWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.card,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: palette.cardBorder,
      paddingHorizontal: spacing.md,
      height: 48,
    },
    searchIcon: {
      marginRight: spacing.sm,
    },
    input: {
      flex: 1,
      ...typography.bodyMedium,
      color: palette.textPrimary,
      height: '100%',
    },
    actionBtn: {
      padding: 4,
    },
    filterBtn: {
      width: 48,
      height: 48,
      borderRadius: radius.md,
      backgroundColor: palette.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
