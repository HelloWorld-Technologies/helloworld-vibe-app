import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import {
  Linking,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HdpScreenSkeleton } from '@/components/skeleton';
import { HdpSimilarPropertiesSection } from '@/components/hdp/hdp-similar-properties-section';
import { HdpDayFromHereSection } from '@/components/hdp/hdp-day-from-here-section';
import { HdpMomentsSection } from '@/components/hdp/hdp-moments-section';
import { HdpAmenityPills } from '@/components/hdp/hdp-amenity-pills';
import { HdpFaqList } from '@/components/hdp/hdp-faq-list';
import { HdpFooterBar } from '@/components/hdp/hdp-footer-bar';
import { HdpVisitSheet } from '@/components/hdp/hdp-visit-sheet';
import { HdpHeroMedia, HDP_HERO_TOTAL_HEIGHT } from '@/components/hdp/hdp-hero-media';
import { HdpPropertyHeader } from '@/components/hdp/hdp-property-header';
import { HdpRatingCard } from '@/components/hdp/hdp-rating-card';
import { HdpReviewsSection } from '@/components/hdp/hdp-reviews-section';
import { HdpSectionNav } from '@/components/hdp/hdp-section-nav';
import { HdpVibeMatchCard } from '@/components/hdp/hdp-vibe-match-card';
import { ScrollRevealHeader } from '@/components/navigation/scroll-reveal-header';
import { Typography } from '@/components/ui/typography';
import {
  HDP_SAMPLE_AMENITIES,
  HDP_SAMPLE_FAQ,
  HDP_DUMMY_REVIEWS,
  type HdpSectionId,
} from '@/constants/hdp';
import palette from '@/constants/palette';
import { useSimilarProperties } from '@/hooks/use-similar-properties';
import { usePropertyDetail } from '@/queries/use-property-detail';
import { usePropertyCategories } from '@/queries/use-property-categories';
import { useWishlist } from '@/providers/wishlist-provider';
import { useSelectedCity } from '@/stores/auth-store';
import { useIsTenant } from '@/stores/tenant-store';
import {
  extractPropertyPhotos,
  extractPropertyVideos,
  momentsToHeroSlides,
} from '@/utils/hdp-media';
import { extractNearByFromDetail, mapNearByToDayCards } from '@/utils/hdp-nearby';
import { extractMomentsFromHdp } from '@/utils/hdp-moments';
import { shareProperty } from '@/utils/share-property';
import { getExploreHomeRoute } from '@/utils/tenant-routing';

const SHEET_OVERLAP = 48;
const FOOTER_HEIGHT = 96;
const HEADER_REVEAL_THRESHOLD = HDP_HERO_TOTAL_HEIGHT - SHEET_OVERLAP;

function formatRent(amount?: number) {
  if (!amount || amount <= 0) return '₹—';
  return `₹${amount.toLocaleString('en-IN')}/mo`;
}

function formatDeposit(months?: number) {
  if (!months || months <= 0) return '1 months rent';
  return `${months} month${months > 1 ? 's' : ''} rent`;
}

function genderLabel(gender?: string) {
  if (!gender) return undefined;
  const value = gender.toLowerCase();
  if (value.includes('female') || value.includes('women')) return 'Female Only';
  if (value.includes('male') || value.includes('men')) return 'Men Only';
  return gender;
}

function buildAmenities(property: Record<string, any> | null) {
  const fromApi = [
    ...(Array.isArray(property?.rent_includes) ? property.rent_includes : []),
    ...(Array.isArray(property?.amenities) ? property.amenities : []),
    ...(Array.isArray(property?.services) ? property.services : []),
  ]
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim());

  return fromApi.length > 0 ? fromApi : [...HDP_SAMPLE_AMENITIES];
}

const HEADER_BAR_HEIGHT = 64;
const TAB_BAR_HEIGHT = 52;
const SECTION_SCROLL_GAP = 8;

function assignSectionRef(
  sectionRefs: MutableRefObject<Partial<Record<HdpSectionId, View | null>>>,
  sectionId: HdpSectionId,
) {
  return (node: View | null) => {
    sectionRefs.current[sectionId] = node;
  };
}

export function HdpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTenant = useIsTenant();
  const { id, name, image, openBook } = useLocalSearchParams<{
    id: string;
    name?: string;
    image?: string;
    openBook?: string;
  }>();

  const propertyId = id ?? '';
  const { data, isLoading, isError } = usePropertyDetail(propertyId);
  const { data: categories = [] } = usePropertyCategories(propertyId);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const selectedCity = useSelectedCity();
  const numericPropertyId = Number(propertyId);
  const [activeSection, setActiveSection] = useState<HdpSectionId>('about');
  const [showFooter, setShowFooter] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [visitSheetOpen, setVisitSheetOpen] = useState(false);
  const [visitSheetTab, setVisitSheetTab] = useState<'schedule' | 'book'>('schedule');
  const [showStickyTabs, setShowStickyTabs] = useState(false);
  const autoOpenedBookRef = useRef(false);
  const scrollY = useSharedValue(0);
  const lastScrollYRef = useRef(0);
  const tabStickScrollYRef = useRef(0);
  const tabAnchorRef = useRef<View>(null);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollContentRef = useRef<View>(null);
  const sectionRefs = useRef<Partial<Record<HdpSectionId, View | null>>>({});
  const stickyTop = insets.top + HEADER_BAR_HEIGHT;

  const updateStickyTabs = useCallback((currentY: number) => {
    setShowStickyTabs(currentY >= tabStickScrollYRef.current);
  }, []);

  const measureTabStickThreshold = useCallback(() => {
    tabAnchorRef.current?.measureInWindow((_x, y) => {
      tabStickScrollYRef.current = Math.max(0, y - stickyTop);
      updateStickyTabs(lastScrollYRef.current);
    });
  }, [stickyTop, updateStickyTabs]);

  const handleSectionChange = useCallback(
    (sectionId: HdpSectionId) => {
      setActiveSection(sectionId);

      const sectionNode = sectionRefs.current[sectionId];
      const contentNode = scrollContentRef.current;
      const scrollNode = scrollRef.current;

      if (!sectionNode || !contentNode || !scrollNode) return;

      sectionNode.measureLayout(
        contentNode,
        (_x, y) => {
          const targetY = Math.max(0, y - stickyTop - TAB_BAR_HEIGHT - SECTION_SCROLL_GAP);
          scrollNode.scrollTo({ y: targetY, animated: true });
        },
        () => {},
      );
    },
    [stickyTop],
  );

  const updateFooterVisibility = useCallback((currentY: number) => {
    const previousY = lastScrollYRef.current;
    const scrollingDown = currentY > previousY;
    const isAtTop = currentY <= 0;

    if (isAtTop) {
      setShowFooter(true);
    } else if (scrollingDown && currentY > 24) {
      setShowFooter(false);
    } else if (!scrollingDown) {
      setShowFooter(true);
    }

    lastScrollYRef.current = currentY;
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentY = event.contentOffset.y;
      scrollY.value = currentY;
      runOnJS(updateFooterVisibility)(currentY);
      runOnJS(updateStickyTabs)(currentY);
    },
  });

  const property = data?.success ? (data.data as Record<string, any>) : null;
  const googleRating = data?.googleData?.google_rating ?? property?.google_rating ?? 4.5;

  useEffect(() => {
    if (autoOpenedBookRef.current) return;
    if (openBook !== '1' && openBook !== 'true') return;
    if (isLoading || !property) return;

    autoOpenedBookRef.current = true;
    setVisitSheetTab('book');
    setVisitSheetOpen(true);
  }, [isLoading, openBook, property]);

  const displayName = property?.display_name ?? property?.name ?? name ?? 'Property';
  const locality =
    property?.address?.locality || property?.locality || property?.city || 'your area';
  const address =
    property?.address?.line2 ||
    property?.address?.line1 ||
    property?.address?.locality ||
    property?.locality ||
    '';
  const description =
    property?.nearby_description?.trim() || property?.description?.trim() || '';

  const moments = useMemo(
    () => extractMomentsFromHdp(data?.moments, property, { fallbackToGallery: false }),
    [data?.moments, property],
  );
  const propertyVideos = useMemo(
    () => extractPropertyVideos(data?.media),
    [data?.media],
  );
  const photos = useMemo(
    () =>
      extractPropertyPhotos(
        data?.media,
        property,
        typeof image === 'string' ? image : undefined,
      ),
    [data?.media, property, image],
  );
  const momentSlides = useMemo(() => momentsToHeroSlides(moments), [moments]);
  const coverImageUri = photos[0]?.imageUri ?? momentSlides[0]?.imageUri;

  const rent = formatRent(
    property?.min_rent ?? property?.starting_rent ?? property?.price ?? property?.rent,
  );
  const startingRent =
    property?.min_rent ?? property?.starting_rent ?? property?.price ?? property?.rent;
  const deposit = formatDeposit(property?.security_deposit_months);
  const minStayMonths =
    property?.lock_in_period ?? property?.minimum_stay ?? property?.min_stay_months ?? 3;
  const roomTypes = useMemo(() => {
    const fromProperty = [
      ...(Array.isArray(property?.room_types) ? property.room_types : []),
      ...(Array.isArray(property?.sharing_types) ? property.sharing_types : []),
    ].filter((item): item is string => typeof item === 'string');

    return fromProperty.length > 0 ? fromProperty : undefined;
  }, [property]);
  const amenities = buildAmenities(property);
  const vibeMatch = property?.vibe_match ?? property?.vibeMatch ?? 92;
  const visitsToday = property?.visits_today ?? property?.visit_count ?? 7;
  const reviewCount = property?.review_count ?? property?.reviews_count ?? 127;
  const mapUrl = typeof property?.map_url === 'string' ? property.map_url : undefined;
  const dayFromHereCards = useMemo(
    () => mapNearByToDayCards(extractNearByFromDetail(data, property)),
    [data, property],
  );

  const propertyCity =
    (typeof property?.city === 'string' && property.city) ||
    selectedCity ||
    'Bangalore';
  const propertyLocality =
    (typeof property?.address === 'object' &&
    property.address &&
    typeof (property.address as { locality?: string }).locality === 'string'
      ? (property.address as { locality?: string }).locality
      : null) ||
    (typeof property?.locality === 'string' ? property.locality : null);

  const { listings: similarListings } = useSimilarProperties({
    propertyId,
    detail: data,
    property,
    city: propertyCity,
    locality: propertyLocality,
  });

  const showError = !isLoading && (isError || (data && !data.success && !property));

  function handleShare() {
    void shareProperty({ name: displayName, id: propertyId });
  }

  function handleFavoritePress() {
    if (!Number.isFinite(numericPropertyId)) return;
    void toggleWishlist(numericPropertyId, displayName);
  }

  function openMaps() {
    if (mapUrl) {
      Linking.openURL(mapUrl).catch(() => undefined);
    }
  }

  return (
    <View style={styles.root}>
      <ScrollRevealHeader
        title={isLoading ? (name ?? 'Property') : showError ? (name ?? 'Property') : displayName}
        scrollY={scrollY}
        threshold={HEADER_REVEAL_THRESHOLD}
        onBack={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace(getExploreHomeRoute(isTenant));
          }
        }}
        onRightPress={handleShare}
        rightIcon="share"
        rightAccessibilityLabel="Share property"
      />

      {isLoading ? (
        <HdpScreenSkeleton />
      ) : showError ? (
        <View style={styles.loader}>
          <Typography variant="text" size="md" color={palette.textSecondary} style={styles.errorText}>
            Unable to load this property right now.
          </Typography>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Typography variant="text" size="sm" weight="medium" color={palette.blue[600]}>
              Go back
            </Typography>
          </Pressable>
        </View>
      ) : (
        <>
          <Animated.ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingBottom: FOOTER_HEIGHT + 32 }}>
            <View ref={scrollContentRef} collapsable={false}>
            <HdpHeroMedia
              propertyVideos={propertyVideos}
              momentSlides={momentSlides}
              photos={photos}
              moments={moments}
              propertyName={displayName}
            />

            <View style={styles.sheet}>
              <HdpPropertyHeader
                name={displayName}
                genderLabel={genderLabel(property?.gender)}
                location={address || locality}
                rentLabel={rent}
                depositLabel={deposit}
                onLocationPress={openMaps}
                isFavorite={Number.isFinite(numericPropertyId) ? isWishlisted(numericPropertyId) : false}
                onFavoritePress={handleFavoritePress}
              />

              <HdpRatingCard
                propertyName={displayName}
                locality={locality}
                rating={Number(googleRating) || 4.8}
                visitsToday={visitsToday}
                reviewCount={reviewCount}
              />

              <HdpVibeMatchCard matchPercent={vibeMatch} propertyName={displayName} />

              <View
                ref={tabAnchorRef}
                style={styles.tabBarBleed}
                onLayout={measureTabStickThreshold}>
                <HdpSectionNav activeId={activeSection} onChange={handleSectionChange} />
              </View>

              <View style={styles.sheetBody}>
              <View
                ref={assignSectionRef(sectionRefs, 'about')}
                collapsable={false}
                style={styles.section}>
                <Typography variant="text" size="xl" weight="bold">
                  About this Place
                </Typography>
                {description ? (
                  <>
                    <Typography variant="text" size="md" color={palette.textPrimary}>
                      {showFullDescription || description.length <= 220
                        ? description
                        : `${description.slice(0, 220)}…`}
                    </Typography>
                    {description.length > 220 ? (
                      <Pressable onPress={() => setShowFullDescription((value) => !value)}>
                        <Typography variant="text" size="sm" weight="medium" color={palette.blue[600]}>
                          {showFullDescription ? 'Show less' : 'Read more'}
                        </Typography>
                      </Pressable>
                    ) : null}
                  </>
                ) : (
                  <Typography variant="text" size="md" color={palette.textSecondary}>
                    Discover a thoughtfully designed coliving space with community, comfort, and convenience.
                  </Typography>
                )}
              </View>

              <View
                ref={assignSectionRef(sectionRefs, 'amenities')}
                collapsable={false}
                style={styles.section}>
                <Typography variant="text" size="xl" weight="bold" style={styles.sectionTitle}>
                  Amenities Included
                </Typography>
                <HdpAmenityPills items={amenities} />
              </View>

              <View ref={assignSectionRef(sectionRefs, 'nearby')} collapsable={false}>
                <HdpDayFromHereSection
                  propertyName={displayName}
                  mapUrl={mapUrl}
                  cards={dayFromHereCards}
                />
              </View>

              <HdpMomentsSection
                propertyName={displayName}
                moments={moments}
                carouselWidth={width - 48}
              />

              <View ref={assignSectionRef(sectionRefs, 'reviews')} collapsable={false}>
                <HdpReviewsSection
                  rating={Number(googleRating) || 4.8}
                  reviewCount={reviewCount}
                  carouselWidth={width - 48}
                  reviews={HDP_DUMMY_REVIEWS}
                />
              </View>

              <HdpSimilarPropertiesSection listings={similarListings} />

              <View style={styles.section}>
                <Typography variant="text" size="xl" weight="bold" style={styles.sectionTitle}>
                  Frequently Asked Questions
                </Typography>
                <HdpFaqList items={HDP_SAMPLE_FAQ} />
              </View>
              </View>
            </View>
            </View>
          </Animated.ScrollView>

          {showStickyTabs ? (
            <View style={[styles.stickyTabBar, { top: stickyTop }]}>
              <HdpSectionNav activeId={activeSection} onChange={handleSectionChange} />
            </View>
          ) : null}

          <HdpFooterBar
            visible={showFooter}
            onScheduleVisit={() => {
              setVisitSheetTab('schedule');
              setVisitSheetOpen(true);
            }}
            onBookNow={() => {
              setVisitSheetTab('book');
              setVisitSheetOpen(true);
            }}
          />
        </>
      )}

      {!isLoading && !showError ? (
        <HdpVisitSheet
            visible={visitSheetOpen}
            onClose={() => setVisitSheetOpen(false)}
            propertyId={propertyId}
            propertyName={displayName}
            property={property}
            propertyLocation={address || locality}
            imageUri={coverImageUri}
            rentLabel={rent}
            depositLabel={deposit}
            startingRent={typeof startingRent === 'number' ? startingRent : undefined}
            minStayMonths={typeof minStayMonths === 'number' ? minStayMonths : 3}
            roomTypes={roomTypes}
            categories={categories}
            initialTab={visitSheetTab}
          />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.gray[50],
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  errorText: {
    textAlign: 'center',
  },
  backLink: {
    padding: 8,
  },
  sheet: {
    marginTop: -SHEET_OVERLAP,
    backgroundColor: palette.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingHorizontal: 24,
    gap: 24,
    overflow: 'hidden',
  },
  tabBarBleed: {
    marginHorizontal: -24,
  },
  stickyTabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 15,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  sheetBody: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
    backgroundColor: palette.gray[50],
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 4,
  },
});
