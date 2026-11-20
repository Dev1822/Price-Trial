import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getApiBaseUrl, setApiBaseUrl, autoDiscoverBackend, LAN_HOST } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

export default function SettingsModal({ visible, onClose, onRefreshHealth, isOnline }) {
  const { theme, isDark, toggleTheme, spacing, radii, typography } = useTheme();
  const [url, setUrl] = useState(getApiBaseUrl());
  const [probing, setProbing] = useState(false);

  useEffect(() => {
    setUrl(getApiBaseUrl());
  }, [visible]);

  const handleSave = () => {
    if (!url.trim()) {
      Alert.alert('Invalid URL', 'Please enter a valid backend URL.');
      return;
    }
    const cleanUrl = url.trim().replace(/\/+$/, '');
    setApiBaseUrl(cleanUrl);
    if (onRefreshHealth) onRefreshHealth();
    onClose();
  };

  const handleAutoDiscover = async () => {
    setProbing(true);
    const discovered = await autoDiscoverBackend();
    setProbing(false);
    if (discovered) {
      setUrl(discovered);
      Alert.alert('Server Found', `Connected to ${discovered}`);
    } else {
      Alert.alert(
        'Server Not Found',
        'Could not reach backend server. Please verify Node.js server is running.'
      );
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modal,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: radii.lg
            }
          ]}
        >
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary, fontSize: typography.fontSizes.lg }]}>
              Settings & Connection
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityLabel="Close settings"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Scraper Server Status Indicator */}
          <View style={[styles.statusSection, { backgroundColor: theme.colors.surfaceSubtle, borderRadius: radii.md }]}>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isOnline ? theme.colors.success : theme.colors.danger }
                ]}
              />
              <Text style={[styles.statusTitle, { color: theme.colors.textPrimary, fontSize: typography.fontSizes.sm }]}>
                Backend Scraper Status: {isOnline ? 'Active' : 'Offline'}
              </Text>
            </View>
            <Text style={[styles.statusSub, { color: theme.colors.textMuted, fontSize: typography.fontSizes.xs }]}>
              {isOnline
                ? 'Ready to scrape live prices across Amazon, Flipkart and Snapdeal.'
                : 'Scraper unreachable. Ensure "node server/src/index.js" is running.'}
            </Text>
          </View>

          {/* Theme Option */}
          <View style={[styles.themeRow, { borderBottomColor: theme.colors.border }]}>
            <View>
              <Text style={[styles.label, { color: theme.colors.textPrimary, fontSize: typography.fontSizes.base }]}>
                Dark Appearance
              </Text>
              <Text style={[styles.hint, { color: theme.colors.textMuted, fontSize: typography.fontSizes.xs }]}>
                {isDark ? 'Dark theme enabled' : 'Light theme enabled (Default)'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
              thumbColor="#ffffff"
            />
          </View>

          {/* Backend URL Input */}
          <View style={styles.inputSection}>
            <Text style={[styles.label, { color: theme.colors.textPrimary, fontSize: typography.fontSizes.sm }]}>
              Scraper Endpoint URL
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceSubtle,
                  borderColor: theme.colors.border,
                  color: theme.colors.textPrimary,
                  borderRadius: radii.sm,
                  fontSize: typography.fontSizes.sm
                }
              ]}
              value={url}
              onChangeText={setUrl}
              placeholder="http://192.168.1.X:5000"
              placeholderTextColor={theme.colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Preset Buttons */}
          <View style={styles.presetsRow}>
            <TouchableOpacity
              style={[styles.presetChip, { borderColor: theme.colors.border, borderRadius: radii.xs }]}
              onPress={() => setUrl(LAN_HOST)}
            >
              <Text style={[styles.presetText, { color: theme.colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
                Wi-Fi IP
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.presetChip, { borderColor: theme.colors.border, borderRadius: radii.xs }]}
              onPress={() => setUrl('http://localhost:5000')}
            >
              <Text style={[styles.presetText, { color: theme.colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
                Localhost
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.presetChip, { borderColor: theme.colors.border, borderRadius: radii.xs }]}
              onPress={() => setUrl('http://10.0.2.2:5000')}
            >
              <Text style={[styles.presetText, { color: theme.colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
                Android Emu
              </Text>
            </TouchableOpacity>
          </View>

          {/* Auto Detect */}
          <TouchableOpacity
            style={[styles.autoBtn, { borderColor: theme.colors.border, borderRadius: radii.sm }]}
            onPress={handleAutoDiscover}
            disabled={probing}
          >
            {probing ? (
              <ActivityIndicator size="small" color={theme.colors.accent} />
            ) : (
              <>
                <Ionicons name="refresh-outline" size={16} color={theme.colors.accent} />
                <Text style={[styles.autoBtnText, { color: theme.colors.accent, fontSize: typography.fontSizes.sm }]}>
                  Auto-Detect Server
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Save Action */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: theme.colors.accent, borderRadius: radii.sm }]}
            onPress={handleSave}
          >
            <Text style={[styles.saveBtnText, { color: theme.colors.textInverse, fontSize: typography.fontSizes.base }]}>
              Save and Apply
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  modal: {
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden'
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  modalTitle: {
    fontWeight: '700'
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -8
  },
  statusSection: {
    padding: 12,
    marginVertical: 12
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  statusTitle: {
    fontWeight: '600'
  },
  statusSub: {
    lineHeight: 16
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  label: {
    fontWeight: '600',
    marginBottom: 2
  },
  hint: {
    fontWeight: '400'
  },
  inputSection: {
    marginTop: 12
  },
  input: {
    height: 44,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginTop: 6
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10
  },
  presetChip: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  presetText: {
    fontWeight: '500'
  },
  autoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderWidth: 1,
    marginTop: 12,
    gap: 6
  },
  autoBtnText: {
    fontWeight: '600'
  },
  saveBtn: {
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12
  },
  saveBtnText: {
    fontWeight: '600'
  }
});
