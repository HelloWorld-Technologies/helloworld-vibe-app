import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScrollRevealHeader } from '@/components/navigation/scroll-reveal-header';
import { PropertyCard } from '@/components/property/property-card';
import { SrpListSkeleton } from '@/components/skeleton';
import { CityDetailsTab, SrpContactBar } from '@/components/srp/locality-details-tab';
import { LocalityRatingsGrid } from '@/components/srp/locality-ratings-grid';
import { SrpFiltersSheet } from '@/components/srp/srp-filters-sheet';
import {
  SrpFilterSortBar,
  SrpSortSheet,
  type SortOption,
} from '@/components/srp/srp-filter-sort-bar';
import { SrpTabToggle, type SrpTab } from '@/components/srp/srp-tab-toggle';
import { Typography } from '@/components/ui/typography';
import { VibeSelectionList } from '@/components/vibe/vibe-selection-list';
import { ImageAssets } from '@/constants/assets';
import palette from '@/constants/palette';
import { mapVibesToListItems, VIBE_OPTIONS } from '@/constants/vibes';
import { useDebounce } from '@/hooks/use-debounce';
import { useIsTablet } from '@/hooks/use-is-tablet';
import { usePropertyList } from '@/queries/use-property-list';
import { useVibesList } from '@/queries/use-vibes';
import { useSrpFiltersStore } from '@/stores/srp-filters-store';
import { useSelectedCity, useSelectedLocality } from '@/stores/auth-store';
import {
  toVibeApiIds,
  useSelectedVibeIds,
  useSelectedVibesStore,
} from '@/stores/selected-vibes-store';
import { useIsTenant } from '@/stores/tenant-store';
import { countActiveSrpFilters } from '@/utils/build-srp-api-payload';
import { getExploreHomeRoute } from '@/utils/tenant-routing';

const HERO_HEIGHT = 398;
const SHEET_OVERLAP = 45;
const BOTTOM_BAR_HEIGHT = 84;
const HEADER_REVEAL_THRESHOLD = HERO_HEIGHT - SHEET_OVERLAP + 16;
const SHEET_PADDING_H = 24;
const PROPERTY_GAP = 16;
/** Distance from bottom of scroll content that triggers the next page fetch. */
const INFINITE_SCROLL_THRESHOLD = 480;
const VIBE_FILTER_DEBOUNCE_MS = 400;

export function SrpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isTenant = useIsTenant();
  const isTablet = useIsTablet();
  const { width } = useWindowDimensions();
  const city = useSelectedCity();
  const locality = useSelectedLocality();
  const isCityOnly = !locality;

  const contentWidth = width - SHEET_PADDING_H * 2;
  const cardWidth = isTablet ? (contentWidth - PROPERTY_GAP) / 2 : contentWidth;

  const [activeTab, setActiveTab] = useState<SrpTab>('properties');
  const selectedVibes = useSelectedVibeIds();
  const setSelectedVibes = useSelectedVibesStore((state) => state.setSelectedIds);
  const clearSelectedVibes = useSelectedVibesStore((state) => state.clearSelectedIds);
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
  const vibesPending = vibeKey !== debouncedVibeKey;
  const [sort, setSort] = useState<SortOption>('popularity');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [failedHeroUri, setFailedHeroUri] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useSharedValue(0);
  const filters = useSrpFiltersStore((state) => state.filters);
  const setFilters = useSrpFiltersStore((state) => state.setFilters);
  const activeFilterCount = countActiveSrpFilters(filters);
  const { data: apiVibes = [] } = useVibesList();
  const vibeOptions = useMemo(
    () => (apiVibes.length > 0 ? mapVibesToListItems(apiVibes) : [...VIBE_OPTIONS]),
    [apiVibes],
  );

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = usePropertyList(city, locality ?? '', filters, sort, debouncedVibeIds);

  const loadMore = useCallback(() => {
    if (activeTab !== 'properties') return;
    if (!hasNextPage || isFetchingNextPage || refreshing) return;
    void fetchNextPage();
  }, [activeTab, fetchNextPage, hasNextPage, isFetchingNextPage, refreshing]);

  const showListSkeleton = isLoading || vibesPending;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={() => void handleRefresh()}
        tintColor={palette.lime[700]}
        colors={[palette.lime[700]]}
        {...(Platform.OS === 'android'
          ? { progressViewOffset: insets.top + 56 }
          : null)}
      />
    ),
    [handleRefresh, insets.top, refreshing],
  );

  const firstPage = data?.pages[0];
  const localityInfo = firstPage?.localityInfo ?? null;
  const properties = useMemo(
    () => data?.pages.flatMap((page) => page.listings) ?? [],
    [data],
  );
  const nearByProperties = isCityOnly ? [] : (firstPage?.nearByListings ?? []);
  const totalCount = firstPage?.pageInfo?.total ?? properties.length;
  const localityRent = localityInfo?.starting_rent;
  const minRent = properties.reduce(
    (min, property) => (property.startingRent > 0 ? Math.min(min, property.startingRent) : min),
    Number.POSITIVE_INFINITY,
  );
  const startingPriceValue =
    typeof localityRent === 'number' && localityRent > 0
      ? localityRent
      : Number.isFinite(minRent) && minRent > 0
        ? minRent
        : null;
  const startingPrice =
    startingPriceValue != null
      ? `₹${startingPriceValue.toLocaleString('en-IN')}`
      : '₹9,000';

  const localityLabel = localityInfo?.display_name?.trim() || locality;
  const title = isCityOnly ? city : `${localityLabel}, ${city}`;
  const headerTitle = localityLabel ?? city;
  const coverImage = localityInfo?.cover_image?.trim() || null;
  const listHeading = isCityOnly
    ? `${totalCount} Coliving PGs in ${city}`
    : `${totalCount} Coliving PGs Near ${title}`;

  const scrollBottomPadding =
    activeTab === 'properties' ? BOTTOM_BAR_HEIGHT + insets.bottom : 120 + insets.bottom;

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      scrollY.value = contentOffset.y;

      const distanceFromEnd =
        contentSize.height - layoutMeasurement.height - contentOffset.y;
      if (distanceFromEnd < INFINITE_SCROLL_THRESHOLD) {
        loadMore();
      }
    },
    [loadMore, scrollY],
  );

  function handlePressFilters() {
    setFiltersOpen(true);
  }

  return (
    <View style={styles.root}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces
        alwaysBounceVertical
        nestedScrollEnabled
        refreshControl={refreshControl}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: scrollBottomPadding }}>
        <View style={[styles.hero, { height: HERO_HEIGHT }]}>
          <Image
            source={
              coverImage && failedHeroUri !== coverImage
                ? { uri: coverImage }
                : ImageAssets.loginBento1
            }
            style={styles.heroImage}
            contentFit="cover"
            onError={() => {
              if (coverImage) setFailedHeroUri(coverImage);
            }}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.59)', 'rgba(255,255,255,0)']}
            locations={[0.08, 0.41]}
            style={styles.heroGradient}
          />
        </View>

        <View style={[styles.sheet, { marginTop: -SHEET_OVERLAP }]}>
          <View style={styles.sheetSection}>
            <Typography variant="text" size="xl" weight="bold" style={styles.localityTitle}>
              {title}
            </Typography>
            <Typography variant="text" size="sm" weight="medium" color={palette.gray[900]}>
              Starting {startingPrice} | {totalCount} Properties
            </Typography>
            <LocalityRatingsGrid ratings={localityInfo?.ratings} />
          </View>

          <SrpTabToggle
            value={activeTab}
            onChange={setActiveTab}
            hasLocality={!isCityOnly}
          />

          {activeTab === 'properties' ? (
            <View key={`${city}-${locality ?? ''}`} style={styles.tabContent}>
              <Typography variant="text" size="xl" weight="bold">
                {listHeading}
              </Typography>

              <VibeSelectionList
                vibes={vibeOptions}
                selectedIds={selectedVibes}
                onChange={setSelectedVibes}
                variant="onLight"
                hint="Pick your interests, We'll match you with the right home!"
              />

              <Pressable
                onPress={clearSelectedVibes}
                accessibilityRole="button">
                <Typography
                  variant="text"
                  size="xs"
                  weight="bold"
                  color={palette.blue[600]}
                  style={styles.clearAll}>
                  Clear All
                </Typography>
              </Pressable>

              {showListSkeleton ? (
                <SrpListSkeleton />
              ) : (
                <>
                  <View style={[styles.propertyList, isTablet ? styles.propertyListTablet : null]}>
                    {properties.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        style={isTablet ? { width: cardWidth } : undefined}
                        onPress={() =>
                          router.push({
                            pathname: '/hdp',
                            params: {
                              id: property.id,
                              name: property.name,
                              image:
                                typeof property.images[0] === 'object' &&
                                property.images[0] &&
                                'uri' in property.images[0]
                                  ? property.images[0].uri
                                  : undefined,
                            },
                          })
                        }
                      />
                    ))}
                  </View>

                  {nearByProperties.length > 0 ? (
                    <View style={styles.nearbySection}>
                      <Typography variant="text" size="xl" weight="bold">
                        Nearby Properties
                      </Typography>
                      <Typography variant="text" size="sm" color={palette.textSecondary}>
                        Properties near {locality}
                      </Typography>
                      <View
                        style={[styles.propertyList, isTablet ? styles.propertyListTablet : null]}>
                        {nearByProperties.map((property) => (
                          <PropertyCard
                            key={`nearby-${property.id}`}
                            property={property}
                            style={isTablet ? { width: cardWidth } : undefined}
                            onPress={() =>
                              router.push({
                                pathname: '/hdp',
                                params: {
                                  id: property.id,
                                  name: property.name,
                                  image:
                                    typeof property.images[0] === 'object' &&
                                    property.images[0] &&
                                    'uri' in property.images[0]
                                      ? property.images[0].uri
                                      : undefined,
                                },
                              })
                            }
                          />
                        ))}
                      </View>
                    </View>
                  ) : null}

                  {isFetchingNextPage ? (
                    <View style={styles.pageFooter}>
                      <ActivityIndicator color={palette.lime[700]} />
                    </View>
                  ) : null}
                </>
              )}
            </View>
          ) : (
            <CityDetailsTab
              locality={locality}
              city={city}
              localityInfo={localityInfo}
              onSelectLocality={() => setActiveTab('properties')}
            />
          )}
        </View>
      </Animated.ScrollView>

      <ScrollRevealHeader
        title={headerTitle}
        scrollY={scrollY}
        threshold={HEADER_REVEAL_THRESHOLD}
        onBack={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace(getExploreHomeRoute(isTenant));
          }
        }}
        inlineSearch={{
          value: locality ?? '',
          placeholder: 'Search locality or property',
          onPress: () => router.push('/search'),
        }}
      />

      {activeTab === 'properties' ? (
        <SrpFilterSortBar
          sort={sort}
          activeFilterCount={activeFilterCount}
          onPressFilters={handlePressFilters}
          onPressSort={() => setSortOpen(true)}
        />
      ) : (
        <SrpContactBar
          propertyName={localityLabel ?? city}
          location={title}
          city={city}
        />
      )}

      <SrpSortSheet
        visible={sortOpen}
        sort={sort}
        onClose={() => setSortOpen(false)}
        onSelect={setSort}
      />

      <SrpFiltersSheet
        visible={filtersOpen}
        filters={filters}
        onClose={() => setFiltersOpen(false)}
        onApply={setFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.white,
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    backgroundColor: palette.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 32,
  },
  sheetSection: {
    gap: 16,
  },
  localityTitle: {
    textTransform: 'capitalize',
  },
  tabContent: {
    gap: 16,
  },
  clearAll: {
    alignSelf: 'flex-end',
    marginTop: -8,
  },
  propertyList: {
    gap: 16,
  },
  propertyListTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: PROPERTY_GAP,
  },
  nearbySection: {
    gap: 8,
    marginTop: 8,
  },
  pageFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
});
