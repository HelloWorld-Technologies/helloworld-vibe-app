import { useCallback, useRef, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';
import Carousel, { type ICarouselInstance } from 'react-native-reanimated-carousel';

import { CarouselPagination } from '@/components/ui/carousel/carousel-pagination';
import { configureCarouselPanGesture } from '@/components/ui/carousel/configure-pan-gesture';

export type HwParallaxCarouselRenderInfo<T> = {
  item: T;
  index: number;
  animationValue: SharedValue<number>;
};

export type HwParallaxModeConfig = {
  parallaxScrollingOffset?: number;
  parallaxScrollingScale?: number;
  parallaxAdjacentItemScale?: number;
};

export type HwParallaxCarouselProps<T> = {
  data: T[];
  width: number;
  height: number;
  /** Viewport width. When larger than `width`, multiple items are visible. */
  windowWidth?: number;
  renderItem: (info: HwParallaxCarouselRenderInfo<T>) => ReactNode;
  loop?: boolean;
  showPagination?: boolean;
  modeConfig?: HwParallaxModeConfig;
  style?: StyleProp<ViewStyle>;
  onSnapToItem?: (index: number) => void;
  enabled?: boolean;
};

const DEFAULT_MODE_CONFIG: HwParallaxModeConfig = {
  parallaxScrollingScale: 0.92,
  parallaxScrollingOffset: 48,
  parallaxAdjacentItemScale: 0.86,
};

const FLAT_MODE_CONFIG: HwParallaxModeConfig = {
  parallaxScrollingScale: 1,
  parallaxScrollingOffset: 0,
  parallaxAdjacentItemScale: 1,
};

export function HwParallaxCarousel<T extends object>({
  data,
  width,
  height,
  windowWidth,
  renderItem,
  loop = false,
  showPagination = true,
  modeConfig,
  style,
  onSnapToItem,
  enabled = true,
}: HwParallaxCarouselProps<T>) {
  const carouselRef = useRef<ICarouselInstance>(null);
  const progress = useSharedValue(0);
  const resolvedModeConfig =
    modeConfig ?? (windowWidth != null && windowWidth > width ? FLAT_MODE_CONFIG : DEFAULT_MODE_CONFIG);

  const handlePaginationPress = useCallback((index: number) => {
    carouselRef.current?.scrollTo({ index, animated: true });
  }, []);

  return (
    <View style={style}>
      <Carousel
        ref={carouselRef}
        width={width}
        height={height}
        data={data}
        loop={loop}
        mode="parallax"
        modeConfig={resolvedModeConfig}
        pagingEnabled
        snapEnabled
        enabled={enabled}
        overscrollEnabled
        onConfigurePanGesture={configureCarouselPanGesture}
        onProgressChange={progress}
        onSnapToItem={onSnapToItem}
        style={[styles.carousel, windowWidth != null ? { width: windowWidth } : null]}
        renderItem={({ item, index, animationValue }) => (
          <View style={styles.item}>{renderItem({ item, index, animationValue })}</View>
        )}
      />
      {showPagination && data.length > 1 ? (
        <CarouselPagination progress={progress} data={data} onPress={handlePaginationPress} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  carousel: {
    overflow: 'visible',
  },
  item: {
    flex: 1,
  },
});
