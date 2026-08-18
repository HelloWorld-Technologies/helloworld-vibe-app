import { HwSymbol } from '@/components/ui/hw-symbol';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
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

import { mapLocalityToNeighborhoodCard } from '@/api/localities';
import { SelectCitySheet } from '@/components/city/select-city-sheet';
import { HdpMomentsStoryViewer } from '@/components/hdp/hdp-moments-story-viewer';
import { HwIcon } from '@/components/hw-icon';
import { NeighborhoodLocalityCard } from '@/components/locality/neighborhood-locality-card';
import { PropertyCard } from '@/components/property/property-card';
import { HomeFeedSkeleton, HomePropertiesSkeleton } from '@/components/skeleton';
import { HwCarousel, HwParallaxCarousel } from '@/components/ui/carousel';
import { EmptyState } from '@/components/ui/empty-state';
import { GradientText } from '@/components/ui/gradient-text';
import { SearchInput } from '@/components/ui/search-input';
import { Skeleton } from '@/components/ui/skeleton';
import { Typography } from '@/components/ui/typography';
import { VibeSelectionList } from '@/components/vibe/vibe-selection-list';
import { HOME_BACKGROUND_GRADIENT } from '@/constants/home';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { mapVibesToListItems, VIBE_OPTIONS } from '@/constants/vibes';
import { useDebounce } from '@/hooks/use-debounce';
import { useIsTablet } from '@/hooks/use-is-tablet';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { useMomentsFeed } from '@/queries/use-moments-feed';
import { usePopularLocalities } from '@/queries/use-popular-localities';
import { useSrpProperties } from '@/queries/use-srp-properties';
import { useVibesList } from '@/queries/use-vibes';
import {
    useAuthStore,
    useSelectedCity,
    useSelectedLocality,
} from '@/stores/auth-store';
import {
    toVibeApiIds,
    useSelectedVibeIds,
    useSelectedVibesStore,
} from '@/stores/selected-vibes-store';
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
      <GradientText variant="text" size="xl" weight="medium" style={styles.sectionHighlight}>
        {highlight}
      </GradientText>
    </View>
  );
}

/** Home screen spacing scale — use these instead of one-off margins. */
const SPACE = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
} as const;

const ITEM_GAP = 12;
const PROPERTY_CAROUSEL_HEIGHT = 488;
const NEIGHBORHOOD_CAROUSEL_HEIGHT = 200;
const FEED_CARD_WIDTH = 172;
const FEED_CARD_HEIGHT = 268;
const FEED_CARD_GAP = 16;
const FEEDBACK_BANNER_HEIGHT = 44;
const FEEDBACK_BANNER_GAP = 12;
const HEADER_SHADOW_THRESHOLD = 8;
const VIBE_FILTER_DEBOUNCE_MS = 400;

export function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const isTablet = useIsTablet();
  const { width, height } = useWindowDimensions();

  const city = useSelectedCity();
  const locality = useSelectedLocality();
  const setSelectedLocality = useAuthStore((state) => state.setSelectedLocality);
  const selectedVibes = useSelectedVibeIds();
  const setSelectedVibes = useSelectedVibesStore((state) => state.setSelectedIds);
  const vibeIds = useMemo(() => toVibeApiIds(selectedVibes), [selectedVibes]);
  const vibeKey = vibeIds.join(',');
  const debouncedVibeKey = useDebounce(vibeKey, VIBE_FILTER_DEBOUNCE_MS);
  const debouncedVibeIds = useMemo(() => {
    if (!debouncedVibeKey) return [] as number[];
    return debouncedVibeKey
      .split(',')
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0);
  }, [debouncedVibeKey]);
  const { data: srpData, isLoading: isLoadingProperties } = useSrpProperties(
    city,
    null,
    debouncedVibeIds,
  );
  const { data: localitiesResponse, isLoading: isLoadingLocalities } =
    usePopularLocalities(city);
  const { data: feedData, isLoading: isLoadingFeed } = useMomentsFeed();
  const { data: apiVibes = [] } = useVibesList();
  const properties = srpData?.listings ?? [];
  const neighborhoods = useMemo(
    () =>
      (localitiesResponse?.data ?? []).map((item) =>
        mapLocalityToNeighborhoodCard(item, properties),
      ),
    [localitiesResponse?.data, properties],
  );
  const feedMoments = (feedData?.moments ?? []).slice(0, 8);
  const vibeOptions = useMemo(
    () => (apiVibes.length > 0 ? mapVibesToListItems(apiVibes) : [...VIBE_OPTIONS]),
    [apiVibes],
  );
  const vibesPending = vibeKey !== debouncedVibeKey;
  const [showFeedback, setShowFeedback] = useState(true);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [feedStoryOpen, setFeedStoryOpen] = useState(false);
  const [feedStoryIndex, setFeedStoryIndex] = useState(0);
  const [citySheetVisible, setCitySheetVisible] = useState(false);
  const scrollBottomPadding = Platform.OS === 'ios' ? tabBarInset - 100  : tabBarInset ;

  const contentWidth = width - SPACE.xl * 2;
  const visibleCards = isTablet ? 2 : 1;
  const cardWidth =
    visibleCards === 2 ? (contentWidth - ITEM_GAP) / 2 : contentWidth;
  const slideWidth = cardWidth + ITEM_GAP;
  const carouselWindowWidth = visibleCards === 2 ? contentWidth : undefined;
  const feedSlideWidth = FEED_CARD_WIDTH + FEED_CARD_GAP;
  const stickyHeaderHeight = insets.top + SPACE.xs + 56 + SPACE.sm;
  const gradientHeight = Math.max(360, height * 0.48);

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

  function openNeighborhood(name: string) {
    setSelectedLocality(name);
    router.push('/srp');
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
            <View style={styles.section}>
              <SectionTitle prefix="Find your " highlight="Neighborhood!" />
              {isLoadingLocalities ? (
                <View style={[styles.carouselWrap, styles.neighborhoodSkeletonRow]}>
                  <Skeleton
                    height={NEIGHBORHOOD_CAROUSEL_HEIGHT}
                    borderRadius={Radius.md}
                    style={{ width: cardWidth }}
                  />
                  {isTablet ? (
                    <Skeleton
                      height={NEIGHBORHOOD_CAROUSEL_HEIGHT}
                      borderRadius={Radius.md}
                      style={{ width: cardWidth }}
                    />
                  ) : null}
                </View>
              ) : neighborhoods.length > 0 ? (
                <HwParallaxCarousel
                  key={`${city}:localities`}
                  data={neighborhoods}
                  width={slideWidth}
                  windowWidth={carouselWindowWidth}
                  height={NEIGHBORHOOD_CAROUSEL_HEIGHT}
                  style={styles.carouselWrap}
                  renderItem={({ item, animationValue }) => (
                    <NeighborhoodLocalityCard
                      item={item}
                      width={cardWidth}
                      height={NEIGHBORHOOD_CAROUSEL_HEIGHT}
                      animationValue={animationValue}
                      onPress={() => openNeighborhood(item.name)}
                    />
                  )}
                />
              ) : (
                <EmptyState
                  compact
                  title={`No localities found in ${city}`}
                  subtitle="Try another city or check back soon."
                />
              )}
            </View>

            <View style={styles.section}>
              <SectionTitle prefix="This could be your " highlight="Home!" />
              {isLoadingProperties || vibesPending ? (
                <HomePropertiesSkeleton />
              ) : properties.length > 0 ? (
                <HwCarousel
                  key={`${city}:${debouncedVibeKey}`}
                  data={properties}
                  width={slideWidth}
                  windowWidth={carouselWindowWidth}
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
            </View>

            {isLoadingFeed || feedMoments.length > 0 ? (
              <View style={styles.section}>
                <SectionTitle prefix="Straight from the " highlight="Feed!" />
                {isLoadingFeed ? (
                  <HomeFeedSkeleton />
                ) : (
                  <HwCarousel
                    data={feedMoments}
                    width={feedSlideWidth}
                    height={FEED_CARD_HEIGHT + 12}
                    style={styles.carouselWrap}
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
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.stickyHeader,
          { paddingTop: insets.top + SPACE.xs },
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
    paddingHorizontal: SPACE.lg,
    paddingBottom: SPACE.sm,
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
    paddingHorizontal: SPACE.lg,
    // Overlaps body sheet (-SPACE.xl) with a small remaining cushion.
    paddingBottom: SPACE.xl + SPACE.sm,
    zIndex: 2,
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
    gap: SPACE.xs / 2,
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
    marginBottom: SPACE.md,
  },
  // Satoshi has no italic face. On Android, fontStyle:'italic' can blank the glyphs.
  heroItalic: Platform.select({
    ios: { fontStyle: 'italic' as const },
    default: {},
  }),
  searchInputMargin: {
    marginBottom: SPACE.sm,
  },
  vibeHintOptional: Platform.select({
    ios: { fontStyle: 'italic' as const },
    default: {},
  }),
  scroll: {
    flex: 1,
    zIndex: 1,
  },
  bodySheet: {
    marginTop: -SPACE.xl,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: palette.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    zIndex: 1,
  },
  body: {
    paddingTop: SPACE.xl,
    paddingHorizontal: SPACE.lg,
    paddingBottom: SPACE.md,
    gap: SPACE.xl,
    flex: 1,
    overflow: 'visible',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  section: {
    gap: SPACE.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHighlight: Platform.select({
    // ios: { fontStyle: 'italic' as const },
    default: {},
  }),
  carouselWrap: {
    marginHorizontal: -4,
  },
  neighborhoodSkeletonRow: {
    flexDirection: 'row',
    gap: ITEM_GAP,
    marginHorizontal: 0,
  },
  feedCard: {
    height: FEED_CARD_HEIGHT,
    borderRadius: Radius.md,
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
    borderRadius: Radius.md,
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
    paddingBottom: SPACE.md,
    paddingTop: 40,
    justifyContent: 'flex-end',
  },
  feedCaption: {
    textAlign: 'center',
  },
  videoBadge: {
    position: 'absolute',
    top: SPACE.sm,
    right: SPACE.sm,
  },
  feedbackBanner: {
    position: 'absolute',
    left: SPACE.md,
    right: SPACE.md,
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
