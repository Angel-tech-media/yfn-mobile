import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { palette, radius, spacing, typography } from '@/src/theme';
import { glass, plasma } from '@/src/theme/plasma';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  isPassword?: boolean;
  rightAdornment?: React.ReactNode;
};

export function TextField({
  label,
  error,
  containerStyle,
  isPassword,
  rightAdornment,
  secureTextEntry,
  style,
  ...rest
}: Props) {
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);
  const effectiveSecure = isPassword ? hidden : secureTextEntry;

  return (
    <View style={[styles.root, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          focused ? styles.fieldFocused : null,
          error ? styles.fieldError : null,
        ]}>
        <TextInput
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          secureTextEntry={effectiveSecure}
          placeholderTextColor="rgba(245, 246, 250, 0.52)"
          selectionColor={plasma.cyan}
          style={[styles.input, style]}
        />
        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            hitSlop={8}
            onPress={() => setHidden((v) => !v)}>
            <Ionicons
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="rgba(245, 246, 250, 0.78)"
            />
          </Pressable>
        ) : null}
        {rightAdornment}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  label: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    color: 'rgba(245, 246, 250, 0.85)',
    marginBottom: spacing['2'],
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: spacing['4'],
    borderRadius: 16,
    backgroundColor: 'rgba(22, 22, 27, 0.76)',
    borderWidth: 1,
    borderColor: glass.dark.rimStrong,
  },
  fieldFocused: {
    borderColor: plasma.nude,
    backgroundColor: 'rgba(32, 32, 39, 0.86)',
  },
  fieldError: {
    borderColor: palette.status.danger,
  },
  input: {
    flex: 1,
    fontFamily: typography.bodyLg.fontFamily,
    fontSize: typography.bodyLg.fontSize,
    lineHeight: typography.bodyLg.lineHeight,
    color: '#F5F6FA',
    paddingVertical: 0,
  },
  error: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    color: palette.status.danger,
    marginTop: spacing['1'],
  },
});
