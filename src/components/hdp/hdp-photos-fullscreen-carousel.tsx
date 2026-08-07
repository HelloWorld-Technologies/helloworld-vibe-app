import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type { ICarouselInstance } from 'react-native-reanimated-carousel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HwCarousel } from '@/components/ui/carousel';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { Typography } from '@/components/ui/typography';
import { ImageAssets } from '@/constants/assets';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { HdpHeroSlide } from '@/types/hdp-media';

type HdpPhotosFullscreenCarouselProps = {
  visible: boolean;
  photos: HdpHeroSlide[];
  initialIndex?: number;
  propertyName?: string;
  onClose: () => void;
};

export function HdpPhotosFullscreenCarousel({
  visible,
  photos,
  initialIndex = 0,
  propertyName,
  onClose,
}: HdpPhotosFullscreenCarouselProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const carouselRef = useRef<ICarouselInstance>(null);
  const [index, setIndex] = useState(initialIndex);
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!visible) return;
    const start = Math.min(Math.max(initialIndex, 0), Math.max(photos.length - 1, 0));
    setIndex(start);
    setFailedIds(new Set());
    requestAnimationFrame(() => {
      carouselRef.current?.scrollTo({ index: start, animated: false });
    });
  }, [visible, initialIndex, photos.length]);

  if (!visible || photos.length === 0) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
      statusBarTranslucent>
      <StatusBar style="light" />
      <GestureHandlerRootView style={styles.root}>
        <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              {propertyName ? (
                <Typography
                  variant="text"
                  size="sm"
                  weight="medium"
                  color={palette.white}
                  numberOfLines={1}>
                  {propertyName}
                </Typography>
              ) : null}
              <Typography variant="text" size="xs" color={palette.gray[300]}>
                {index + 1} / {photos.length}
              </Typography>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close photos">
              <HwSymbol name="xmark" size={18} weight="semibold" tintColor={palette.white} />
            </Pressable>
          </View>

          <HwCarousel
            data={photos}
            width={width}
            height={height - insets.top - insets.bottom - 72}
            showPagination={photos.length > 1}
            paginationDotColor="rgba(255,255,255,0.35)"
            paginationActiveDotColor={palette.white}
            carouselRef={carouselRef}
            onSnapToItem={setIndex}
            style={styles.carousel}
            renderItem={({ item }) => {
              const failed = failedIds.has(item.id);
              return (
                <View style={[styles.slide, { width, height: height - insets.top - insets.bottom - 72 }]}>
                  <Image
                    source={
                      failed || !item.imageUri
                        ? ImageAssets.loginBento1
                        : { uri: item.imageUri }
                    }
                    style={styles.image}
                    contentFit="contain"
                    onError={() =>
                      setFailedIds((current) => new Set(current).add(item.id))
                    }
                  />
                </View>
              );
            }}
          />
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carousel: {
    flex: 1,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
