import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function TrendingChips({ trendingItems, onSelect, visible = true }) {
  const { theme, spacing, radii, typography } = useTheme();

  if (!visible || !trendingItems || trendingItems.length === 0) return null;

  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.border }]}>
      <Text style={[styles.label, { color: theme.colors.textMuted, fontSize: typography.fontSizes.xs }]}>
        Popular
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {trendingItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.chip,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: radii.sm
              }
            ]}
            onPress={() => onSelect(item.query)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Text style={[styles.chipText, { color: theme.colors.textSecondary, fontSize: typography.fontSizes.sm }]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  label: {
    paddingHorizontal: 16,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center'
  },
  chipText: {
    fontWeight: '500'
  }
});
