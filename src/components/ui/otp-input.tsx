import { useEffect, useRef, useState } from 'react';
import {
  InteractionManager,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';

import { fontStyleForWeight } from '@/constants/fonts';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

const OTP_LENGTH = 6;

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
};

/**
 * Single real TextInput — same pattern as the login phone field.
 */
export function OtpInput({ value, onChange, autoFocus = false }: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!autoFocus) return;

    const task = InteractionManager.runAfterInteractions(() => {
      inputRef.current?.focus();
    });
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 600);

    return () => {
      task.cancel();
      clearTimeout(timer);
    };
  }, [autoFocus]);

  function focusInput() {
    inputRef.current?.focus();
  }

  return (
    <Pressable
      onPress={focusInput}
      style={[styles.box, focused && styles.boxFocused]}
      accessibilityRole="none"
      accessibilityLabel="One-time password">
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, OTP_LENGTH))}
        onPressIn={focusInput}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        autoFocus={autoFocus}
        maxLength={OTP_LENGTH}
        autoCorrect={false}
        spellCheck={false}
        blurOnSubmit={false}
        underlineColorAndroid="transparent"
        showSoftInputOnFocus
        placeholder="000000"
        placeholderTextColor={palette.gray[400]}
        selectionColor={palette.lime[300]}
        style={styles.input}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: palette.borderDefault,
    borderRadius: Radius.md,
    backgroundColor: palette.white,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  boxFocused: {
    borderColor: palette.lime[400],
    shadowColor: palette.focusRing,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    width: '100%',
    height: 48,
    padding: 0,
    margin: 0,
    textAlign: 'center',
    fontSize: 20,
    letterSpacing: 12,
    color: palette.textPrimary,
    ...fontStyleForWeight('medium'),
    ...(Platform.OS === 'android'
      ? { includeFontPadding: false, textAlignVertical: 'center' as const }
      : null),
  },
});
