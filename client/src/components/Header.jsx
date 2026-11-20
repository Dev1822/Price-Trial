import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export default function Header({ onOpenSettings }) {
  const { theme, spacing, radii, typography } = useTheme();

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

      <TouchableOpacity
        onPress={onOpenSettings}
        style={[styles.settingsBtn, { borderRadius: radii.md }]}
        accessibilityLabel="Settings"
        accessibilityRole="button"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="settings-outline" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  settingsBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
