import { HwSymbol } from '@/components/ui/hw-symbol';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/typography';
import { fontStyleForWeight } from '@/constants/fonts';
import palette from '@/constants/palette';
import { SHARE_SYMBOL } from '@/constants/symbols';
import { Radius } from '@/constants/theme';

type InlineSearchConfig = {
  value?: string;
  placeholder?: string;
  onPress: () => void;
};

type ScrollRevealHeaderProps = {
  title: string;
  scrollY: SharedValue<number>;
  threshold?: number;
  onBack: () => void;
  inlineSearch?: InlineSearchConfig;
  onRightPress?: () => void;
  rightIcon?: 'magnifyingglass' | 'share';
  rightAccessibilityLabel?: string;
  /** Smaller circular icon buttons (36px) for hero overlays like SRP/locality. */
  compact?: boolean;
  /** When set, back and right icons use this color (no lime accent on hero). */
  iconTintColor?: string;
};

const DEFAULT_ICON_BUTTON_SIZE = 44;
const COMPACT_ICON_BUTTON_SIZE = 36;

function HeaderInlineSearch({
  value,
  placeholder = 'Search locality or property',
  onPress,
  scrolled,
}: InlineSearchConfig & { scrolled: boolean }) {
  const displayText = value?.trim() ? value : placeholder;
  const isPlaceholder = !value?.trim();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.inlineSearch, scrolled && styles.inlineSearchScrolled]}
      accessibilityRole="button"
      accessibilityLabel="Search locality or property">
      <HwSymbol
        name="magnifyingglass"
        size={18}
        tintColor={scrolled ? palette.gray[500] : palette.gray[600]}
      />
      <Text
        numberOfLines={1}
        style={[
          styles.inlineSearchText,
          isPlaceholder ? styles.inlineSearchPlaceholder : styles.inlineSearchValue,
        ]}>
        {displayText}
      </Text>
    </Pressable>
  );
}

export function ScrollRevealHeader({
  title,
  scrollY,
  threshold = 280,
  onBack,
  inlineSearch,
  onRightPress,
  rightIcon = 'magnifyingglass',
  rightAccessibilityLabel = 'Search',
  compact = false,
  iconTintColor,
}: ScrollRevealHeaderProps) {
  const insets = useSafeAreaInsets();
  const fadeStart = Math.max(threshold - 32, 0);
  const showRightAction = !inlineSearch && onRightPress;
  const iconButtonSize = compact ? COMPACT_ICON_BUTTON_SIZE : DEFAULT_ICON_BUTTON_SIZE;
  const iconButtonRadius = iconButtonSize / 2;
  const backIconSize = compact ? 14 : 17;
  const rightIconSize = rightIcon === 'magnifyingglass' ? (compact ? 16 : 18) : compact ? 15 : 17;

  const barStyle = useAnimatedStyle(() => {
    const progress = interpolate(scrollY.value, [fadeStart, threshold], [0, 1], Extrapolation.CLAMP);

    return {
      backgroundColor: `rgba(255, 255, 255, ${progress})`,
      borderBottomColor: `rgba(232, 234, 235, ${progress})`,
      borderBottomWidth: progress > 0.02 ? StyleSheet.hairlineWidth : 0,
      shadowOpacity: progress * 0.08,
      elevation: progress * 4,
    };
  });

  const titleStyle = useAnimatedStyle(() => {
    const progress = interpolate(scrollY.value, [fadeStart, threshold], [0, 1], Extrapolation.CLAMP);

    return {
      opacity: inlineSearch ? progress : progress,
      transform: [{ translateY: interpolate(progress, [0, 1], [6, 0]) }],
    };
  });

  const inlineSearchStyle = useAnimatedStyle(() => {
    if (!inlineSearch) return { opacity: 1 };

    const progress = interpolate(scrollY.value, [fadeStart, threshold], [0, 1], Extrapolation.CLAMP);

    return {
      opacity: 1 - progress,
    };
  });

  const iconButtonShellStyle = useAnimatedStyle(() => {
    const progress = interpolate(scrollY.value, [fadeStart, threshold], [0, 1], Extrapolation.CLAMP);

    return {
      backgroundColor: palette.white,
      borderRadius: iconButtonRadius,
      borderColor: `rgba(213, 215, 218, ${progress * 0.65})`,
      borderWidth: interpolate(progress, [0, 1], [0, StyleSheet.hairlineWidth]),
      shadowOpacity: interpolate(progress, [0, 1], [0.14, 0.04]),
      shadowRadius: interpolate(progress, [0, 1], [8, 4]),
      elevation: interpolate(progress, [0, 1], [3, 1]),
    };
  });

  const rightIconAccentStyle = useAnimatedStyle(() => {
    const progress = interpolate(scrollY.value, [fadeStart, threshold], [0, 1], Extrapolation.CLAMP);

    return {
      opacity: 1 - progress,
    };
  });

  const rightIconDefaultStyle = useAnimatedStyle(() => {
    const progress = interpolate(scrollY.value, [fadeStart, threshold], [0, 1], Extrapolation.CLAMP);

    return {
      opacity: progress,
    };
  });

  const resolvedRightIcon = rightIcon === 'share' ? SHARE_SYMBOL : rightIcon;
  const iconButtonShellStyleStatic = {
    width: iconButtonSize,
    height: iconButtonSize,
    borderRadius: iconButtonRadius,
  };
  const iconButtonStyleStatic = iconButtonShellStyleStatic;

  return (
    <Animated.View
      style={[styles.bar, { paddingTop: insets.top + 8, paddingBottom: 12 }, barStyle]}
      pointerEvents="box-none">
      <View style={styles.row} pointerEvents="box-none">
        <Animated.View style={[styles.iconButtonShell, iconButtonShellStyleStatic, iconButtonShellStyle]}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.iconButton,
              iconButtonStyleStatic,
              pressed && styles.iconButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}>
            <HwSymbol
              name="chevron.left"
              size={backIconSize}
              weight="semibold"
              tintColor={iconTintColor ?? palette.gray[900]}
            />
          </Pressable>
        </Animated.View>

        {inlineSearch ? (
          <View style={styles.inlineSearchWrap} pointerEvents="box-none">
            <Animated.View style={[styles.inlineSearchLayer, inlineSearchStyle]}>
              <HeaderInlineSearch {...inlineSearch} scrolled={false} />
            </Animated.View>
            <Animated.View
              style={[styles.titleOverlay, titleStyle]}
              pointerEvents="none">
              <Typography variant="text" size="md" weight="bold" numberOfLines={1} style={styles.title}>
                {title}
              </Typography>
            </Animated.View>
          </View>
        ) : (
          <Animated.View style={[styles.titleWrap, titleStyle]} pointerEvents="none">
            <Typography variant="text" size="md" weight="bold" numberOfLines={1} style={styles.title}>
              {title}
            </Typography>
          </Animated.View>
        )}

        {showRightAction ? (
          <Animated.View style={[styles.iconButtonShell, iconButtonShellStyleStatic, iconButtonShellStyle]}>
            <Pressable
              onPress={onRightPress}
              style={({ pressed }) => [
                styles.iconButton,
                iconButtonStyleStatic,
                pressed && styles.iconButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={rightAccessibilityLabel}
              hitSlop={8}>
              <View style={styles.rightIconWrap}>
                <Animated.View style={[styles.rightIconLayer, rightIconAccentStyle]}>
                  <HwSymbol
                    name={resolvedRightIcon}
                    size={rightIconSize}
                    weight="semibold"
                    tintColor={iconTintColor ?? palette.helloLime}
                  />
                </Animated.View>
                <Animated.View style={[styles.rightIconLayer, rightIconDefaultStyle]}>
                  <HwSymbol
                    name={resolvedRightIcon}
                    size={rightIconSize}
                    weight="semibold"
                    tintColor={iconTintColor ?? palette.gray[900]}
                  />
                </Animated.View>
              </View>
            </Pressable>
          </Animated.View>
        ) : !inlineSearch ? (
          <View style={{ width: iconButtonSize }} />
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 10,
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  titleOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  title: {
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  iconButtonShell: {
    overflow: 'hidden',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  inlineSearchWrap: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  inlineSearchLayer: {
    width: '100%',
  },
  inlineSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  inlineSearchScrolled: {
    backgroundColor: palette.gray[100],
    borderColor: palette.gray[200],
    shadowOpacity: 0,
    elevation: 0,
  },
  inlineSearchText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  inlineSearchPlaceholder: {
    ...fontStyleForWeight('regular'),
    color: palette.gray[500],
  },
  inlineSearchValue: {
    ...fontStyleForWeight('medium'),
    color: palette.gray[900],
  },
  rightIconWrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightIconLayer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
