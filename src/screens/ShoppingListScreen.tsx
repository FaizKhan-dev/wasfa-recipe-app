import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { spacing, radius, typography } from '../theme';
import { useShoppingList } from '../context/SavedRecipesContext';
import { useAppSettings } from '../context/AppSettingsContext';

type ShoppingItem = {
  id: string;
  name: string;
  checked: boolean;
  category?: string;
};

const ShoppingListScreen: React.FC = () => {
  const {
    items,
    checkedCount,
    addItem,
    toggleItem,
    deleteItem,
    clearChecked,
  } = useShoppingList();
  const { palette, t } = useAppSettings();
  const styles = React.useMemo(() => createStyles(palette), [palette]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [showChecked, setShowChecked] = useState(true);

  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    addItem(newItemName);
    setNewItemName('');
    setAddModalVisible(false);
    Keyboard.dismiss();
  };

  const progress = items.length === 0 ? 0 : checkedCount / items.length;

  const renderItem = ({ item }: { item: ShoppingItem }) => (
    <TouchableOpacity
      style={styles.itemRow}
      onPress={() => toggleItem(item.id)}
      activeOpacity={0.85}
    >
      <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
        {item.checked && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
      </View>
      <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>
        {item.name}
      </Text>
      <TouchableOpacity
        onPress={() => deleteItem(item.id)}
        style={styles.deleteBtn}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={16} color={palette.textMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.list}</Text>
        {checked.length > 0 && (
          <TouchableOpacity onPress={clearChecked} style={styles.clearBtn} activeOpacity={0.8}>
            <Ionicons name="checkmark-done-outline" size={16} color={palette.primary} />
            <Text style={styles.clearBtnText}>{t.clearDone}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Progress bar */}
      {items.length > 0 && (
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>
            {checked.length}/{items.length} {t.itemsCount}
          </Text>
        </View>
      )}

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="cart-outline" size={36} color={palette.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>{t.yourListIsEmpty}</Text>
          <Text style={styles.emptySub}>{t.addIngredientsOrManual}</Text>
        </View>
      ) : (
        <FlatList
          data={[
            ...unchecked,
            ...(showChecked && checked.length > 0 ? checked : []),
          ]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          ListFooterComponent={
            checked.length > 0 ? (
              <TouchableOpacity
                onPress={() => setShowChecked((v) => !v)}
                style={styles.toggleChecked}
                activeOpacity={0.7}
              >
                <Text style={styles.toggleCheckedText}>
                    {showChecked ? `${t.hideCompleted} (${checked.length})` : `${t.showCompleted} (${checked.length})`}
                </Text>
                <Ionicons
                  name={showChecked ? 'chevron-up' : 'chevron-down'}
                  size={14}
                    color={palette.textMuted}
                />
              </TouchableOpacity>
            ) : null
          }
        />
      )}

      {/* Add Button */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setAddModalVisible(true)}
          activeOpacity={0.88}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
          <Text style={styles.addBtnText}>{t.addItem}</Text>
        </TouchableOpacity>
      </View>

      {/* Add Item Modal */}
      <Modal visible={addModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => { setAddModalVisible(false); Keyboard.dismiss(); }}
          />
          <View style={styles.addModal}>
            <Text style={styles.addModalTitle}>{t.addItem}</Text>
            <TextInput
              style={styles.addInput}
              placeholder={t.itemPlaceholder}
              placeholderTextColor={palette.textMuted}
              value={newItemName}
              onChangeText={setNewItemName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleAddItem}
              selectionColor={palette.primary}
            />
            <View style={styles.addModalBtns}>
              <TouchableOpacity
                style={styles.addModalCancel}
                onPress={() => { setAddModalVisible(false); setNewItemName(''); }}
                activeOpacity={0.8}
              >
                <Text style={styles.addModalCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addModalConfirm} onPress={handleAddItem} activeOpacity={0.88}>
                <Text style={styles.addModalConfirmText}>{t.add}</Text>
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
  textInverse: string;
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
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: palette.primaryMuted,
    borderRadius: radius.full,
  },
  clearBtnText: { ...typography.label, color: palette.primary },

  // Progress
  progressSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: 6,
  },
  progressBar: {
    height: 4,
    backgroundColor: palette.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: palette.primary,
    borderRadius: radius.full,
  },
  progressLabel: { ...typography.label, color: palette.textMuted },

  // List
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 120,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    gap: spacing.md,
  },
  checkbox: {
    width: 22, height: 22,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: palette.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  itemName: {
    flex: 1,
    ...typography.bodyMedium,
    color: palette.textPrimary,
    fontWeight: '500',
  },
  itemNameChecked: {
    color: palette.textMuted,
    textDecorationLine: 'line-through',
  },
  deleteBtn: { padding: 4 },
  toggleChecked: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.md,
  },
  toggleCheckedText: { ...typography.bodySmall, color: palette.textMuted },

  // Empty
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    width: 72, height: 72,
    backgroundColor: palette.surface,
    borderRadius: radius.xl,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1, borderColor: palette.border,
  },
  emptyTitle: { ...typography.titleLarge, color: palette.textPrimary, marginBottom: spacing.sm },
  emptySub: {
    ...typography.bodyMedium,
    color: palette.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Bottom
  bottomActions: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: spacing.md,
    paddingBottom: 32,
    backgroundColor: palette.background,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  addBtn: {
    height: 56,
    backgroundColor: palette.primary,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  addBtnText: { ...typography.titleMedium, color: '#FFFFFF', fontWeight: '700' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  addModal: {
    backgroundColor: palette.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: palette.border,
  },
  addModalTitle: {
    ...typography.titleLarge,
    color: palette.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  addInput: {
    height: 50,
    backgroundColor: palette.elevated,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    ...typography.bodyMedium,
    color: palette.textPrimary,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: spacing.md,
  },
  addModalBtns: { flexDirection: 'row', gap: spacing.sm },
  addModalCancel: {
    flex: 1,
    height: 50,
    backgroundColor: palette.surface,
    borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: palette.border,
  },
  addModalCancelText: { ...typography.bodyMedium, color: palette.textSecondary, fontWeight: '500' },
  addModalConfirm: {
    flex: 1,
    height: 50,
    backgroundColor: palette.primary,
    borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  addModalConfirmText: { ...typography.bodyMedium, color: '#FFFFFF', fontWeight: '700' },
});

export default ShoppingListScreen;
