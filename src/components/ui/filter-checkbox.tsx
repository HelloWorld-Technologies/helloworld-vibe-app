import { HwSymbol } from '@/components/ui/hw-symbol';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  ZoomIn,
} from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';

type FilterCheckboxProps = {
  label: string;
  checked: boolean;
  onChange: () => void;
  labelSize?: 'xs' | 'sm';
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
      withSpring(active ? 1.14 : 0.9, {
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

export function FilterCheckbox({ label, checked, onChange, labelSize = 'sm' }: FilterCheckboxProps) {
  const boxAnimatedStyle = useCheckboxBounce(checked);

  return (
    <Pressable
      onPress={onChange}
      style={styles.root}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}>
      <Animated.View style={[styles.box, checked && styles.boxChecked, boxAnimatedStyle]}>
        {checked ? (
          <Animated.View entering={ZoomIn.duration(160).springify()}>
            <HwSymbol name="checkmark" size={12} weight="bold" tintColor={palette.gray[800]} />
          </Animated.View>
        ) : null}
      </Animated.View>
      <Typography
        variant="text"
        size={labelSize}
        weight="medium"
        color={labelSize === 'xs' ? palette.gray[500] : palette.gray[700]}
        style={styles.label}>
        {label}
      </Typography>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: palette.gray[300],
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  boxChecked: {
    borderColor: palette.gray[600],
    backgroundColor: palette.gray[50],
  },
  label: {
    flex: 1,
  },
});
