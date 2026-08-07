import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScrollRevealHeader } from '@/components/navigation/scroll-reveal-header';
import { PropertyCard } from '@/components/property/property-card';
import { SrpListSkeleton } from '@/components/skeleton';
import { CityDetailsTab, SrpContactBar } from '@/components/srp/locality-details-tab';
import { LocalityRatingsGrid } from '@/components/srp/locality-ratings-grid';
import { SrpFiltersSheet } from '@/components/srp/srp-filters-sheet';
import {
  nextSortOption,
  SrpFilterSortBar,
  type SortOption,
} from '@/components/srp/srp-filter-sort-bar';
import { SrpTabToggle, type SrpTab } from '@/components/srp/srp-tab-toggle';
import { Typography } from '@/components/ui/typography';
import { VibeSelectionList } from '@/components/vibe/vibe-selection-list';
import { ImageAssets } from '@/constants/assets';
import palette from '@/constants/palette';
import { mapVibesToListItems, VIBE_OPTIONS } from '@/constants/vibes';
import { usePropertyList } from '@/queries/use-property-list';
import { useVibesList } from '@/queries/use-vibes';
import { useSrpFiltersStore } from '@/stores/srp-filters-store';
import { useSelectedCity, useSelectedLocality } from '@/stores/auth-store';
import { useIsTenant } from '@/stores/tenant-store';
import { countActiveSrpFilters } from '@/utils/build-srp-api-payload';
import { getExploreHomeRoute } from '@/utils/tenant-routing';

const HERO_HEIGHT = 398;
const SHEET_OVERLAP = 45;
const BOTTOM_BAR_HEIGHT = 84;
const HEADER_REVEAL_THRESHOLD = HERO_HEIGHT - SHEET_OVERLAP + 16;

export function SrpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isTenant = useIsTenant();
  const city = useSelectedCity();
  const locality = useSelectedLocality();
  const isCityOnly = !locality;

  const [activeTab, setActiveTab] = useState<SrpTab>('properties');
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [didInitVibes, setDidInitVibes] = useState(false);
  const [sort, setSort] = useState<SortOption>('distance');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const scrollY = useSharedValue(0);
  const filters = useSrpFiltersStore((state) => state.filters);
  const setFilters = useSrpFiltersStore((state) => state.setFilters);
  const activeFilterCount = countActiveSrpFilters(filters);
  const { data: apiVibes = [], isLoading: isLoadingVibes } = useVibesList();
  const vibeOptions = useMemo(
    () => (apiVibes.length > 0 ? mapVibesToListItems(apiVibes) : [...VIBE_OPTIONS]),
    [apiVibes],
  );

  useEffect(() => {
    if (didInitVibes || isLoadingVibes) return;
    setSelectedVibes(vibeOptions.map((vibe) => vibe.id));
    setDidInitVibes(true);
  }, [didInitVibes, isLoadingVibes, vibeOptions]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = usePropertyList(
    city,
    locality ?? '',
    filters,
    sort,
  );

  const firstPage = data?.pages[0];
  const properties = useMemo(
    () => data?.pages.flatMap((page) => page.listings) ?? [],
    [data],
  );
  const nearByProperties = isCityOnly ? [] : (firstPage?.nearByListings ?? []);
  const totalCount = firstPage?.pageInfo?.total ?? properties.length;
  const minRent = properties.reduce(
    (min, property) => (property.startingRent > 0 ? Math.min(min, property.startingRent) : min),
    Number.POSITIVE_INFINITY,
  );
  const startingPrice =
    Number.isFinite(minRent) && minRent > 0
      ? `₹${minRent.toLocaleString('en-IN')}`
      : '₹9,000';

  const title = isCityOnly ? city : `${locality}, ${city}`;
  const headerTitle = locality ?? city;
  const listHeading = isCityOnly
    ? `${totalCount} Coliving PGs in ${city}`
    : `${totalCount} Coliving PGs Near ${title}`;

  const scrollBottomPadding =
    activeTab === 'properties' ? BOTTOM_BAR_HEIGHT + insets.bottom : 120 + insets.bottom;

  function handlePressFilters() {
    setFiltersOpen(true);
  }

  return (
    <View style={styles.root}>
      <Animated.ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: scrollBottomPadding }}>
        <View style={[styles.hero, { height: HERO_HEIGHT }]}>
          <Image source={ImageAssets.loginBento1} style={styles.heroImage} contentFit="cover" />
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
            <LocalityRatingsGrid />
          </View>

          <SrpTabToggle value={activeTab} onChange={setActiveTab} />

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
                onPress={() => setSelectedVibes(vibeOptions.map((vibe) => vibe.id))}
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

              {isLoading ? <SrpListSkeleton /> : null}

              <View style={styles.propertyList}>
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
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
                  <View style={styles.propertyList}>
                    {nearByProperties.map((property) => (
                      <PropertyCard
                        key={`nearby-${property.id}`}
                        property={property}
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

              {hasNextPage ? (
                <Pressable
                  onPress={() => fetchNextPage()}
                  style={styles.loadMore}
                  disabled={isFetchingNextPage}>
                  <Typography variant="text" size="sm" weight="medium" color={palette.blue[600]}>
                    {isFetchingNextPage ? 'Loading…' : 'Load more properties'}
                  </Typography>
                </Pressable>
              ) : null}
            </View>
          ) : (
            <CityDetailsTab locality={locality} city={city} />
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
          onPressSort={() => setSort((current) => nextSortOption(current))}
        />
      ) : (
        <SrpContactBar />
      )}

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
  nearbySection: {
    gap: 8,
    marginTop: 8,
  },
  loadMore: {
    alignItems: 'center',
    paddingVertical: 12,
  },
});
