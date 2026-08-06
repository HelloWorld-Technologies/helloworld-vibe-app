import { Image } from 'expo-image';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import type { PanGesture } from 'react-native-gesture-handler';
import type { ICarouselInstance } from 'react-native-reanimated-carousel';
import { runOnJS, useSharedValue } from 'react-native-reanimated';

import { HdpMomentsStoryViewer } from '@/components/hdp/hdp-moments-story-viewer';
import { HwCarousel } from '@/components/ui/carousel';
import { HwVideoPlayer } from '@/components/ui/hw-video-player';
import { Typography } from '@/components/ui/typography';
import { ImageAssets } from '@/constants/assets';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { HdpHeroSlide, HdpHeroTabId } from '@/types/hdp-media';
import type { HdpMomentItem } from '@/types/hdp-moments';
import { buildHeroTabs, slidesForHeroTab } from '@/utils/hdp-media';

/** Full-bleed hero height — sheet overlaps the bottom. */
export const HDP_HERO_TOTAL_HEIGHT = 460;

const EDGE_SWIPE_DISTANCE = 64;
const EDGE_SWIPE_VELOCITY = 850;

type HdpHeroMediaProps = {
  propertyVideos: HdpHeroSlide[];
  momentSlides: HdpHeroSlide[];
  photos: HdpHeroSlide[];
  moments: HdpMomentItem[];
  propertyName: string;
};

function HeroVideoSlide({
  slide,
  width,
  height,
  active,
  playing,
}: {
  slide: HdpHeroSlide;
  width: number;
  height: number;
  active: boolean;
  /** When false, show poster only until the user taps play. */
  playing: boolean;
}) {
  // Only attach a native player for the active, user-started slide.
  if (!active || !playing || !slide.mediaUrl) {
    return (
      <Image
        source={
          slide.imageUri ? { uri: slide.imageUri } : ImageAssets.loginBento1
        }
        style={{ width, height }}
        contentFit="cover"
      />
    );
  }

  return (
    <HwVideoPlayer
      uri={slide.mediaUrl}
      playing={active}
      loop
      muted
      posterUri={slide.imageUri}
      style={{ width, height }}
    />
  );
}

function HeroImageSlide({
  slide,
  width,
  height,
  onError,
  failed,
}: {
  slide: HdpHeroSlide;
  width: number;
  height: number;
  failed: boolean;
  onError: () => void;
}) {
  return (
    <Image
      source={failed || !slide.imageUri ? ImageAssets.loginBento1 : { uri: slide.imageUri }}
      style={{ width, height }}
      contentFit="cover"
      onError={onError}
    />
  );
}

export function HdpHeroMedia({
  propertyVideos,
  momentSlides,
  photos,
  moments,
  propertyName,
}: HdpHeroMediaProps) {
  const { width } = useWindowDimensions();
  const carouselRef = useRef<ICarouselInstance>(null);
  const tabs = useMemo(
    () => buildHeroTabs({ propertyVideos, moments: momentSlides, photos }),
    [propertyVideos, momentSlides, photos],
  );
  const [activeTab, setActiveTab] = useState<HdpHeroTabId>(tabs[0]?.id ?? 'photos');
  const [slideIndex, setSlideIndex] = useState(0);
  const [failedIndexes, setFailedIndexes] = useState<Set<string>>(new Set());
  const [storyIndex, setStoryIndex] = useState<number | null>(null);
  /** Wait for tap before mounting expo-video (faster HDP open). */
  const [videoStarted, setVideoStarted] = useState(false);

  useEffect(() => {
    if (tabs.length === 0) return;
    if (!tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(tabs[0].id);
      setSlideIndex(0);
    }
  }, [tabs, activeTab]);

  const slides = useMemo(
    () =>
      slidesForHeroTab(activeTab, {
        propertyVideos,
        moments: momentSlides,
        photos,
      }),
    [activeTab, propertyVideos, momentSlides, photos],
  );

  const safeSlides = slides.length > 0 ? slides : [];
  const currentIndex = Math.min(slideIndex, Math.max(safeSlides.length - 1, 0));
  const currentSlide = safeSlides[currentIndex];
  const showPlayButton =
    currentSlide?.mediaType === 'video' &&
    Boolean(currentSlide.mediaUrl) &&
    (activeTab === 'property-video' || activeTab === 'moments') &&
    !videoStarted;

  useEffect(() => {
    setVideoStarted(false);
  }, [activeTab, currentIndex, currentSlide?.id]);

  const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTab);
  const hasPrevTab = activeTabIndex > 0;
  const hasNextTab = activeTabIndex >= 0 && activeTabIndex < tabs.length - 1;
  const canGoPrevious = currentIndex > 0 || hasPrevTab;
  const canGoNext = currentIndex < safeSlides.length - 1 || hasNextTab;

  const slideIndexSV = useSharedValue(currentIndex);
  const slideCountSV = useSharedValue(safeSlides.length);
  const hasNextTabSV = useSharedValue(hasNextTab ? 1 : 0);
  const hasPrevTabSV = useSharedValue(hasPrevTab ? 1 : 0);
  const gestureStartIndexSV = useSharedValue(currentIndex);

  useEffect(() => {
    slideIndexSV.value = currentIndex;
    slideCountSV.value = safeSlides.length;
    hasNextTabSV.value = hasNextTab ? 1 : 0;
    hasPrevTabSV.value = hasPrevTab ? 1 : 0;
  }, [
    currentIndex,
    safeSlides.length,
    hasNextTab,
    hasPrevTab,
    slideIndexSV,
    slideCountSV,
    hasNextTabSV,
    hasPrevTabSV,
  ]);

  const handleTabChange = useCallback(
    (tab: HdpHeroTabId, startAt: 'first' | 'last' = 'first') => {
      const nextSlides = slidesForHeroTab(tab, {
        propertyVideos,
        moments: momentSlides,
        photos,
      });
      const targetIndex =
        startAt === 'last' ? Math.max(nextSlides.length - 1, 0) : 0;

      setActiveTab(tab);
      setSlideIndex(targetIndex);
      requestAnimationFrame(() => {
        carouselRef.current?.scrollTo({ index: targetIndex, animated: false });
      });
    },
    [propertyVideos, momentSlides, photos],
  );

  const showPrevious = useCallback(() => {
    if (currentIndex > 0) {
      carouselRef.current?.scrollTo({ index: currentIndex - 1, animated: true });
      return;
    }

    if (!hasPrevTab) return;
    handleTabChange(tabs[activeTabIndex - 1].id, 'last');
  }, [currentIndex, hasPrevTab, handleTabChange, tabs, activeTabIndex]);

  const showNext = useCallback(() => {
    if (currentIndex < safeSlides.length - 1) {
      carouselRef.current?.scrollTo({ index: currentIndex + 1, animated: true });
      return;
    }

    // End of Property Video → Moments; end of Moments → Photos (next available tab).
    if (!hasNextTab) return;
    handleTabChange(tabs[activeTabIndex + 1].id, 'first');
  }, [currentIndex, safeSlides.length, hasNextTab, handleTabChange, tabs, activeTabIndex]);

  const configureHeroPanGesture = useCallback(
    (gesture: PanGesture) => {
      gesture
        .onBegin(() => {
          'worklet';
          gestureStartIndexSV.value = slideIndexSV.value;
        })
        .onEnd((event) => {
          'worklet';
          const startIndex = gestureStartIndexSV.value;
          const lastIndex = Math.max(slideCountSV.value - 1, 0);
          const atStart = startIndex <= 0;
          const atEnd = startIndex >= lastIndex;
          const goNext =
            event.translationX < -EDGE_SWIPE_DISTANCE ||
            event.velocityX < -EDGE_SWIPE_VELOCITY;
          const goPrev =
            event.translationX > EDGE_SWIPE_DISTANCE ||
            event.velocityX > EDGE_SWIPE_VELOCITY;

          if (goNext && atEnd && hasNextTabSV.value) {
            runOnJS(showNext)();
          } else if (goPrev && atStart && hasPrevTabSV.value) {
            runOnJS(showPrevious)();
          }
        });
    },
    [
      gestureStartIndexSV,
      slideIndexSV,
      slideCountSV,
      hasNextTabSV,
      hasPrevTabSV,
      showNext,
      showPrevious,
    ],
  );

  function handleSlidePress(index: number) {
    if (activeTab !== 'moments') return;
    setStoryIndex(index);
  }

  if (tabs.length === 0) {
    return (
      <View style={[styles.root, { height: HDP_HERO_TOTAL_HEIGHT }]}>
        <Image
          source={ImageAssets.loginBento1}
          style={{ width, height: HDP_HERO_TOTAL_HEIGHT }}
          contentFit="cover"
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, { height: HDP_HERO_TOTAL_HEIGHT }]}>
      {safeSlides.length > 0 ? (
        <HwCarousel
          key={activeTab}
          data={safeSlides}
          width={width}
          height={HDP_HERO_TOTAL_HEIGHT}
          showPagination={false}
          carouselRef={carouselRef}
          onSnapToItem={setSlideIndex}
          onConfigurePanGesture={configureHeroPanGesture}
          renderItem={({ item, index }) => {
            const isActive = index === currentIndex;
            const failed = failedIndexes.has(item.id);
            const playInlineVideo =
              item.mediaType === 'video' &&
              (activeTab === 'property-video' || activeTab === 'moments');

            if (playInlineVideo) {
              return (
                <Pressable
                  onPress={() => handleSlidePress(index)}
                  disabled={activeTab !== 'moments'}
                  style={{ width, height: HDP_HERO_TOTAL_HEIGHT }}>
                  <HeroVideoSlide
                    slide={item}
                    width={width}
                    height={HDP_HERO_TOTAL_HEIGHT}
                    active={isActive}
                    playing={isActive && videoStarted}
                  />
                </Pressable>
              );
            }

            return (
              <Pressable
                onPress={() => handleSlidePress(index)}
                disabled={activeTab !== 'moments'}
                style={{ width, height: HDP_HERO_TOTAL_HEIGHT }}>
                <HeroImageSlide
                  slide={item}
                  width={width}
                  height={HDP_HERO_TOTAL_HEIGHT}
                  failed={failed}
                  onError={() =>
                    setFailedIndexes((current) => new Set(current).add(item.id))
                  }
                />
                {item.mediaType === 'video' ? (
                  <View style={styles.playBadge} pointerEvents="none">
                    <View style={styles.playCircle}>
                      <HwSymbol
                        name="play.fill"
                        size={22}
                        tintColor={palette.white}
                        style={styles.playIcon}
                      />
                    </View>
                  </View>
                ) : null}
              </Pressable>
            );
          }}
        />
      ) : (
        <View style={[styles.emptyMedia, { width, height: HDP_HERO_TOTAL_HEIGHT }]} />
      )}

      {showPlayButton ? (
        <Pressable
          onPress={() => setVideoStarted(true)}
          style={styles.playBadge}
          hitSlop={16}
          accessibilityRole="button"
          accessibilityLabel="Play video">
          <View style={styles.playCircle}>
            <HwSymbol
              name="play.fill"
              size={28}
              tintColor={palette.white}
              style={styles.playIcon}
            />
          </View>
        </Pressable>
      ) : null}

      {canGoPrevious || canGoNext ? (
        <>
          {canGoPrevious ? (
            <Pressable
              onPress={showPrevious}
              style={[styles.arrowButton, styles.arrowLeft]}
              accessibilityRole="button"
              accessibilityLabel="Previous media">
              <HwSymbol name="chevron.left" size={16} weight="semibold" tintColor={palette.white} />
            </Pressable>
          ) : null}
          {canGoNext ? (
            <Pressable
              onPress={showNext}
              style={[styles.arrowButton, styles.arrowRight]}
              accessibilityRole="button"
              accessibilityLabel="Next media">
              <HwSymbol name="chevron.right" size={16} weight="semibold" tintColor={palette.white} />
            </Pressable>
          ) : null}
        </>
      ) : null}

      {safeSlides.length > 0 ? (
        <View style={styles.counter} pointerEvents="none">
          <Typography variant="text" size="xs" weight="medium" color={palette.white}>
            {currentIndex + 1}/{safeSlides.length}
          </Typography>
        </View>
      ) : null}

      {/* Tabs + dots float on the media, just above the overlapping sheet */}
      <View style={styles.overlayControls} pointerEvents="box-none">
        <View style={styles.tabsRow}>
          {tabs.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <Pressable
                key={tab.id}
                onPress={() => handleTabChange(tab.id, 'first')}
                style={[styles.tabPill, active ? styles.tabPillActive : styles.tabPillInactive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}>
                <Typography
                  variant="text"
                  size="sm"
                  weight="medium"
                  color={palette.gray[900]}>
                  {tab.label}
                </Typography>
              </Pressable>
            );
          })}
        </View>

        {(activeTab === 'moments' || activeTab === 'photos') && safeSlides.length > 1 ? (
          <View style={styles.dotsRow}>
            {safeSlides.map((slide, index) => {
              const active = index === currentIndex;
              return (
                <Pressable
                  key={slide.id}
                  onPress={() => {
                    setSlideIndex(index);
                    carouselRef.current?.scrollTo({ index, animated: true });
                  }}
                  hitSlop={6}
                  accessibilityRole="button"
                  accessibilityLabel={`Go to ${activeTab} ${index + 1}`}
                  accessibilityState={{ selected: active }}
                  style={[styles.dot, active ? styles.dotActive : null]}
                />
              );
            })}
          </View>
        ) : (
          <View style={styles.dotsSpacer} />
        )}
      </View>

      <HdpMomentsStoryViewer
        visible={storyIndex !== null}
        moments={moments}
        initialIndex={storyIndex ?? 0}
        propertyName={propertyName}
        onClose={() => setStoryIndex(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: palette.black,
    overflow: 'hidden',
  },
  emptyMedia: {
    backgroundColor: palette.black,
  },
  arrowButton: {
    position: 'absolute',
    top: '42%',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowLeft: {
    left: 12,
  },
  arrowRight: {
    right: 12,
  },
  counter: {
    position: 'absolute',
    right: 16,
    bottom: 118,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  overlayControls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 56,
    paddingHorizontal: 16,
    gap: 14,
    alignItems: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  tabPillActive: {
    backgroundColor: palette.white,
  },
  tabPillInactive: {
    // Frosted mint glass over media (matches Figma inactive pills)
    backgroundColor: 'rgba(220, 236, 210, 0.55)',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
    minHeight: 8,
  },
  dotsSpacer: {
    height: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    width: 22,
    backgroundColor: palette.white,
  },
  playBadge: {
    position: 'absolute',
    left: 0,
    right: 0,
    // Sit in the visible media area (above tabs / sheet overlap).
    top: 0,
    bottom: 120,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    elevation: 20,
  },
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  playIcon: {
    width: 28,
    height: 28,
  },
});
