import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ProfileStackScreen } from '@/components/profile/profile-stack-screen';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { useBookingStatus } from '@/queries/use-booking-status';
import { usePropertyDetail } from '@/queries/use-property-detail';
import { useTenantProfile } from '@/stores/tenant-store';
import type { RentalAgreementItem } from '@/types/booking-status';
import {
  formatAgreementDateRange,
  formatBookingDate,
  getPropertyLocality,
  getRentalAgreements,
  getResidenceStatus,
  getRoomLabel,
} from '@/utils/booking-details-format';
import { COMING_SOON_IMAGE_URI, formatPropertyImageUrl, getPropertyImageKeys } from '@/utils/images';
import { priceFormatter } from '@/utils/tenant-format';

function SectionTitle({ children }: { children: string }) {
  return (
    <Typography variant="text" size="lg" weight="medium" color={palette.black}>
      {children}
    </Typography>
  );
}

function CardDivider() {
  return <View style={styles.divider} />;
}

function DetailRow({
  label,
  value,
  alignRight = false,
}: {
  label: string;
  value: string;
  alignRight?: boolean;
}) {
  return (
    <View style={[styles.detailRow, alignRight && styles.detailRowRight]}>
      <Typography variant="text" size="xs" weight="medium" color={palette.gray[500]}>
        {label}
      </Typography>
      <Typography variant="text" size="sm" weight="medium" color={palette.gray[800]}>
        {value}
      </Typography>
    </View>
  );
}

function BookingOverviewCard({
  roomLabel,
  moveInDate,
  monthlyRent,
  securityDeposit,
}: {
  roomLabel: string;
  moveInDate: string;
  monthlyRent: string;
  securityDeposit: string;
}) {
  return (
    <View style={styles.card}>
      <DetailRow label="Room" value={roomLabel} />
      <CardDivider />
      <DetailRow label="Move-in Date" value={moveInDate} />
      <CardDivider />
      <View style={styles.rentRow}>
        <DetailRow label="Monthly Rent" value={monthlyRent} />
        <DetailRow label="Security Deposit" value={securityDeposit} alignRight />
      </View>
    </View>
  );
}

function RentalAgreementCard({
  agreement,
  onDownload,
}: {
  agreement: RentalAgreementItem;
  onDownload: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.agreementRow}>
        <View style={styles.agreementCopy}>
          <Typography variant="text" size="xs" weight="medium" color={palette.gray[500]}>
            {agreement.label}
          </Typography>
          <Typography variant="text" size="sm" weight="medium" color={palette.gray[800]}>
            {agreement.dateRange}
          </Typography>
        </View>

        {agreement.downloadUrl ? (
          <Pressable
            onPress={onDownload}
            style={styles.downloadAction}
            accessibilityRole="button"
            accessibilityLabel={`Download ${agreement.label}`}>
            <SymbolView name="arrow.down.circle" size={12} tintColor={palette.lime[700]} />
            <Typography variant="text" size="sm" weight="medium" color={palette.lime[700]}>
              Download
            </Typography>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function BookingDetailsScreen() {
  const profile = useTenantProfile();
  const property = profile?.propertyInfo;
  const payment = profile?.paymentInfo;
  const propertyId = property?.propertyId ?? '';
  const { data: propertyDetail } = usePropertyDetail(propertyId);
  const { data: bookingStatus } = useBookingStatus();

  const imageKeys = getPropertyImageKeys(propertyDetail?.data);
  const imageUri = imageKeys[0]
    ? formatPropertyImageUrl(imageKeys[0], 'hdp')
    : COMING_SOON_IMAGE_URI;

  const locality = getPropertyLocality(profile, propertyDetail?.data);
  const residenceStatus = getResidenceStatus(profile, bookingStatus);
  const roomLabel = getRoomLabel(profile);
  const moveInDate = formatBookingDate(property?.moveInDate);
  const monthlyRent =
    payment?.rent != null ? priceFormatter(payment.rent) : '—';
  const securityDeposit =
    payment?.sd != null ? priceFormatter(payment.sd) : '—';
  const agreements = getRentalAgreements(profile);
  const documents = profile?.documents as Record<string, unknown> | undefined;
  const hasSignedDocument =
    documents?.isDocumentSigned === true ||
    documents?.is_document_signed === true ||
    bookingStatus?.signed_document === true;

  function handleDownload(url?: string) {
    if (!url) return;
    void Linking.openURL(url);
  }

  return (
    <ProfileStackScreen title="Booking Details">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.propertySummary}>
          <Image source={{ uri: imageUri }} style={styles.thumbnail} contentFit="cover" />
          <View style={styles.propertyCopy}>
            <Typography variant="text" size="lg" weight="medium" color="#0A0E14">
              {property?.name ?? 'Your Property'}
            </Typography>
            {locality ? (
              <Typography variant="text" size="xs" weight="medium" color={palette.gray[700]}>
                {locality}
              </Typography>
            ) : null}
            <View style={styles.statusBadge}>
              <Typography variant="label" size="xs" weight="medium" color={palette.lime[800]}>
                {residenceStatus.label}
              </Typography>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle>Booking Overview</SectionTitle>
          <BookingOverviewCard
            roomLabel={roomLabel}
            moveInDate={moveInDate}
            monthlyRent={monthlyRent}
            securityDeposit={securityDeposit}
          />
        </View>

        <View style={styles.section}>
          <SectionTitle>Rental Agreements</SectionTitle>
          {agreements.length > 0 ? (
            agreements.map((agreement) => (
              <RentalAgreementCard
                key={agreement.id}
                agreement={agreement}
                onDownload={() => handleDownload(agreement.downloadUrl)}
              />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Typography variant="text" size="sm" color={palette.gray[500]} style={styles.emptyText}>
                {hasSignedDocument
                  ? `Your rental agreement will appear here once it is available for download.${property?.moveInDate ? ` Current stay: ${formatAgreementDateRange(property.moveInDate, property.moveOutDate)}.` : ''}`
                  : 'Your rental agreement will be shared over your registered email once onboarding is completed.'}
              </Typography>
            </View>
          )}
        </View>
      </ScrollView>
    </ProfileStackScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: 32,
    paddingBottom: 32,
  },
  propertySummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  thumbnail: {
    width: 96,
    height: 78,
    borderRadius: 5,
    backgroundColor: palette.gray[100],
  },
  propertyCopy: {
    flex: 1,
    gap: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: palette.lime[50],
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  section: {
    gap: 16,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: '#8690A3',
    shadowOffset: { width: 0, height: 1.3 },
    shadowOpacity: 0.2,
    shadowRadius: 10.2,
    elevation: 3,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.gray[200],
  },
  detailRow: {
    gap: 4,
  },
  detailRowRight: {
    alignItems: 'flex-end',
  },
  rentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  agreementCopy: {
    flex: 1,
    gap: 4,
  },
  downloadAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyCard: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#8690A3',
    shadowOffset: { width: 0, height: 1.3 },
    shadowOpacity: 0.2,
    shadowRadius: 10.2,
    elevation: 3,
  },
  emptyText: {
    lineHeight: 20,
  },
});
