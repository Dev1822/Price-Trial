import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function Header() {
  const { theme, typography } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
      <View style={styles.left}>
        <Text style={[styles.brandName, { color: theme.colors.textPrimary, fontSize: typography.fontSizes.xl }]}>
          Price<Text style={{ color: theme.colors.accent }}>Trail</Text>
        </Text>
        <Text style={[styles.tagline, { color: theme.colors.textMuted, fontSize: typography.fontSizes.xs }]}>
          Compare Amazon · Flipkart · Snapdeal
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  left: {
    justifyContent: 'center'
  },
  brandName: {
    fontWeight: '700',
    letterSpacing: -0.3
  },
  tagline: {
    marginTop: 2,
    fontWeight: '400'
  }
});
