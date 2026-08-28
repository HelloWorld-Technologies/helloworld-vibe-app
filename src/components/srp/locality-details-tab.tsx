import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RequestCallbackSheet } from '@/components/callback/request-callback-sheet';
import { HdpDayFromHereSection } from '@/components/hdp/hdp-day-from-here-section';
import { NeighborhoodLocalityCard } from '@/components/locality/neighborhood-locality-card';
import { Button } from '@/components/ui/button';
import { HwCarousel } from '@/components/ui/carousel';
import { Typography } from '@/components/ui/typography';
import { SrpAmenityIcons } from '@/constants/assets';
import palette from '@/constants/palette';
import { useIsTablet } from '@/hooks/use-is-tablet';
import { usePopularLocalities } from '@/queries/use-popular-localities';
import { useAuthStore } from '@/stores/auth-store';
import type { LocalityInfo } from '@/types/locality';
import { mapLocalityToNeighborhoodCard } from '@/api/localities';
import { mapLocalityNearbyToDayCards } from '@/utils/hdp-nearby';
import { googleMapsSearchUrl } from '@/utils/maps';

/** Matches `srp-screen` sheet horizontal padding. */
const SHEET_PAD = 24;
const LOCALITY_CARD_GAP = 12;
const LOCALITY_CARD_HEIGHT = 180;
const AMENITY_ICON_SIZE = 48;
const AMENITY_ITEM_GAP = 16;
const AMENITY_COLUMNS_PHONE = 3;
const AMENITY_COLUMNS_TABLET = 5;

const AMENITIES = [
  { id: 'cctv', label: 'CCTV Camera', Icon: SrpAmenityIcons.cctv },
  { id: 'biometric', label: 'Biometric Access', Icon: SrpAmenityIcons.biometric },
  { id: 'community-events', label: 'Community Events', Icon: SrpAmenityIcons.communityEvents },
  { id: 'power-backup', label: '24/7 Power Backup', Icon: SrpAmenityIcons.powerBackup },
  { id: 'fully-furnished', label: 'Fully Furnished', Icon: SrpAmenityIcons.fullyFurnished },
] as const;

type CityDetailsTabProps = {
  locality: string | null;
  city: string;
  localityInfo?: LocalityInfo | null;
  onSelectLocality?: (locality: string) => void;
};

export function CityDetailsTab({
  locality,
  city,
  localityInfo,
  onSelectLocality,
}: CityDetailsTabProps) {
  const { width: screenWidth } = useWindowDimensions();
  const isTablet = useIsTablet();
  const setSelectedLocality = useAuthStore((state) => state.setSelectedLocality);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const placeLabel = localityInfo?.display_name?.trim() || locality || city;
  const mapsUrl = googleMapsSearchUrl(`${placeLabel}, ${city}`);
  const aboutTitle = `About ${placeLabel}`;
  const description = localityInfo?.description?.trim() || null;
  const nearbyCards = useMemo(
    () => mapLocalityNearbyToDayCards(localityInfo?.nearby),
    [localityInfo?.nearby],
  );
  const { data: localitiesResponse } = usePopularLocalities(city);
  const popularLocalities = useMemo(() => {
    const current = (localityInfo?.display_name ?? locality ?? '').trim().toLowerCase();
    return (localitiesResponse?.data ?? [])
      .map((item) => mapLocalityToNeighborhoodCard(item))
      .filter((item) => item.name.trim().toLowerCase() !== current);
  }, [localitiesResponse?.data, locality, localityInfo?.display_name]);

  const contentWidth = screenWidth - SHEET_PAD * 2;
  const localityCardWidth = Math.min(260, Math.max(200, contentWidth * 0.72));
  const localitySlideWidth = localityCardWidth + LOCALITY_CARD_GAP;
  const amenityColumns = isTablet ? AMENITY_COLUMNS_TABLET : AMENITY_COLUMNS_PHONE;
  const amenityItemWidth =
    (contentWidth - AMENITY_ITEM_GAP * (amenityColumns - 1)) / amenityColumns;

  function openLocality(name: string) {
    setSelectedLocality(name);
    onSelectLocality?.(name);
  }

  return (
    <View style={styles.container}>
      {nearbyCards.length > 0 ? (
        <HdpDayFromHereSection
          propertyName={placeLabel}
          mapUrl={mapsUrl}
          cards={nearbyCards}
        />
      ) : null}

      <Typography variant="text" size="xl" weight="bold" style={styles.sectionTitle}>
        Included Across Our Homes
      </Typography>
      <View style={styles.amenitiesGrid}>
        {AMENITIES.map(({ id, label, Icon }) => (
          <View key={id} style={[styles.amenityItem, { width: amenityItemWidth }]}>
            <View style={styles.amenityIcon}>
              <Icon
                width={AMENITY_ICON_SIZE}
                height={AMENITY_ICON_SIZE}
                style={styles.amenityIconSvg}
              />
            </View>
            <Typography variant="text" size="xs" weight="medium" style={styles.amenityLabel}>
              {label}
            </Typography>
          </View>
        ))}
      </View>

      <Typography variant="text" size="xl" weight="bold" style={styles.sectionTitle}>
        {aboutTitle}
      </Typography>
      <Typography
        variant="text"
        size="sm"
        color={palette.black}
        numberOfLines={descriptionExpanded ? undefined : 4}>
        {description ||
          `${placeLabel} sits close to daily essentials, transit links, and social spots across ${city}. It is a practical base if you want a balanced coliving experience with easy commutes and a lively neighborhood feel.`}
      </Typography>
      <Pressable
        onPress={() => setDescriptionExpanded((open) => !open)}
        accessibilityRole="button"
        accessibilityLabel={descriptionExpanded ? 'Show less about this locality' : 'Read more about this locality'}
        hitSlop={8}>
        <Typography
          variant="text"
          size="sm"
          weight="medium"
          color={palette.blue[600]}
          style={styles.readMoreLink}>
          {descriptionExpanded ? 'Show less' : 'Read More'}
        </Typography>
      </Pressable>

      {popularLocalities.length > 0 ? (
        <>
          <Typography variant="text" size="xl" weight="bold" style={styles.sectionTitle}>
            Popular {city} Localities
          </Typography>
          <HwCarousel
            data={popularLocalities}
            width={localitySlideWidth}
            windowWidth={contentWidth}
            height={LOCALITY_CARD_HEIGHT}
            style={styles.localityCarousel}
            renderItem={({ item }) => (
              <NeighborhoodLocalityCard
                item={item}
                width={localityCardWidth}
                height={LOCALITY_CARD_HEIGHT}
                onPress={() => openLocality(item.name)}
              />
            )}
          />
        </>
      ) : null}
    </View>
  );
}

export function SrpContactBar({
  propertyName,
  location,
  city,
}: {
  propertyName: string;
  location?: string;
  city?: string;
}) {
  const insets = useSafeAreaInsets();
  const [callbackOpen, setCallbackOpen] = useState(false);

  return (
    <>
      <View style={[styles.contactBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button
          label="Contact Us"
          onPress={() => setCallbackOpen(true)}
          style={styles.contactButton}
        />
      </View>
      <RequestCallbackSheet
        visible={callbackOpen}
        onClose={() => setCallbackOpen(false)}
        propertyName={propertyName}
        location={location ?? propertyName}
        city={city}
        srp
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    marginTop: 8,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AMENITY_ITEM_GAP,
  },
  amenityItem: {
    alignItems: 'center',
    gap: 8,
  },
  amenityIcon: {
    width: AMENITY_ICON_SIZE,
    height: AMENITY_ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  amenityIconSvg: {
    width: AMENITY_ICON_SIZE,
    height: AMENITY_ICON_SIZE,
  },
  amenityLabel: {
    textAlign: 'center',
  },
  readMoreLink: {
    textDecorationLine: 'underline',
  },
  localityCarousel: {
    marginHorizontal: -4,
  },
  contactBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: palette.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.gray[200],
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  contactButton: {
    width: '100%',
  },
});
