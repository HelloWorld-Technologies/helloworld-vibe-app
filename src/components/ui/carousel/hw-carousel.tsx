import { useCallback, useRef, type ReactNode, type RefObject } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { PanGesture } from 'react-native-gesture-handler';
import Carousel, { type ICarouselInstance } from 'react-native-reanimated-carousel';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';

import { CarouselPagination } from '@/components/ui/carousel/carousel-pagination';
import { configureCarouselPanGesture } from '@/components/ui/carousel/configure-pan-gesture';

export type HwCarouselRenderInfo<T> = {
  item: T;
  index: number;
  animationValue: SharedValue<number>;
};

export type HwCarouselProps<T> = {
  data: T[];
  width: number;
  height: number;
  /** Viewport width. When larger than `width`, multiple items are visible. */
  windowWidth?: number;
  renderItem: (info: HwCarouselRenderInfo<T>) => ReactNode;
  loop?: boolean;
  showPagination?: boolean;
  paginationDotColor?: string;
  paginationActiveDotColor?: string;
  paginationStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  onSnapToItem?: (index: number) => void;
  enabled?: boolean;
  carouselRef?: RefObject<ICarouselInstance | null>;
  /** Extra pan configuration (chained after the default horizontal setup). */
  onConfigurePanGesture?: (gesture: PanGesture) => void;
};

export function HwCarousel<T extends object>({
  data,
  width,
  height,
  windowWidth,
  renderItem,
  loop = false,
  showPagination = true,
  paginationDotColor,
  paginationActiveDotColor,
  paginationStyle,
  style,
  onSnapToItem,
  enabled = true,
  carouselRef,
  onConfigurePanGesture,
}: HwCarouselProps<T>) {
  const internalRef = useRef<ICarouselInstance>(null);
  const resolvedRef = carouselRef ?? internalRef;
  const progress = useSharedValue(0);

  const handlePaginationPress = useCallback((index: number) => {
    resolvedRef.current?.scrollTo({ index, animated: true });
  }, [resolvedRef]);

  const handleConfigurePanGesture = useCallback(
    (gesture: PanGesture) => {
      configureCarouselPanGesture(gesture);
      onConfigurePanGesture?.(gesture);
    },
    [onConfigurePanGesture],
  );

  return (
    <View style={style}>
      <Carousel
        ref={resolvedRef}
        width={width}
        height={height}
        data={data}
        loop={loop}
        pagingEnabled
        snapEnabled
        enabled={enabled}
        overscrollEnabled
        onConfigurePanGesture={handleConfigurePanGesture}
        onProgressChange={progress}
        onSnapToItem={onSnapToItem}
        style={[styles.carousel, windowWidth != null ? { width: windowWidth } : null]}
        renderItem={({ item, index, animationValue }) => (
          <View style={styles.item}>{renderItem({ item, index, animationValue })}</View>
        )}
      />
      {showPagination && data.length > 1 ? (
        <CarouselPagination
          progress={progress}
          data={data}
          onPress={handlePaginationPress}
          dotColor={paginationDotColor}
          activeDotColor={paginationActiveDotColor}
          containerStyle={paginationStyle}
        />
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
