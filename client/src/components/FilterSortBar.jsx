import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export const SORT_OPTIONS = [
  { key: 'PRICE_ASC', label: 'Price: Low to High' },
  { key: 'PRICE_DESC', label: 'Price: High to Low' },
  { key: 'DISCOUNT_DESC', label: 'Discount %' },
  { key: 'RATING_DESC', label: 'Highest Rating' }
];

export const PLATFORM_OPTIONS = [
  { key: 'ALL', label: 'All Stores' },
  { key: 'AMAZON', label: 'Amazon' },
  { key: 'FLIPKART', label: 'Flipkart' },
  { key: 'SNAPDEAL', label: 'Snapdeal' }
];

export default function FilterSortBar({
  selectedPlatform,
  onSelectPlatform,
  sortBy,
  onSelectSort,
  totalResults
}) {
  const { theme, radii, typography } = useTheme();
  const [platformModalVisible, setPlatformModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const currentPlatform = PLATFORM_OPTIONS.find(p => p.key === selectedPlatform) || PLATFORM_OPTIONS[0];
  const currentSort = SORT_OPTIONS.find(o => o.key === sortBy) || SORT_OPTIONS[0];

  const getPlatformDotColor = (key) => {
    switch (key?.toLowerCase()) {
      case 'amazon':
        return theme.colors.platforms.amazon;
      case 'flipkart':
        return theme.colors.platforms.flipkart;
      case 'snapdeal':
        return theme.colors.platforms.snapdeal;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
      {/* 1. Store Filter Dropdown Trigger */}
      <TouchableOpacity
        style={[
          styles.dropdownTrigger,
          {
            borderColor: theme.colors.border,
            borderRadius: radii.md,
            backgroundColor: theme.colors.surfaceSubtle
          }
        ]}
        onPress={() => setPlatformModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={`Filter by store: ${currentPlatform.label}`}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      >
        <View style={styles.triggerContent}>
          {getPlatformDotColor(currentPlatform.key) ? (
            <View style={[styles.brandDot, { backgroundColor: getPlatformDotColor(currentPlatform.key) }]} />
          ) : (
            <Ionicons name="storefront-outline" size={15} color={theme.colors.textSecondary} />
          )}
          <Text
            style={[styles.triggerText, { color: theme.colors.textPrimary, fontSize: typography.fontSizes.sm }]}
            numberOfLines={1}
          >
            {currentPlatform.key === 'ALL' ? 'All Stores' : currentPlatform.label}
          </Text>
        </View>
        <Ionicons name="chevron-down-outline" size={14} color={theme.colors.textMuted} />
      </TouchableOpacity>

      {/* 2. Sort Dropdown Trigger */}
      <TouchableOpacity
        style={[
          styles.dropdownTrigger,
          {
            borderColor: theme.colors.border,
            borderRadius: radii.md,
            backgroundColor: theme.colors.surfaceSubtle
          }
        ]}
        onPress={() => setSortModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={`Sort by: ${currentSort.label}`}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      >
        <View style={styles.triggerContent}>
          <Ionicons name="swap-vertical-outline" size={15} color={theme.colors.textSecondary} />
          <Text
            style={[styles.triggerText, { color: theme.colors.textPrimary, fontSize: typography.fontSizes.sm }]}
            numberOfLines={1}
          >
            {currentSort.label}
          </Text>
        </View>
        <Ionicons name="chevron-down-outline" size={14} color={theme.colors.textMuted} />
      </TouchableOpacity>

      {/* Store Picker Modal */}
      <Modal
        visible={platformModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPlatformModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPlatformModalVisible(false)}
        >
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: radii.lg
              }
            ]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary, fontSize: typography.fontSizes.base }]}>
                Filter by Store
              </Text>
              <TouchableOpacity
                onPress={() => setPlatformModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            {PLATFORM_OPTIONS.map((opt) => {
              const isSelected = selectedPlatform === opt.key;
              const dotColor = getPlatformDotColor(opt.key);
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.optionRow,
                    { borderBottomColor: theme.colors.border },
                    isSelected && { backgroundColor: theme.colors.surfaceSubtle }
                  ]}
                  onPress={() => {
                    onSelectPlatform(opt.key);
                    setPlatformModalVisible(false);
                  }}
                >
                  <View style={styles.optionLeft}>
                    {dotColor ? (
                      <View style={[styles.brandDot, { backgroundColor: dotColor }]} />
                    ) : (
                      <Ionicons name="storefront-outline" size={15} color={theme.colors.textSecondary} />
                    )}
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: isSelected ? theme.colors.accent : theme.colors.textPrimary,
                          fontWeight: isSelected ? '600' : '400',
                          fontSize: typography.fontSizes.base
                        }
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-outline" size={18} color={theme.colors.accent} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sort Picker Modal */}
      <Modal
        visible={sortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSortModalVisible(false)}
        >
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: radii.lg
              }
            ]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary, fontSize: typography.fontSizes.base }]}>
                Sort Offers
              </Text>
              <TouchableOpacity
                onPress={() => setSortModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            {SORT_OPTIONS.map((opt) => {
              const isSelected = sortBy === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.optionRow,
                    { borderBottomColor: theme.colors.border },
                    isSelected && { backgroundColor: theme.colors.surfaceSubtle }
                  ]}
                  onPress={() => {
                    onSelectSort(opt.key);
                    setSortModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: isSelected ? theme.colors.accent : theme.colors.textPrimary,
                        fontWeight: isSelected ? '600' : '400',
                        fontSize: typography.fontSizes.base
                      }
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-outline" size={18} color={theme.colors.accent} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  dropdownTrigger: {
    flex: 1,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderWidth: 1
  },
  triggerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 6
  },
  brandDot: {
    width: 7,
    height: 7,
    borderRadius: 4
  },
  triggerText: {
    fontWeight: '500',
    letterSpacing: -0.2
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  modalSheet: {
    borderWidth: 1,
    overflow: 'hidden'
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  modalTitle: {
    fontWeight: '600'
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  optionText: {
    letterSpacing: -0.2
  }
});
