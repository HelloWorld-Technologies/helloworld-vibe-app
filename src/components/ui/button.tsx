import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { fontStyleForWeight } from '@/constants/fonts';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  loading?: boolean;
  variant?: 'primary' | 'outline' | 'text';
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  loading,
  variant = 'primary',
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : isOutline ? styles.outline : styles.textVariant,
        disabled && !loading && styles.disabled,
        loading && styles.loading,
        pressed && !loading && isPrimary && styles.primaryPressed,
        pressed && !loading && isOutline && styles.outlinePressed,
        style,
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? palette.gray[800] : isOutline ? palette.gray[800] : palette.helloLime} />
      ) : (
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          style={[
            styles.label,
            isPrimary ? styles.primaryLabel : isOutline ? styles.outlineLabel : styles.textLabel,
          ]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: palette.lime[300],
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  primaryPressed: {
    backgroundColor: palette.lime[400],
  },
  outline: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray[300],
  },
  outlinePressed: {
    backgroundColor: palette.gray[50],
  },
  textVariant: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  loading: {
    opacity: 1,
  },
  label: {
    fontSize: 16,
    lineHeight: 24,
    ...fontStyleForWeight('medium'),
  },
  primaryLabel: {
    color: palette.gray[800],
    ...fontStyleForWeight('bold'),
  },
  outlineLabel: {
    color: palette.gray[800],
    ...fontStyleForWeight('bold'),
  },
  textLabel: {
    color: palette.helloLime,
  },
});
