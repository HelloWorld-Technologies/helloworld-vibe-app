import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { fontStyleForWeight } from '@/constants/fonts';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

const OTP_LENGTH = 6;

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
};

export function OtpInput({ value, onChange, autoFocus = false }: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!autoFocus) return;

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 350);

    return () => clearTimeout(timer);
  }, [autoFocus]);

  function handleChange(text: string) {
    onChange(text.replace(/\D/g, '').slice(0, OTP_LENGTH));
  }

  return (
    <Pressable
      style={[styles.box, focused && styles.boxFocused]}
      onPress={() => inputRef.current?.focus()}
      accessibilityRole="none"
      accessibilityLabel="One-time password input">
      <View style={styles.slots} pointerEvents="none">
        {Array.from({ length: OTP_LENGTH }, (_, index) => {
          const digit = value[index];
          const isEmpty = !digit;

          return (
            <Text
              key={index}
              style={[styles.digit, isEmpty && styles.digitPlaceholder]}>
              {digit ?? '0'}
            </Text>
          );
        })}
      </View>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        autoFocus={autoFocus}
        maxLength={OTP_LENGTH}
        caretHidden
        selectionColor="transparent"
        style={styles.hiddenInput}
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
    minHeight: 56,
    borderWidth: 1,
    borderColor: palette.borderDefault,
    borderRadius: Radius.md,
    backgroundColor: palette.white,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'relative',
  },
  boxFocused: {
    borderColor: palette.lime[400],
    shadowColor: palette.focusRing,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  slots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  digit: {
    flex: 1,
    textAlign: 'center',
    fontSize: 28,
    lineHeight: 36,
    ...fontStyleForWeight('medium'),
    color: palette.textPrimary,
  },
  digitPlaceholder: {
    color: palette.gray[400],
  },
  hiddenInput: {
    ...StyleSheet.absoluteFill,
    opacity: 0.02,
    fontSize: 16,
    color: 'transparent',
  },
});
