import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { palette, radius, spacing, typography } from '@/src/theme';

type Props = {
  value: string;
  onChangeText: (v: string) => void;
  countryCode?: string;
  flag?: string;
  onPressFlag?: () => void;
  placeholder?: string;
};

export function CountryPhoneField({
  value,
  onChangeText,
  countryCode = '+234',
  flag = '🇳🇬',
  onPressFlag,
  placeholder = 'Phone number',
}: Props) {
  return (
    <View style={styles.field}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Change country"
        hitSlop={8}
        onPress={onPressFlag}
        style={({ pressed }) => [styles.flagPill, pressed && styles.pressed]}>
        <Text style={styles.flag}>{flag}</Text>
        <Text style={styles.code}>{countryCode}</Text>
        <Ionicons name="chevron-down" size={14} color={palette.ink.onDarkSoft} />
      </Pressable>
      <TextInput
        value={value}
        onChangeText={(t) => onChangeText(t.replace(/[^0-9]/g, ''))}
        placeholder={placeholder}
        placeholderTextColor={palette.ink.onDarkMuted}
        keyboardType="phone-pad"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: spacing['2'],
    paddingRight: spacing['4'],
    borderRadius: 16,
    backgroundColor: 'rgba(22, 22, 27, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(245, 242, 236, 0.19)',
    gap: spacing['3'],
  },
  flagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing['2'],
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  pressed: { opacity: 0.7 },
  flag: {
    fontSize: 18,
  },
  code: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    color: palette.ink.onDarkStrong,
  },
  input: {
    flex: 1,
    fontFamily: typography.bodyLg.fontFamily,
    fontSize: typography.bodyLg.fontSize,
    lineHeight: typography.bodyLg.lineHeight,
    color: palette.ink.onDarkStrong,
    paddingVertical: 0,
  },
});
