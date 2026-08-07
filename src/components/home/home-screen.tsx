import { HwSymbol } from '@/components/ui/hw-symbol';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SelectCitySheet } from '@/components/city/select-city-sheet';
import { HdpMomentsStoryViewer } from '@/components/hdp/hdp-moments-story-viewer';
import { HwIcon } from '@/components/hw-icon';
import { LocalityCardImage } from '@/components/locality/locality-card-image';
import { PropertyCard } from '@/components/property/property-card';
import { HwCarousel, HwParallaxCarousel, ParallaxLayer } from '@/components/ui/carousel';
import { EmptyState } from '@/components/ui/empty-state';
import { GradientText } from '@/components/ui/gradient-text';
import { SearchInput } from '@/components/ui/search-input';
import { Typography } from '@/components/ui/typography';
import { VibeSelectionList } from '@/components/vibe/vibe-selection-list';
import {
  HOME_BACKGROUND_GRADIENT,
  NEIGHBORHOODS,
} from '@/constants/home';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { mapVibesToListItems, VIBE_OPTIONS } from '@/constants/vibes';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { useMomentsFeed } from '@/queries/use-moments-feed';
import { useSrpProperties } from '@/queries/use-srp-properties';
import { useVibesList } from '@/queries/use-vibes';
import { useSelectedCity, useSelectedLocality } from '@/stores/auth-store';
import type { PropertyListing } from '@/types/property';

function SectionTitle({
  prefix,
  highlight,
}: {
  prefix: string;
  highlight: string;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Typography variant="text" size="xl" weight="medium">
        {prefix}
      </Typography>
      <GradientText variant="text" size="xl" weight="black" style={styles.sectionHighlight}>
        {highlight}
      </GradientText>
    </View>
  );
}

const ITEM_GAP = 12;
const PROPERTY_CAROUSEL_HEIGHT = 540;
const FEED_CARD_WIDTH = 172;
const FEED_CARD_HEIGHT = 268;
const FEED_CARD_GAP = 16;
const FEEDBACK_BANNER_HEIGHT = 44;
const FEEDBACK_BANNER_GAP = 12;
const HEADER_SHADOW_THRESHOLD = 8;

export function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const { width, height } = useWindowDimensions();

  const city = useSelectedCity();
  const locality = useSelectedLocality();
  const { data: srpData, isLoading: isLoadingProperties } = useSrpProperties(city);
  const { data: feedData, isLoading: isLoadingFeed } = useMomentsFeed();
  const { data: apiVibes = [] } = useVibesList();
  const properties = srpData?.listings ?? [];
  const feedMoments = (feedData?.moments ?? []).slice(0, 8);
  const vibeOptions = useMemo(
    () => (apiVibes.length > 0 ? mapVibesToListItems(apiVibes) : [...VIBE_OPTIONS]),
    [apiVibes],
  );
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(true);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [feedStoryOpen, setFeedStoryOpen] = useState(false);
  const [feedStoryIndex, setFeedStoryIndex] = useState(0);
  const [citySheetVisible, setCitySheetVisible] = useState(false);
  const scrollBottomPadding = Platform.OS === 'ios' ? 70 : 130;

  const cardWidth = width - 48;
  const slideWidth = cardWidth + ITEM_GAP;
  const feedSlideWidth = FEED_CARD_WIDTH + FEED_CARD_GAP;
  const stickyHeaderHeight = insets.top + 8 + 56 + 12;
  const gradientHeight = Math.max(380, height * 0.52);

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const scrolled = event.nativeEvent.contentOffset.y > HEADER_SHADOW_THRESHOLD;
    setHeaderScrolled((current) => (current === scrolled ? current : scrolled));
  }

  function openProperty(property: PropertyListing) {
    const image =
      typeof property.images[0] === 'object' &&
      property.images[0] &&
      'uri' in property.images[0]
        ? property.images[0].uri
        : undefined;

    router.push({
      pathname: '/hdp',
      params: {
        id: property.id,
        name: property.name,
        image,
      },
    });
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...HOME_BACKGROUND_GRADIENT.colors]}
        start={HOME_BACKGROUND_GRADIENT.start}
        end={HOME_BACKGROUND_GRADIENT.end}
        style={[styles.gradientCanvas, { height: gradientHeight }]}
        pointerEvents="none"
      />

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: stickyHeaderHeight,
          paddingBottom: scrollBottomPadding,
          flexGrow: 1,
        }}>
        <View style={styles.heroSection}>
          <Typography
            variant="display"
            size="sm"
            weight="bold"
            color={palette.white}
            style={styles.hero}>
            Coliving that Matches Your{' '}
            <Typography
              variant="display"
              size="sm"
              weight="bold"
              color={palette.lime[200]}
              style={styles.heroItalic}>
              Vibe!
            </Typography>
          </Typography>

          <SearchInput
            editable={false}
            value={locality ?? ''}
            onPress={() => router.push('/search')}
            containerStyle={styles.searchInputMargin}
          />

          <VibeSelectionList
            vibes={vibeOptions}
            selectedIds={selectedVibes}
            onChange={setSelectedVibes}
            variant="onDark"
            hint={
              <Typography variant="text" size="xs" color={palette.white}>
                ✨ Pick at least 5 vibes for better matches{' '}
                <Typography
                  variant="text"
                  size="xs"
                  color="rgba(255,255,255,0.65)"
                  style={styles.vibeHintOptional}>
                  (optional)
                </Typography>
              </Typography>
            }
          />
        </View>

        <View style={styles.bodySheet}>
          <View style={styles.body}>
          <SectionTitle prefix="Find your " highlight="Neighborhood!" />
          <HwParallaxCarousel
            data={[...NEIGHBORHOODS]}
            width={slideWidth}
            height={200}
            style={styles.carouselWrap}
            renderItem={({ item, animationValue }) => (
              <View style={[styles.neighborhoodCard, { width: cardWidth }]}>
                <ParallaxLayer animationValue={animationValue} style={styles.neighborhoodImageWrap}>
                  <LocalityCardImage imageKey={item.image} style={styles.neighborhoodImage} />
                </ParallaxLayer>
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.75)']}
                  style={styles.neighborhoodOverlay}>
                  <Typography variant="text" size="lg" weight="bold" color={palette.white}>
                    {item.name}
                  </Typography>
                  <View style={styles.neighborhoodMeta}>
                    <Typography variant="text" size="xs" color={palette.gray[200]}>
                      Starting {item.price} | {item.properties} Properties
                    </Typography>
                    <HwSymbol name="arrow.right" size={12} tintColor={palette.white} />
                  </View>
                </LinearGradient>
              </View>
            )}
          />

          <SectionTitle prefix="This could be your " highlight="Home!" />
          {isLoadingProperties ? (
            <View style={styles.propertiesLoader}>
              <ActivityIndicator color={palette.helloLime} />
            </View>
          ) : properties.length > 0 ? (
            <HwCarousel
              key={city}
              data={properties}
              width={slideWidth}
              height={PROPERTY_CAROUSEL_HEIGHT}
              style={styles.carouselWrap}
              renderItem={({ item }) => (
                <PropertyCard
                  property={item}
                  style={{ width: cardWidth, alignSelf: 'center' }}
                  onPress={() => openProperty(item)}
                />
              )}
            />
          ) : (
            <EmptyState
              compact
              title={`No properties found in ${city}`}
              subtitle="Try another city or check back soon."
              actionLabel="Change City"
              onAction={() => setCitySheetVisible(true)}
            />
          )}

          {(isLoadingFeed || feedMoments.length > 0) ? (
            <>
              <SectionTitle prefix="Straight from the " highlight="Feed!" />
              {isLoadingFeed ? (
                <View style={styles.feedLoader}>
                  <ActivityIndicator color={palette.helloLime} />
                </View>
              ) : (
                <HwCarousel
                  data={feedMoments}
                  width={feedSlideWidth}
                  height={FEED_CARD_HEIGHT + 12}
                  style={styles.feedCarouselWrap}
                  renderItem={({ item, index }) => (
                    <Pressable
                      onPress={() => {
                        setFeedStoryIndex(index);
                        setFeedStoryOpen(true);
                      }}
                      style={[styles.feedCard, { width: FEED_CARD_WIDTH }]}
                      accessibilityRole="button"
                      accessibilityLabel={item.label || 'Watch moment'}>
                      <View style={styles.feedCardInner}>
                        <Image
                          source={{ uri: item.imageUri }}
                          style={styles.feedImage}
                          contentFit="cover"
                        />
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.55)']}
                          style={styles.feedOverlay}>
                          {item.label ? (
                            <Typography
                              variant="text"
                              size="md"
                              weight="bold"
                              color={palette.white}
                              numberOfLines={2}
                              style={styles.feedCaption}>
                              {item.label}
                            </Typography>
                          ) : null}
                        </LinearGradient>
                        {item.mediaType === 'video' ? (
                          <View style={styles.videoBadge} pointerEvents="none">
                            <HwSymbol name="video.fill" size={14} tintColor={palette.white} />
                          </View>
                        ) : null}
                      </View>
                    </Pressable>
                  )}
                />
              )}
            </>
          ) : null}
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.stickyHeader,
          { paddingTop: insets.top + 8 },
          headerScrolled && styles.stickyHeaderScrolled,
        ]}>
        <View style={styles.headerTop}>
          <Pressable
            onPress={() => setCitySheetVisible(true)}
            style={styles.locationRow}
            accessibilityRole="button"
            accessibilityLabel="Change city">
            <Typography variant="text" size="xs" color={palette.gray[300]}>
              You are in
            </Typography>
            <View style={styles.cityRow}>
              <Typography variant="text" size="sm" weight="bold" color={palette.lime[300]}>
                {city}
              </Typography>
              <HwSymbol
                name="chevron.down"
                size={12}
                weight="semibold"
                tintColor={palette.lime[300]}
              />
            </View>
          </Pressable>

          <Pressable
            onPress={() => router.push('/menu')}
            style={styles.profileButton}
            accessibilityRole="button"
            accessibilityLabel="Open profile menu">
            <HwIcon name="profile" size={20} color={palette.white} />
          </Pressable>
        </View>
      </View>

      {/* {showFeedback ? (
        <View style={[styles.feedbackBanner, { bottom: tabBarInset + FEEDBACK_BANNER_GAP }]}>
          <Typography variant="text" size="xs" color={palette.textSecondary} style={styles.feedbackText}>
            How was your visit to HW Mahaveer? ›
          </Typography>
          <Pressable
            onPress={() => setShowFeedback(false)}
            accessibilityLabel="Dismiss feedback"
            hitSlop={8}>
            <HwSymbol name="xmark" size={14} tintColor={palette.gray[500]} />
          </Pressable>
        </View>
      ) : null} */}

      <HdpMomentsStoryViewer
        visible={feedStoryOpen}
        moments={feedMoments}
        initialIndex={feedStoryIndex}
        propertyName="HelloWorld"
        onClose={() => setFeedStoryOpen(false)}
      />

      <SelectCitySheet
        visible={citySheetVisible}
        onClose={() => setCitySheetVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.white,
  },
  gradientCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  stickyHeaderScrolled: {
    backgroundColor: palette.homeGradientTop,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  locationRow: {
    gap: 2,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    textAlign: 'center',
    marginBottom: 20,
  },
  heroItalic: {
    fontStyle: 'italic',
  },
  searchInputMargin: {
    marginBottom: 16,
  },
  vibeHintOptional: {
    fontStyle: 'italic',
  },
  scroll: {
    flex: 1,
    zIndex: 1,
  },
  bodySheet: {
    marginTop: -32,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: palette.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    // elevation: 12,
  },
  body: {
    paddingTop: 32,
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 28,
    flex: 1,
    overflow: 'visible',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionHighlight: {
    fontStyle: 'italic',
  },
  carouselWrap: {
    marginHorizontal: -4,
    marginBottom: 8,
  },
  feedCarouselWrap: {
    marginHorizontal: -4,
    marginBottom: 16,
  },
  propertiesLoader: {
    height: PROPERTY_CAROUSEL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedLoader: {
    height: FEED_CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  neighborhoodCard: {
    height: 200,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  neighborhoodImageWrap: {
    ...StyleSheet.absoluteFill,
  },
  neighborhoodImage: {
    // Extra horizontal bleed so ParallaxLayer translateX doesn't clip the photo.
    width: '130%',
    height: '100%',
    marginLeft: '-15%',
  },
  neighborhoodOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    gap: 4,
  },
  neighborhoodMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feedCard: {
    height: FEED_CARD_HEIGHT,
    borderRadius: 20,
    backgroundColor: palette.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 6,
    alignSelf: 'flex-start',
  },
  feedCardInner: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: palette.gray[200],
  },
  feedImage: {
    ...StyleSheet.absoluteFill,
  },
  feedOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    paddingBottom: 16,
    paddingTop: 40,
    justifyContent: 'flex-end',
  },
  feedCaption: {
    textAlign: 'center',
  },
  videoBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  feedbackBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.gray[100],
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  feedbackText: {
    flex: 1,
  },
});
