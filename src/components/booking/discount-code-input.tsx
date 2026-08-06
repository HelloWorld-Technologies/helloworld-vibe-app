import { HwSymbol } from '@/components/ui/hw-symbol';
import { useRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

type DiscountCodeInputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onApply: () => void;
  loading?: boolean;
  error?: string;
  successMessage?: string;
  appliedCode?: string;
  onClear?: () => void;
  editable?: boolean;
};

export function DiscountCodeInput({
  label,
  placeholder,
  value,
  onChange,
  onApply,
  loading = false,
  error,
  successMessage,
  appliedCode,
  onClear,
  editable = true,
}: DiscountCodeInputProps) {
  const inputRef = useRef<TextInput>(null);
  const isApplied = Boolean(appliedCode);

  return (
    <View style={styles.wrap}>
      <Typography variant="text" size="sm" weight="medium" color={palette.textLabel}>
        {label}
      </Typography>

      <Pressable
        onPress={() => {
          if (editable && !isApplied && !loading) {
            inputRef.current?.focus();
          }
        }}
        style={[
          styles.inputRow,
          isApplied && styles.inputRowApplied,
          Boolean(error) && styles.inputRowError,
        ]}>
        <TextInput
          ref={inputRef}
          value={isApplied ? appliedCode : value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={palette.textPlaceholder}
          editable={editable && !isApplied && !loading}
          autoCapitalize="characters"
          style={styles.input}
        />

        {isApplied ? (
          <Pressable
            onPress={onClear}
            style={styles.clearButton}
            accessibilityRole="button"
            accessibilityLabel="Clear code">
            <HwSymbol name="xmark" size={12} weight="bold" tintColor={palette.gray[600]} />
          </Pressable>
        ) : (
          <Pressable
            onPress={onApply}
            disabled={loading || !value.trim()}
            style={[styles.applyButton, (loading || !value.trim()) && styles.applyButtonDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Apply code">
            {loading ? (
              <ActivityIndicator size="small" color={palette.helloLime} />
            ) : (
              <Typography variant="text" size="sm" weight="bold" color={palette.helloLime}>
                Apply
              </Typography>
            )}
          </Pressable>
        )}
      </Pressable>

      {error ? (
        <Typography variant="text" size="xs" color={palette.red[600]}>
          {error}
        </Typography>
      ) : null}

      {successMessage ? (
        <Typography variant="text" size="xs" color={palette.helloLime}>
          {successMessage}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  inputRow: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: palette.borderDefault,
    borderRadius: Radius.sm,
    paddingLeft: 14,
    paddingRight: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.white,
  },
  inputRowApplied: {
    backgroundColor: palette.lime[50],
    borderColor: palette.lime[200],
  },
  inputRowError: {
    borderColor: palette.red[300],
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: palette.textPrimary,
    paddingVertical: 12,
  },
  applyButton: {
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  applyButtonDisabled: {
    opacity: 0.5,
  },
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.white,
  },
});
