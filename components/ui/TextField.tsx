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

import { spacing } from '@/src/theme';
import { useUi } from '@/src/theme/ui';

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
  const ui = useUi();
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);
  const effectiveSecure = isPassword ? hidden : secureTextEntry;

  return (
    <View style={[styles.root, containerStyle]}>
      {label ? <Text style={[styles.label, { color: ui.secondaryLabel }]}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          {
            backgroundColor: ui.card,
            borderColor: error ? ui.danger : focused ? ui.accent : ui.separator,
          },
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
          placeholderTextColor={ui.secondaryLabel}
          selectionColor={ui.accent}
          style={[styles.input, { color: ui.label }, style]}
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
              color={ui.secondaryLabel}
            />
          </Pressable>
        ) : null}
        {rightAdornment}
      </View>
      {error ? <Text style={[styles.error, { color: ui.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  label: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: spacing['2'],
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: spacing['4'],
    borderRadius: 16,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontFamily: 'InstrumentSans_500Medium',
    fontSize: 15,
    lineHeight: 20,
    paddingVertical: 0,
  },
  error: {
    fontFamily: 'InstrumentSans_500Medium',
    fontSize: 12,
    lineHeight: 16,
    marginTop: spacing['1'],
  },
});
