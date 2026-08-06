import { HwSymbol } from '@/components/ui/hw-symbol';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  ZoomIn,
} from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import { formatBookingAmount } from '@/utils/booking-payment';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

type BookingPaymentOptionProps = {
  label: string;
  amount: number;
  description: string;
  selected: boolean;
  required?: boolean;
  badge?: string;
  disabled?: boolean;
  onPress?: () => void;
};

function useCheckboxBounce(active: boolean) {
  const scale = useSharedValue(1);
  const didMountRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    scale.value = withSequence(
      withSpring(active ? 1.12 : 0.92, {
        damping: 11,
        stiffness: 400,
        mass: 0.55,
      }),
      withSpring(1, {
        damping: 14,
        stiffness: 280,
        mass: 0.7,
      }),
    );
  }, [active, scale]);

  return useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
}

export function BookingPaymentOption({
  label,
  amount,
  description,
  selected,
  required,
  badge,
  disabled,
  onPress,
}: BookingPaymentOptionProps) {
  const indicatorAnimatedStyle = useCheckboxBounce(selected);

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={[
        styles.card,
        selected && styles.cardSelected,
        disabled && styles.cardDisabled,
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}>
      <View style={styles.row}>
        <Animated.View style={[styles.radio, selected && styles.radioSelected, indicatorAnimatedStyle]}>
          {selected ? (
            <Animated.View entering={ZoomIn.duration(160).springify()}>
              <HwSymbol name="checkmark" size={12} weight="bold" tintColor={palette.white} />
            </Animated.View>
          ) : null}
        </Animated.View>

        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <Typography variant="text" size="sm" weight="bold">
              {label}
            </Typography>
            {badge ? (
              <View style={styles.badge}>
                <Typography variant="text" size="xs" weight="medium" color={palette.helloLime}>
                  {badge}
                </Typography>
              </View>
            ) : null}
          </View>
          <Typography variant="text" size="xs" color={palette.gray[600]}>
            {description}
          </Typography>
        </View>

        <Typography variant="text" size="sm" weight="bold">
          {formatBookingAmount(amount)}
        </Typography>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: palette.gray[200],
    borderRadius: Radius.md,
    padding: 14,
    backgroundColor: palette.white,
  },
  cardSelected: {
    borderColor: palette.lime[300],
    backgroundColor: palette.lime[50],
  },
  cardDisabled: {
    opacity: 0.95,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: palette.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioSelected: {
    borderColor: palette.helloLime,
    backgroundColor: palette.helloLime,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: palette.lime[100],
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
