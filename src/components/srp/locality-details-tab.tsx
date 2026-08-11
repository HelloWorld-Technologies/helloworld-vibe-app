import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RequestCallbackSheet } from '@/components/callback/request-callback-sheet';
import { LocalityCardImage } from '@/components/locality/locality-card-image';
import { Button } from '@/components/ui/button';
import { HwCarousel } from '@/components/ui/carousel';
import { Typography } from '@/components/ui/typography';
import { ImageAssets, SrpAmenityIcons } from '@/constants/assets';
import { NEIGHBORHOODS } from '@/constants/home';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { useIsTablet } from '@/hooks/use-is-tablet';
import { useAuthStore } from '@/stores/auth-store';

/** Matches `srp-screen` sheet horizontal padding. */
const SHEET_PAD = 24;
const LOCALITY_CARD_GAP = 12;
const LOCALITY_CARD_HEIGHT = 180;
const AMENITY_ICON_SIZE = 48;
const AMENITY_ITEM_GAP = 16;
const AMENITY_COLUMNS_PHONE = 3;
const AMENITY_COLUMNS_TABLET = 5;

const DAY_CARDS = [
  {
    id: 'morning',
    title: '☀️ Morning',
    place: 'Blue Tokai Coffee',
    distance: '3 min walk',
    link: 'View Cafes Nearby',
    image: ImageAssets.loginBento1,
  },
  {
    id: 'workout',
    title: '💪 Workout',
    place: 'Cult Fit Indiranagar',
    distance: '5 min walk',
    link: 'View Gyms Nearby',
    image: ImageAssets.loginBento2,
  },
] as const;

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
  onSelectLocality?: (locality: string) => void;
};

export function CityDetailsTab({ locality, city, onSelectLocality }: CityDetailsTabProps) {
  const { width: screenWidth } = useWindowDimensions();
  const isTablet = useIsTablet();
  const setSelectedLocality = useAuthStore((state) => state.setSelectedLocality);
  const placeLabel = locality ?? city;
  const aboutTitle = locality ? `About ${locality}` : `About ${city}`;

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
      <View style={styles.sectionHeader}>
        <Typography variant="text" size="xl" weight="bold">
          A Day from here
        </Typography>
        <Typography variant="text" size="sm" weight="medium" color={palette.helloLime}>
          📍 Show on Maps
        </Typography>
      </View>
      <Typography variant="text" size="sm" color={palette.textSecondary}>
        What living at {placeLabel} actually looks like.
      </Typography>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayRow}>
        {DAY_CARDS.map((card) => (
          <View key={card.id} style={styles.dayCard}>
            <Typography variant="text" size="sm" weight="bold">
              {card.title}
            </Typography>
            <Image source={card.image} style={styles.dayImage} contentFit="cover" />
            <Typography variant="text" size="md" weight="medium">
              {card.place}
            </Typography>
            <Typography variant="text" size="xs" color={palette.textSecondary}>
              {card.distance}
            </Typography>
            <Typography variant="text" size="xs" weight="bold" color={palette.helloLime}>
              {card.link} ›
            </Typography>
          </View>
        ))}
      </ScrollView>

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
      <Typography variant="text" size="sm" color={palette.textSecondary}>
        {placeLabel} sits close to daily essentials, transit links, and social spots across {city}. It
        is a practical base if you want a balanced coliving experience with easy commutes and a lively
        neighborhood feel.
      </Typography>
      <Typography variant="text" size="sm" weight="medium" color={palette.blue[600]}>
        Read More
      </Typography>

      <Typography variant="text" size="xl" weight="bold" style={styles.sectionTitle}>
        Popular {city} Localities
      </Typography>
      <HwCarousel
        data={[...NEIGHBORHOODS]}
        width={localitySlideWidth}
        windowWidth={contentWidth}
        height={LOCALITY_CARD_HEIGHT}
        style={styles.localityCarousel}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openLocality(item.name)}
            style={[styles.localityCard, { width: localityCardWidth }]}
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, starting ${item.price}`}>
            <LocalityCardImage imageKey={item.image} style={styles.localityImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.75)']}
              style={styles.localityOverlay}>
              <Typography variant="text" size="md" weight="bold" color={palette.white}>
                {item.name}
              </Typography>
              <Typography variant="text" size="xs" color={palette.gray[200]}>
                Starting {item.price} | {item.properties} Properties
              </Typography>
            </LinearGradient>
          </Pressable>
        )}
      />
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    marginTop: 8,
  },
  dayRow: {
    gap: 12,
    paddingVertical: 4,
  },
  dayCard: {
    width: 220,
    borderWidth: 1,
    borderColor: palette.blue[300],
    borderRadius: Radius.md,
    padding: 12,
    gap: 8,
    backgroundColor: palette.white,
  },
  dayImage: {
    width: '100%',
    height: 88,
    borderRadius: Radius.sm,
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
  localityCarousel: {
    marginHorizontal: -4,
  },
  localityCard: {
    height: LOCALITY_CARD_HEIGHT,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: palette.gray[200],
  },
  localityImage: {
    width: '100%',
    height: '100%',
  },
  localityOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    gap: 4,
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
