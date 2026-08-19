import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import {
  InteractionManager,
  Linking,
  Pressable,
  RefreshControl,
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

import { lookupPropertyIdBySlug } from '@/api/property';
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
  HDP_SECTION_NAV,
  type HdpSectionId,
} from '@/constants/hdp';
import palette from '@/constants/palette';
import { useSimilarProperties } from '@/hooks/use-similar-properties';
import { usePropertyDetail } from '@/queries/use-property-detail';
import { usePropertyVisitStats } from '@/queries/use-property-visits';
import { queryKeys } from '@/queries/keys';
import { useVibesList } from '@/queries/use-vibes';
import { useWishlist } from '@/providers/wishlist-provider';
import { useSelectedCity } from '@/stores/auth-store';
import { toVibeApiIds, useSelectedVibeIds } from '@/stores/selected-vibes-store';
import { useIsTenant } from '@/stores/tenant-store';
import { normalizeAmenityKey } from '@/utils/amenity-format';
import {
  extractPropertyPhotos,
  extractPropertyVideos,
  momentsToHeroSlides,
} from '@/utils/hdp-media';
import { extractNearByFromDetail, mapNearByToDayCards } from '@/utils/hdp-nearby';
import { extractHdpFaqs } from '@/utils/hdp-faqs';
import { extractMomentsFromHdp } from '@/utils/hdp-moments';
import {
  formatHdpReviewDate,
  mapGoogleDataToReviewSummary,
  mapGoogleReviewsToResidentReviews,
  mapPropertyVisitReviews,
  mapPropertyVisitStatsToReviewSummary,
} from '@/utils/hdp-reviews';
import { isMapsUrl } from '@/utils/maps';
import { buildPropertyMapUrl } from '@/utils/visit-slots';
import {
  mapPropertyVibesToInterests,
  mapVibeBadgesToSelectedMatches,
  parseVibeMatchScore,
} from '@/utils/map-hdp-vibes';
import { shareProperty } from '@/utils/share-property';
import { clearPendingDeepLink } from '@/utils/pending-deep-link';
import { firstSearchParam } from '@/utils/property-deep-link';
import { getExploreHomeRoute } from '@/utils/tenant-routing';
import { emojiForVibeCode } from '@/constants/vibes';
import { useDebounce } from '@/hooks/use-debounce';

const SHEET_OVERLAP = 48;
const FOOTER_HEIGHT = 96;
const HEADER_REVEAL_THRESHOLD = HDP_HERO_TOTAL_HEIGHT - SHEET_OVERLAP;
const VIBE_FILTER_DEBOUNCE_MS = 400;

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
  return undefined;
}

function buildAmenities(property: Record<string, any> | null) {
  const fromApi = [
    ...(Array.isArray(property?.rent_includes) ? property.rent_includes : []),
    ...(Array.isArray(property?.amenities) ? property.amenities : []),
    ...(Array.isArray(property?.services) ? property.services : []),
  ]
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim());

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const item of fromApi) {
    const key = normalizeAmenityKey(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }

  return unique.length > 0 ? unique : [...HDP_SAMPLE_AMENITIES];
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
  const params = useLocalSearchParams<{
    id?: string | string[];
    name?: string | string[];
    image?: string | string[];
    openBook?: string | string[];
    slug?: string | string[];
  }>();
  const paramId = firstSearchParam(params.id);
  const paramSlug = firstSearchParam(params.slug);
  const name = firstSearchParam(params.name) || undefined;
  const image = firstSearchParam(params.image) || undefined;
  const openBook = firstSearchParam(params.openBook);

  const queryClient = useQueryClient();
  const slugLookup = useQuery({
    queryKey: queryKeys.propertyByName(paramSlug),
    queryFn: () => lookupPropertyIdBySlug(paramSlug),
    enabled: !paramId && Boolean(paramSlug),
    staleTime: 5 * 60_000,
  });

  const propertyId = paramId || (slugLookup.data != null ? String(slugLookup.data) : '');
  const isResolvingId = !paramId && Boolean(paramSlug) && slugLookup.isLoading;
  const slugFailed =
    !paramId &&
    Boolean(paramSlug) &&
    (slugLookup.isError || (slugLookup.isSuccess && slugLookup.data == null));

  useEffect(() => {
    void clearPendingDeepLink();
  }, []);

  const selectedVibes = useSelectedVibeIds();
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
  const { data: apiVibes = [] } = useVibesList();
  const {
    data,
    isLoading: isDetailLoading,
    isError,
    refetch: refetchPropertyDetail,
  } = usePropertyDetail(propertyId, debouncedVibeIds);
  const { data: visitStats, refetch: refetchVisitStats } = usePropertyVisitStats(propertyId);
  const isLoading = isResolvingId || isDetailLoading;
  const { isWishlisted, toggleWishlist } = useWishlist();
  const selectedCity = useSelectedCity();
  const numericPropertyId = Number(propertyId);
  const [activeSection, setActiveSection] = useState<HdpSectionId>('about');
  const [showFooter, setShowFooter] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [visitSheetOpen, setVisitSheetOpen] = useState(false);
  const [visitSheetMounted, setVisitSheetMounted] = useState(false);
  const [visitSheetTab, setVisitSheetTab] = useState<'schedule' | 'book'>('schedule');
  const [showStickyTabs, setShowStickyTabs] = useState(false);
  const [heavyReady, setHeavyReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const autoOpenedBookRef = useRef(false);
  const scrollY = useSharedValue(0);
  const lastScrollYSV = useSharedValue(0);
  const footerVisibleSV = useSharedValue(1);
  const stickyVisibleSV = useSharedValue(0);
  const tabStickYSV = useSharedValue(Number.POSITIVE_INFINITY);
  /** Content offset where the inline section nav reaches the sticky header. Unset until measured. */
  const tabStickScrollYRef = useRef(Number.POSITIVE_INFINITY);
  const tabAnchorRef = useRef<View>(null);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollContentRef = useRef<View>(null);
  const sectionRefs = useRef<Partial<Record<HdpSectionId, View | null>>>({});
  const stickyTop = insets.top + HEADER_BAR_HEIGHT;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchPropertyDetail(),
        paramSlug ? slugLookup.refetch() : Promise.resolve(),
        propertyId
          ? queryClient.invalidateQueries({ queryKey: queryKeys.propertyCategories(propertyId) })
          : Promise.resolve(),
        refetchVisitStats(),
        queryClient.invalidateQueries({ queryKey: ['srp-properties'] }),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [paramSlug, propertyId, queryClient, refetchPropertyDetail, refetchVisitStats, slugLookup]);

  useEffect(() => {
    if (isLoading || !propertyId) {
      setHeavyReady(false);
      return;
    }
    const task = InteractionManager.runAfterInteractions(() => {
      setHeavyReady(true);
    });
    return () => task.cancel();
  }, [isLoading, propertyId]);

  const updateStickyTabs = useCallback((currentY: number) => {
    const threshold = tabStickScrollYRef.current;
    setShowStickyTabs(Number.isFinite(threshold) && currentY >= threshold);
  }, []);

  const measureTabStickThreshold = useCallback(() => {
    const anchor = tabAnchorRef.current;
    const content = scrollContentRef.current;
    if (!anchor || !content) return;

    // Content-relative Y is stable across scroll position (unlike measureInWindow).
    anchor.measureLayout(
      content,
      (_x, y) => {
        const next = Math.max(0, y - stickyTop);
        tabStickScrollYRef.current = next;
        tabStickYSV.value = next;
        updateStickyTabs(lastScrollYSV.value);
      },
      () => {},
    );
  }, [stickyTop, tabStickYSV, lastScrollYSV, updateStickyTabs]);

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

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentY = event.contentOffset.y;
      scrollY.value = currentY;

      const sticky = currentY >= tabStickYSV.value;
      if (sticky !== (stickyVisibleSV.value === 1)) {
        stickyVisibleSV.value = sticky ? 1 : 0;
        runOnJS(setShowStickyTabs)(sticky);
      }

      const scrollingDown = currentY > lastScrollYSV.value;
      let nextFooter = footerVisibleSV.value === 1;
      if (currentY <= 0) {
        nextFooter = true;
      } else if (scrollingDown && currentY > 24) {
        nextFooter = false;
      } else if (!scrollingDown) {
        nextFooter = true;
      }

      if (nextFooter !== (footerVisibleSV.value === 1)) {
        footerVisibleSV.value = nextFooter ? 1 : 0;
        runOnJS(setShowFooter)(nextFooter);
      }

      lastScrollYSV.value = currentY;
    },
  });

  function openVisitSheet(tab: 'schedule' | 'book') {
    setVisitSheetTab(tab);
    setVisitSheetMounted(true);
    setVisitSheetOpen(true);
  }

  const property = data?.success ? (data.data as Record<string, any>) : null;
  const googleData = data?.googleData ?? property?.googleData ?? null;
  const googleReviewSummary = useMemo(
    () => mapGoogleDataToReviewSummary(googleData),
    [googleData],
  );
  const visitReviewSummary = useMemo(
    () => mapPropertyVisitStatsToReviewSummary(visitStats),
    [visitStats],
  );
  const reviewSummary = googleReviewSummary ?? visitReviewSummary;
  const googleResidentReviews = useMemo(
    () => mapGoogleReviewsToResidentReviews(googleData),
    [googleData],
  );
  const visitResidentReviews = useMemo(
    () => mapPropertyVisitReviews(visitStats?.reviews),
    [visitStats?.reviews],
  );
  const residentReviews =
    visitResidentReviews.length > 0 ? visitResidentReviews : googleResidentReviews;
  const hasReviews = reviewSummary != null || residentReviews.length > 0;
  const parsedGoogleRating = Number(googleData?.google_rating ?? property?.google_rating);
  const googleRating =
    reviewSummary?.rating ??
    (Number.isFinite(parsedGoogleRating) ? parsedGoogleRating : 0);

  useEffect(() => {
    if (autoOpenedBookRef.current) return;
    if (openBook !== '1' && openBook !== 'true') return;
    if (isLoading || !property) return;

    autoOpenedBookRef.current = true;
    openVisitSheet('book');
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
  const vibeLabelById = useMemo(() => {
    const map = new Map<number, { label: string; emoji: string }>();
    for (const vibe of apiVibes) {
      map.set(vibe.id, {
        label: vibe.display_name,
        emoji: emojiForVibeCode(vibe.code),
      });
    }
    return map;
  }, [apiVibes]);
  const vibeMatchScore = parseVibeMatchScore(
    data?.vibeMatchScore ?? property?.vibe_match ?? property?.vibeMatch,
  );
  const selectedVibeMatches = useMemo(
    () => mapVibeBadgesToSelectedMatches(data?.vibeBadges, vibeLabelById),
    [data?.vibeBadges, vibeLabelById],
  );
  const residentInterests = useMemo(
    () => mapPropertyVibesToInterests(data?.propertyVibes),
    [data?.propertyVibes],
  );
  const visitsScheduled = visitStats?.totalVisits ?? property?.visits_today ?? property?.visit_count ?? 0;
  const reviewCount =
    visitStats?.totalReviews ??
    reviewSummary?.reviewCount ??
    property?.review_count ??
    property?.reviews_count ??
    0;
  const topChoiceDate = formatHdpReviewDate(visitStats?.topChoiceDate);
  const ratingValue =
    visitStats?.rating ??
    (Number.isFinite(Number(googleRating)) && Number(googleRating) > 0 ? Number(googleRating) : null);
  const dayFromHereCards = useMemo(
    () => mapNearByToDayCards(extractNearByFromDetail(data, property)),
    [data, property],
  );
  const hasNearby = dayFromHereCards.length > 0;
  const faqs = useMemo(() => extractHdpFaqs(data, property), [data, property]);
  const sectionNavItems = useMemo(
    () =>
      HDP_SECTION_NAV.filter((item) => {
        if (item.id === 'nearby') return hasNearby;
        if (item.id === 'reviews') return hasReviews;
        return true;
      }),
    [hasNearby, hasReviews],
  );

  useEffect(() => {
    if (!sectionNavItems.some((item) => item.id === activeSection)) {
      setActiveSection(sectionNavItems[0]?.id ?? 'about');
    }
  }, [activeSection, sectionNavItems]);
  const mapUrl =
    (typeof property?.map_url === 'string' && isMapsUrl(property.map_url)
      ? property.map_url
      : undefined) ||
    buildPropertyMapUrl(property);

  const propertyCity =
    (typeof property?.address === 'object' &&
    property.address &&
    typeof (property.address as { city?: string }).city === 'string'
      ? (property.address as { city?: string }).city
      : null) ||
    (typeof property?.city === 'string' && property.city) ||
    selectedCity ||
    'Bangalore';
  const propertyLocality =
    (typeof property?.locality === 'string' && property.locality) ||
    (typeof property?.address === 'object' &&
    property.address &&
    typeof (property.address as { locality?: string }).locality === 'string'
      ? (property.address as { locality?: string }).locality
      : null);
  const addressLine2 =
    typeof property?.address === 'object' &&
    property.address &&
    typeof (property.address as { line2?: string }).line2 === 'string'
      ? (property.address as { line2?: string }).line2
      : undefined;

  const { listings: similarListings } = useSimilarProperties({
    propertyId,
    detail: data,
    property,
    city: propertyCity,
    locality: propertyLocality,
    limit: 5,
    enabled: heavyReady,
  });

  const showError =
    !isLoading && (slugFailed || isError || (data && !data.success && !property));

  function handleShare() {
    void shareProperty({
      name:
        (typeof property?.name === 'string' && property.name) || displayName,
      displayName,
      id: propertyId,
      city: propertyCity,
      locality: propertyLocality || undefined,
      addressLine2,
    });
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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => void handleRefresh()}
                tintColor={palette.lime[700]}
                colors={[palette.lime[700]]}
              />
            }
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
                rating={ratingValue}
                visitsScheduled={visitsScheduled}
                reviewCount={reviewCount}
                trending={visitStats?.isTrending === true}
                topChoiceDate={topChoiceDate}
              />

              {residentInterests.length > 0 ? (
                <HdpVibeMatchCard
                  matchPercent={vibeMatchScore}
                  propertyName={displayName}
                  selectedVibeCount={selectedVibeMatches.length || selectedVibes.length}
                  vibeMatches={selectedVibeMatches
                    .filter((vibe) => vibe.score > 0)
                    .map((vibe) => ({
                      id: vibe.id,
                      label: vibe.label,
                      emoji: vibe.emoji,
                      percent: vibe.score,
                    }))}
                  propertyVibes={residentInterests}
                />
              ) : null}

              <View
                ref={tabAnchorRef}
                style={styles.tabBarBleed}
                onLayout={measureTabStickThreshold}
                collapsable={false}>
                <View
                  style={showStickyTabs ? styles.tabBarPlaceholder : undefined}
                  pointerEvents={showStickyTabs ? 'none' : 'auto'}>
                  <HdpSectionNav
                    activeId={activeSection}
                    onChange={handleSectionChange}
                    items={sectionNavItems}
                  />
                </View>
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

              {hasNearby ? (
                <View ref={assignSectionRef(sectionRefs, 'nearby')} collapsable={false}>
                  <HdpDayFromHereSection
                    propertyName={displayName}
                    mapUrl={mapUrl}
                    cards={dayFromHereCards}
                  />
                </View>
              ) : null}

              <HdpMomentsSection
                propertyName={displayName}
                moments={heavyReady ? moments : []}
                carouselWidth={width - 48}
              />

              {heavyReady && hasReviews ? (
                <View ref={assignSectionRef(sectionRefs, 'reviews')} collapsable={false}>
                  <HdpReviewsSection
                    summary={reviewSummary}
                    reviews={residentReviews}
                    carouselWidth={width - 48}
                  />
                </View>
              ) : null}

              {heavyReady ? <HdpSimilarPropertiesSection listings={similarListings} /> : null}

              {heavyReady && faqs.length > 0 ? (
              <View style={styles.section}>
                <Typography variant="text" size="xl" weight="bold" style={styles.sectionTitle}>
                  Frequently Asked Questions
                </Typography>
                <HdpFaqList items={faqs} />
              </View>
              ) : null}
              </View>
            </View>
            </View>
          </Animated.ScrollView>

          {showStickyTabs ? (
            <View style={[styles.stickyTabBar, { top: stickyTop }]}>
              <HdpSectionNav
                activeId={activeSection}
                onChange={handleSectionChange}
                items={sectionNavItems}
              />
            </View>
          ) : null}

          <HdpFooterBar
            visible={showFooter}
            onScheduleVisit={() => openVisitSheet('schedule')}
            onBookNow={() => openVisitSheet('book')}
          />
        </>
      )}

      {!isLoading && !showError && visitSheetMounted ? (
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
  tabBarPlaceholder: {
    opacity: 0,
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
