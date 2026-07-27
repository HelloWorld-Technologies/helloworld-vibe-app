import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  ActivityIndicator,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HwIcon } from '@/components/hw-icon';
import { HdpMomentsStoryViewer } from '@/components/hdp/hdp-moments-story-viewer';
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
import { VIBE_OPTIONS } from '@/constants/vibes';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { useMomentsFeed } from '@/queries/use-moments-feed';
import { useSrpProperties } from '@/queries/use-srp-properties';
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
const FEED_CARD_WIDTH = 160;
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
  const properties = srpData?.listings ?? [];
  const feedMoments = feedData?.moments ?? [];
  const [selectedVibes, setSelectedVibes] = useState<string[]>(
    VIBE_OPTIONS.map((tag) => tag.id),
  );
  const [showFeedback, setShowFeedback] = useState(true);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [feedStoryOpen, setFeedStoryOpen] = useState(false);
  const [feedStoryIndex, setFeedStoryIndex] = useState(0);
  const scrollBottomPadding =
    tabBarInset + (showFeedback ? FEEDBACK_BANNER_HEIGHT + FEEDBACK_BANNER_GAP : 0);

  const cardWidth = width - 48;
  const slideWidth = cardWidth + ITEM_GAP;
  const feedSlideWidth = FEED_CARD_WIDTH + ITEM_GAP;
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
            vibes={VIBE_OPTIONS}
            selectedIds={selectedVibes}
            onChange={setSelectedVibes}
            variant="onDark"
            hint={
              <Typography variant="text" size="xs" color={palette.white}>
                ✨ Pick up to 5 vibes for better matches{' '}
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
                    <SymbolView name="arrow.right" size={12} tintColor={palette.white} />
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
              onAction={() => router.push('/select-city')}
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
                <HwParallaxCarousel
                  data={feedMoments}
                  width={feedSlideWidth}
                  height={220}
                  style={styles.carouselWrap}
                  modeConfig={{
                    parallaxScrollingScale: 0.9,
                    parallaxScrollingOffset: 32,
                    parallaxAdjacentItemScale: 0.82,
                  }}
                  renderItem={({ item, index, animationValue }) => (
                    <Pressable
                      onPress={() => {
                        setFeedStoryIndex(index);
                        setFeedStoryOpen(true);
                      }}
                      style={[styles.feedCard, { width: FEED_CARD_WIDTH }]}>
                      <ParallaxLayer animationValue={animationValue} style={styles.feedImageWrap}>
                        <Image
                          source={{ uri: item.imageUri }}
                          style={styles.feedImage}
                          contentFit="cover"
                        />
                      </ParallaxLayer>
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.6)']}
                        style={styles.feedOverlay}>
                        <Typography variant="text" size="sm" weight="bold" color={palette.white}>
                          {item.label}
                        </Typography>
                      </LinearGradient>
                      <View style={styles.videoBadge}>
                        <SymbolView name="play.fill" size={10} tintColor={palette.white} />
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
            onPress={() => router.push('/select-city')}
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
              <SymbolView
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

      {showFeedback ? (
        <View style={[styles.feedbackBanner, { bottom: tabBarInset + FEEDBACK_BANNER_GAP }]}>
          <Typography variant="text" size="xs" color={palette.textSecondary} style={styles.feedbackText}>
            How was your visit to HW Mahaveer? ›
          </Typography>
          <Pressable
            onPress={() => setShowFeedback(false)}
            accessibilityLabel="Dismiss feedback"
            hitSlop={8}>
            <SymbolView name="xmark" size={14} tintColor={palette.gray[500]} />
          </Pressable>
        </View>
      ) : null}

      <HdpMomentsStoryViewer
        visible={feedStoryOpen}
        moments={feedMoments}
        initialIndex={feedStoryIndex}
        propertyName="HelloWorld"
        onClose={() => setFeedStoryOpen(false)}
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
    elevation: 12,
  },
  body: {
    paddingTop: 32,
    paddingHorizontal: 20,
    gap: 12,
    flex: 1,
    overflow: 'hidden',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  sectionHighlight: {
    fontStyle: 'italic',
  },
  carouselWrap: {
    marginHorizontal: -4,
  },
  propertiesLoader: {
    height: PROPERTY_CAROUSEL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedLoader: {
    height: 220,
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
    width: '110%',
    height: '100%',
    marginLeft: '-5%',
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
    height: 220,
    borderRadius: Radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  feedImageWrap: {
    ...StyleSheet.absoluteFill,
  },
  feedImage: {
    width: '110%',
    height: '100%',
    marginLeft: '-5%',
  },
  feedOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
  },
  videoBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
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
