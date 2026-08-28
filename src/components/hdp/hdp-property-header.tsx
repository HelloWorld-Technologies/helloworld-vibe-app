import { Pressable, StyleSheet, View } from 'react-native';

import { WishlistHeartButton } from '@/components/wishlist/wishlist-heart-button';
import { Typography } from '@/components/ui/typography';
import { HdpIcons } from '@/constants/assets';
import palette from '@/constants/palette';

const MapPinIcon = HdpIcons.mapPin;

type HdpPropertyHeaderProps = {
  name: string;
  genderLabel?: string;
  location: string;
  rentLabel: string;
  depositLabel: string;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
  onLocationPress?: () => void;
};

const LOCATION_UNDERLINE_DOT_SIZE = 2;
const LOCATION_UNDERLINE_DOT_COUNT = 48;

function LocationDottedUnderline({ color }: { color: string }) {
  return (
    <View style={styles.locationUnderline}>
      {Array.from({ length: LOCATION_UNDERLINE_DOT_COUNT }, (_, index) => (
        <View
          key={index}
          style={[styles.locationUnderlineDot, { backgroundColor: color }]}
        />
      ))}
    </View>
  );
}

export function HdpPropertyHeader({
  name,
  genderLabel,
  location,
  rentLabel,
  depositLabel,
  isFavorite = false,
  onFavoritePress,
  onLocationPress,
}: HdpPropertyHeaderProps) {
  return (
    <View style={styles.root}>
      <View style={styles.titleRow}>
        <Typography variant="text" size="xl" weight="bold" style={styles.name}>
          {name}
        </Typography>
        <WishlistHeartButton
          isFavorite={isFavorite}
          inactiveColor={palette.lime[600]}
          activeColor={palette.red[500]}
          onPress={onFavoritePress}
        />
      </View>

      {genderLabel ? (
        <View style={styles.badge}>
          <Typography variant="text" size="xs" weight="medium" color={palette.red[600]}>
            {genderLabel}
          </Typography>
        </View>
      ) : null}

      <Pressable
        onPress={onLocationPress}
        style={styles.locationPressable}
        accessibilityRole="button">
        <View style={styles.locationContent}>
          <View style={styles.locationRow}>
            <MapPinIcon width={13} height={14} />
            <Typography variant="text" size="xs" weight="medium" color={palette.lime[600]} style={styles.location}>
              {location}
            </Typography>
          </View>
          <LocationDottedUnderline color={palette.lime[600]} />
        </View>
      </Pressable>

      <View style={styles.pricingRow}>
        <View style={styles.pricingCol}>
          <Typography variant="text" size="sm" color={palette.gray[500]}>
            Rent Starting From
          </Typography>
          <Typography variant="text" size="xl" weight="bold" color={palette.lime[700]}>
            {rentLabel}
          </Typography>
        </View>

        <View style={styles.divider} />

        <View style={styles.pricingCol}>
          <Typography variant="text" size="sm" color={palette.gray[500]}>
            Security Deposit
          </Typography>
          <Typography variant="text" size="xl" weight="bold" color={palette.gray[900]}>
            {depositLabel}
          </Typography>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  name: {
    flex: 1,
    textTransform: 'capitalize',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FECDCA',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  locationPressable: {
    alignSelf: 'flex-start',
  },
  locationContent: {
    alignSelf: 'flex-start',
    gap: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    flexShrink: 1,
  },
  locationUnderline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  locationUnderlineDot: {
    width: LOCATION_UNDERLINE_DOT_SIZE,
    height: LOCATION_UNDERLINE_DOT_SIZE,
    borderRadius: LOCATION_UNDERLINE_DOT_SIZE / 2,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  pricingCol: {
    flex: 1,
    gap: 4,
  },
  divider: {
    width: 1,
    height: 54,
    backgroundColor: palette.gray[200],
    marginHorizontal: 16,
  },
});
