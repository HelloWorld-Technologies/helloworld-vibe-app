import { Image } from 'expo-image';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { PropertyVisit } from '@/types/visit';
import { COMING_SOON_IMAGE_URI } from '@/utils/images';
import {
  getDaysUntilLabel,
  getVisitDateParts,
  getVisitDirectionsUrl,
  getVisitId,
  getVisitImages,
  getVisitLocality,
  getVisitManagerName,
  getVisitManagerPhone,
  getVisitPropertyName,
  getVisitStartTime,
  getVisitStatus,
} from '@/utils/visit-format';

type VisitCardAction = {
  label: string;
  variant: 'outline' | 'primary' | 'soft' | 'accent';
  onPress: () => void;
};

type VisitCardProps = {
  visit: PropertyVisit;
  onReschedule?: () => void;
  onGetDirections?: () => void;
  onRateVisit?: () => void;
  onBookNow?: () => void;
  onViewProperty?: () => void;
  onCallManager?: () => void;
};

function StatusBadge({ label, tone }: { label: string; tone: 'upcoming' | 'visited' | 'cancelled' | 'countdown' }) {
  const toneStyles = {
    upcoming: { bg: palette.lime[100], text: palette.lime[800] },
    visited: { bg: palette.gray[100], text: palette.gray[900] },
    cancelled: { bg: palette.red[100], text: palette.red[900] },
    countdown: { bg: palette.lime[800], text: palette.white },
  }[tone];

  return (
    <View style={[styles.badge, { backgroundColor: toneStyles.bg }]}>
      <Typography variant="label" size="xs" weight="medium" color={toneStyles.text}>
        {label}
      </Typography>
    </View>
  );
}

function ActionButton({ action }: { action: VisitCardAction }) {
  const buttonStyles = {
    outline: styles.actionOutline,
    primary: styles.actionPrimary,
    soft: styles.actionSoft,
    accent: styles.actionAccent,
  }[action.variant];

  const labelColors = {
    outline: palette.gray[700],
    primary: palette.white,
    soft: palette.lime[700],
    accent: palette.gray[800],
  }[action.variant];

  return (
    <Pressable
      onPress={action.onPress}
      style={[styles.actionButton, buttonStyles]}
      accessibilityRole="button">
      <Typography variant="text" size="sm" weight="medium" color={labelColors}>
        {action.label}
      </Typography>
      {action.variant === 'primary' ? (
        <HwSymbol name="location.fill" size={12} tintColor={palette.white} />
      ) : null}
    </Pressable>
  );
}

export function VisitCard({
  visit,
  onReschedule,
  onGetDirections,
  onRateVisit,
  onBookNow,
  onViewProperty,
  onCallManager,
}: VisitCardProps) {
  const status = getVisitStatus(visit);
  const images = getVisitImages(visit);
  const imageSources = images.length > 0 ? images.map((uri) => ({ uri })) : [{ uri: COMING_SOON_IMAGE_URI }];
  const [imageIndex, setImageIndex] = useState(0);
  const currentImage = imageSources[imageIndex] ?? imageSources[0];

  const startTime = getVisitStartTime(visit);
  const dateParts = getVisitDateParts(startTime);
  const daysUntil = getDaysUntilLabel(startTime);
  const managerName = getVisitManagerName(visit);
  const managerPhone = getVisitManagerPhone(visit);
  const isUpcoming = status === 'upcoming';
  const dateTone = isUpcoming ? 'upcoming' : 'past';

  const actions: VisitCardAction[] = isUpcoming
    ? [
        { label: 'Reschedule', variant: 'outline', onPress: () => onReschedule?.() },
        {
          label: 'Get Directions',
          variant: 'primary',
          onPress: () => {
            if (onGetDirections) {
              onGetDirections();
              return;
            }
            const url = getVisitDirectionsUrl(visit);
            if (url) void Linking.openURL(url);
          },
        },
      ]
    : status === 'visited'
      ? [
          { label: 'Rate Visit', variant: 'soft', onPress: () => onRateVisit?.() },
          { label: 'Book Now', variant: 'accent', onPress: () => onBookNow?.() },
        ]
      : [
          { label: 'View Property', variant: 'soft', onPress: () => onViewProperty?.() },
          { label: 'Reschedule', variant: 'accent', onPress: () => onReschedule?.() },
        ];

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => onViewProperty?.()}
        style={styles.hero}
        accessibilityRole="button"
        accessibilityLabel={`Open ${getVisitPropertyName(visit)}`}>
        <Image source={currentImage} style={styles.heroImage} contentFit="cover" />

        <View style={styles.heroTopRow} pointerEvents="none">
          {isUpcoming ? (
            <StatusBadge label="Upcoming" tone="upcoming" />
          ) : status === 'visited' ? (
            <StatusBadge label="Visited" tone="visited" />
          ) : (
            <StatusBadge label="Cancelled" tone="cancelled" />
          )}
          {isUpcoming && daysUntil ? <StatusBadge label={daysUntil} tone="countdown" /> : null}
        </View>

        {imageSources.length > 1 ? (
          <>
            <Pressable
              onPress={(event) => {
                event.stopPropagation?.();
                setImageIndex((index) => (index === 0 ? imageSources.length - 1 : index - 1));
              }}
              style={[styles.carouselButton, styles.carouselButtonLeft]}
              accessibilityRole="button"
              accessibilityLabel="Previous photo">
              <HwSymbol name="chevron.left" size={14} weight="semibold" tintColor={palette.white} />
            </Pressable>
            <Pressable
              onPress={(event) => {
                event.stopPropagation?.();
                setImageIndex((index) => (index === imageSources.length - 1 ? 0 : index + 1));
              }}
              style={[styles.carouselButton, styles.carouselButtonRight]}
              accessibilityRole="button"
              accessibilityLabel="Next photo">
              <HwSymbol name="chevron.right" size={14} weight="semibold" tintColor={palette.white} />
            </Pressable>
            <View style={styles.dotsRow} pointerEvents="none">
              {imageSources.map((_, index) => (
                <View
                  key={`${getVisitId(visit)}-dot-${index}`}
                  style={[styles.dot, index === imageIndex ? styles.dotActive : null]}
                />
              ))}
            </View>
          </>
        ) : null}
      </Pressable>

      <View style={styles.body}>
        <View style={styles.copyBlock}>
          <Typography variant="text" size="xl" weight="medium">
            {getVisitPropertyName(visit)}
          </Typography>
          {getVisitLocality(visit) ? (
            <Typography variant="text" size="xs" color={palette.gray[500]}>
              {getVisitLocality(visit)}
            </Typography>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.scheduleRow}>
            <View
              style={[
                styles.dateBlock,
                dateTone === 'upcoming' ? styles.dateBlockUpcoming : styles.dateBlockPast,
              ]}>
              <Typography
                variant="text"
                size="xl"
                weight="bold"
                color={dateTone === 'upcoming' ? palette.blue[900] : palette.gray[900]}>
                {dateParts.day}
              </Typography>
              <Typography
                variant="text"
                size="xs"
                weight="medium"
                color={dateTone === 'upcoming' ? palette.blue[900] : palette.gray[900]}>
                {dateParts.month}
              </Typography>
            </View>
            <View style={styles.scheduleCopy}>
              <Typography variant="text" size="md" weight="medium" color={palette.gray[900]}>
                {dateParts.weekday}
              </Typography>
              <Typography variant="text" size="md" weight="medium" color={palette.gray[900]}>
                {dateParts.timeRange}
              </Typography>
            </View>
          </View>

          {isUpcoming && managerName ? (
            <>
              <View style={styles.divider} />
              <View style={styles.managerRow}>
                <View style={styles.managerCopy}>
                  <Typography variant="text" size="md" weight="medium" color={palette.gray[900]}>
                    {managerName}
                  </Typography>
                  <Typography variant="text" size="sm" color={palette.gray[500]}>
                    Property Manager
                  </Typography>
                </View>
                <Pressable
                  onPress={() => {
                    if (onCallManager) {
                      onCallManager();
                      return;
                    }
                    if (managerPhone) void Linking.openURL(`tel:${managerPhone}`);
                  }}
                  style={styles.callButton}
                  accessibilityRole="button"
                  accessibilityLabel="Call property manager">
                  <HwSymbol name="phone.fill" size={18} tintColor={palette.lime[700]} />
                </Pressable>
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.actionsRow}>
          {actions.map((action) => (
            <ActionButton key={action.label} action={action} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: palette.white,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 23.5,
    elevation: 4,
  },
  hero: {
    height: 228,
    padding: 16,
    justifyContent: 'space-between',
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 1,
  },
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  carouselButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  carouselButtonLeft: {
    left: 16,
  },
  carouselButtonRight: {
    right: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 4,
    zIndex: 1,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: {
    width: 16,
    backgroundColor: palette.white,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 16,
  },
  copyBlock: {
    gap: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.gray[200],
    marginTop: 4,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateBlock: {
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 2,
    alignItems: 'center',
  },
  dateBlockUpcoming: {
    backgroundColor: palette.blue[100],
  },
  dateBlockPast: {
    backgroundColor: palette.gray[200],
  },
  scheduleCopy: {
    gap: 2,
  },
  managerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  managerCopy: {
    flex: 1,
    gap: 2,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.lime[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: Radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  actionOutline: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray[300],
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionPrimary: {
    backgroundColor: palette.lime[600],
    borderWidth: 1,
    borderColor: palette.lime[600],
  },
  actionSoft: {
    backgroundColor: palette.lime[50],
    borderWidth: 1,
    borderColor: palette.lime[50],
  },
  actionAccent: {
    backgroundColor: palette.lime[400],
  },
});
