import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import { formatNeighborhoodMeta } from '@/api/localities';
import { LocalityCardImage } from '@/components/locality/locality-card-image';
import { ParallaxLayer } from '@/components/ui/carousel';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import type { NeighborhoodCard } from '@/types/locality';

/** Matches helloworld-vibe `LocalityCard` (`rounded-3xl`). */
const CARD_RADIUS = 24;

type NeighborhoodLocalityCardProps = {
  item: NeighborhoodCard;
  width: number;
  height?: number;
  onPress?: () => void;
  animationValue?: SharedValue<number>;
  style?: StyleProp<ViewStyle>;
};

export function NeighborhoodLocalityCard({
  item,
  width,
  height,
  onPress,
  animationValue,
  style,
}: NeighborhoodLocalityCardProps) {
  const meta = formatNeighborhoodMeta(item);
  const image = (
    <LocalityCardImage
      imageUri={item.imageUri}
      style={animationValue ? styles.parallaxImage : styles.image}
    />
  );

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { width }, height != null ? { height } : null, style]}
      accessibilityRole="button"
      accessibilityLabel={meta ? `${item.name}, ${meta}` : item.name}>
      <View style={styles.imageWrap}>
        {animationValue ? (
          <ParallaxLayer animationValue={animationValue} style={styles.imageWrap}>
            {image}
          </ParallaxLayer>
        ) : (
          image
        )}
      </View>
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.overlay}>
        <View style={styles.copy}>
          <Typography
            variant="text"
            size="xl"
            weight="bold"
            color={palette.white}
            numberOfLines={1}>
            {item.name}
          </Typography>
          {meta ? (
            <Typography
              variant="text"
              size="sm"
              color="rgba(255,255,255,0.9)"
              numberOfLines={1}>
              {meta}
            </Typography>
          ) : null}
        </View>
        <View style={styles.arrow} pointerEvents="none">
          <HwSymbol
            name="arrow.right"
            size={24}
            weight="medium"
            tintColor={palette.white}
          />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: palette.gray[200],
  },
  imageWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  parallaxImage: {
    width: '130%',
    height: '100%',
    marginLeft: '-15%',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 20,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  arrow: {
    flexShrink: 0,
    marginBottom: 2,
  },
});
