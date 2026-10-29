import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, radius, spacing, typography } from '@/src/theme';

export type RepostType = 'post' | 'product';

interface RepostTypeDropdownProps {
  value: RepostType;
  onChange: (value: RepostType) => void;
}

export function RepostTypeDropdown({ value, onChange }: RepostTypeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setIsOpen(!isOpen)}
        style={styles.dropdownToggle}>
        <Text style={styles.dropdownToggleText}>
          {value === 'product' ? 'Product Reposts' : 'Reposted Posts'}
        </Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={palette.ink.onDarkStrong}
        />
      </Pressable>

      {isOpen && (
        <View style={styles.dropdownMenu}>
          <Pressable
            onPress={() => {
              onChange('post');
              setIsOpen(false);
            }}
            style={styles.dropdownItem}>
            <Text style={[styles.dropdownItemText, value === 'post' && styles.dropdownItemTextActive]}>
              Reposted Posts
            </Text>
            {value === 'post' && (
              <Ionicons name="checkmark" size={18} color={palette.brand.orange} />
            )}
          </Pressable>
          <View style={styles.dropdownDivider} />
          <Pressable
            onPress={() => {
              onChange('product');
              setIsOpen(false);
            }}
            style={styles.dropdownItem}>
            <Text style={[styles.dropdownItemText, value === 'product' && styles.dropdownItemTextActive]}>
              Product Reposts
            </Text>
            {value === 'product' && (
              <Ionicons name="checkmark" size={18} color={palette.brand.orange} />
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 10,
  },
  dropdownToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['5'],
    paddingBottom: spacing['4'],
  },
  dropdownToggleText: {
    ...typography.h2,
    color: palette.ink.onDarkStrong,
    marginRight: spacing['2'],
  },
  dropdownMenu: {
    position: 'absolute',
    top: 36,
    left: spacing['5'],
    width: 220,
    backgroundColor: palette.bg.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 20,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing['4'],
  },
  dropdownItemText: {
    ...typography.bodyEmphasis,
    color: palette.ink.onDarkStrong,
  },
  dropdownItemTextActive: {
    color: palette.brand.orange,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: palette.line.divider,
  },
});
