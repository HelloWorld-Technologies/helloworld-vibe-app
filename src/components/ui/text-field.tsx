import { useRef, useState, type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, fontStyleForWeight } from '@/constants/fonts';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

type TextFieldProps = TextInputProps & {
  label: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
};

function FieldErrorIcon() {
  return (
    <View style={styles.errorIcon}>
      <ThemedText style={styles.errorIconMark}>!</ThemedText>
    </View>
  );
}

export function TextField({
  label,
  hint,
  error,
  leftIcon,
  containerStyle,
  labelStyle,
  style,
  editable = true,
  onFocus,
  onBlur,
  ...props
}: TextFieldProps) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);
  const isDisabled = editable === false;

  function focusInput() {
    if (!isDisabled) {
      inputRef.current?.focus();
    }
  }

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <ThemedText style={[styles.label, labelStyle]}>{label}</ThemedText>
      <Pressable
        onPress={focusInput}
        style={[
          styles.inputShell,
          focused && !hasError && styles.inputFocused,
          hasError && styles.inputError,
          focused && hasError && styles.inputErrorFocused,
          isDisabled && styles.inputDisabled,
        ]}>
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
        <TextInput
          ref={inputRef}
          editable={editable}
          placeholderTextColor={palette.textPlaceholder}
          style={[styles.input, isDisabled && styles.inputTextDisabled, style]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {hasError ? <FieldErrorIcon /> : null}
      </Pressable>
      {hasError ? (
        <ThemedText style={styles.error}>{error}</ThemedText>
      ) : hint ? (
        <ThemedText style={styles.hint}>{hint}</ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    ...fontStyleForWeight('medium'),
    color: palette.textLabel,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
    borderWidth: 1,
    borderColor: palette.borderDefault,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    backgroundColor: palette.white,
  },
  inputFocused: {
    borderColor: palette.lime[400],
    shadowColor: palette.focusRing,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: palette.red[300],
  },
  inputErrorFocused: {
    borderColor: palette.red[300],
    shadowColor: palette.red[100],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputDisabled: {
    backgroundColor: palette.surfaceDisabled,
    borderColor: palette.borderDefault,
  },
  leftIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    letterSpacing: 0,
    // Satoshi Variable + iOS name autofill stretches placeholders — use static face.
    fontFamily: Platform.OS === 'ios' ? Fonts.regular : undefined,
    ...(Platform.OS === 'ios'
      ? { fontWeight: '400' as const }
      : fontStyleForWeight('regular')),
    color: palette.textPrimary,
    padding: 0,
    margin: 0,
    ...Platform.select({
      ios: {
        paddingVertical: 14,
      },
      android: {
        paddingVertical: 12,
        textAlignVertical: 'center',
        includeFontPadding: false,
      },
      default: {
        paddingVertical: 14,
      },
    }),
  },
  inputTextDisabled: {
    color: palette.textSecondary,
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
    color: palette.textSecondary,
  },
  error: {
    fontSize: 12,
    lineHeight: 18,
    color: palette.borderError,
  },
  errorIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: palette.borderError,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIconMark: {
    fontSize: 11,
    lineHeight: 12,
    ...fontStyleForWeight('bold'),
    color: palette.white,
  },
});
