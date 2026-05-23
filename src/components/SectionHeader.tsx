import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { typography } from '../theme';
import { useAppSettings } from '../context/AppSettingsContext';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
  showSeeAll?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  onSeeAll,
  showSeeAll = true,
}) => {
  const { palette } = useAppSettings();
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {showSeeAll && (
        <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

type Palette = {
  textPrimary: string;
  primary: string;
};

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      ...typography.titleMedium,
      color: palette.textPrimary,
    },
    seeAll: {
      ...typography.bodySmall,
      color: palette.primary,
      fontWeight: '600',
    },
  });
