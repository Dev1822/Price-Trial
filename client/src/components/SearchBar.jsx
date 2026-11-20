import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export default function SearchBar({ value, onChangeText, onSubmit, onClear, isLoading }) {
  const { theme, spacing, radii, typography } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.colors.surfaceSubtle,
            borderColor: theme.colors.border,
            borderRadius: radii.md
          }
        ]}
      >
        <Ionicons
          name="search-outline"
          size={20}
          color={theme.colors.textMuted}
          style={styles.searchIcon}
        />

        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.textPrimary,
              fontSize: typography.fontSizes.base
            }
          ]}
          placeholder="Search products, brands or models..."
          placeholderTextColor={theme.colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          editable={!isLoading}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="never"
        />

        {isLoading ? (
          <ActivityIndicator size="small" color={theme.colors.accent} style={styles.actionIcon} />
        ) : value.length > 0 ? (
          <TouchableOpacity
            onPress={onClear}
            style={styles.actionButton}
            accessibilityLabel="Clear search text"
            accessibilityRole="button"
          >
            <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 12,
    borderWidth: 1
  },
  searchIcon: {
    marginRight: 8
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0
  },
  actionIcon: {
    marginLeft: 8
  },
  actionButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -10
  }
});
