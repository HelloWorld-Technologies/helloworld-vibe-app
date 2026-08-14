import type { BookingStatus, RentalAgreementItem, ResidenceStatus } from '@/types/booking-status';
import type { TenantProfile } from '@/types/tenant';

export function formatBookingDate(value?: string) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatAgreementDateRange(start?: string, end?: string) {
  if (!start) return '—';

  const startLabel = formatBookingDate(start);
  if (!end) return startLabel;

  return `${startLabel} - ${formatBookingDate(end)}`;
}

export function getPropertyLocality(
  profile?: TenantProfile | null,
  propertyDetail?: Record<string, unknown> | null,
) {
  const propertyName = profile?.propertyInfo?.name?.trim().toLowerCase() ?? '';
  const address = propertyDetail?.address;
  if (address && typeof address === 'object') {
    const record = address as Record<string, unknown>;
    const locality =
      (typeof record.line2 === 'string' && record.line2) ||
      (typeof record.locality === 'string' && record.locality) ||
      (typeof record.line1 === 'string' && record.line1);
    if (locality && locality.trim().toLowerCase() !== propertyName) return locality;
  }

  if (typeof propertyDetail?.locality === 'string' && propertyDetail.locality) {
    if (propertyDetail.locality.trim().toLowerCase() !== propertyName) {
      return propertyDetail.locality;
    }
  }

  const userAddress = profile?.userAddress;
  if (userAddress && typeof userAddress === 'object') {
    const record = userAddress as Record<string, unknown>;
    const parts = [record.area, record.city, record.flatName]
      .filter((part): part is string => typeof part === 'string' && part.trim().length > 0);
    if (parts.length > 0) return parts.join(', ');
  }

  return '';
}

export function getRoomLabel(profile?: TenantProfile | null) {
  const property = profile?.propertyInfo;
  if (!property) return '—';

  const parts = [property.address?.flatNo, property.roomType, property.sharingType]
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter(Boolean);

  return parts.length > 0 ? parts.join(' • ') : '—';
}

function normalizeBookingState(value?: string) {
  return (value ?? '').trim().toLowerCase().replace(/[_\s-]+/g, '');
}

export function getResidenceStatus(
  profile?: TenantProfile | null,
  _bookingStatus?: BookingStatus,
): ResidenceStatus {
  const bookingState = normalizeBookingState(profile?.userInfo?.bookingStatus);

  if (bookingState === 'resident' || bookingState === 'currentlyresiding') {
    return { label: 'Currently Residing' };
  }

  if (
    bookingState === 'movedout' ||
    bookingState === 'moveout' ||
    bookingState === 'paststay' ||
    bookingState.includes('movedout')
  ) {
    return { label: 'Past Stay' };
  }

  return { label: 'To Move-in' };
}

function readString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

export function getRentalAgreements(profile?: TenantProfile | null): RentalAgreementItem[] {
  const documents = profile?.documents;
  if (!documents || typeof documents !== 'object') {
    return buildFallbackAgreements(profile);
  }

  const record = documents as Record<string, unknown>;
  const rawAgreements = record.rentalAgreements ?? record.agreements ?? record.rental_agreements;

  if (Array.isArray(rawAgreements) && rawAgreements.length > 0) {
    const parsed: RentalAgreementItem[] = [];

    rawAgreements.forEach((item, index) => {
      if (!item || typeof item !== 'object') return;
      const agreement = item as Record<string, unknown>;
      const start = readString(agreement.startDate ?? agreement.start_date ?? agreement.from);
      const end = readString(agreement.endDate ?? agreement.end_date ?? agreement.to);
      const downloadUrl = readString(
        agreement.url ?? agreement.downloadUrl ?? agreement.download_url ?? agreement.documentUrl,
      );

      parsed.push({
        id: readString(agreement.id) ?? `agreement-${index}`,
        label: readString(agreement.label) ?? 'Rental Agreement',
        dateRange: formatAgreementDateRange(start, end),
        downloadUrl,
      });
    });

    return parsed;
  }

  const singleUrl = readString(
    record.agreementUrl ?? record.agreement_url ?? record.signedAgreementUrl ?? record.documentUrl,
  );

  if (singleUrl) {
    return [
      {
        id: 'current-agreement',
        label: 'Rental Agreement',
        dateRange: formatAgreementDateRange(
          profile?.propertyInfo?.moveInDate,
          profile?.propertyInfo?.moveOutDate ?? profile?.propertyInfo?.rentStartDate,
        ),
        downloadUrl: singleUrl,
      },
    ];
  }

  return buildFallbackAgreements(profile, record);
}

function buildFallbackAgreements(
  profile?: TenantProfile | null,
  documents?: Record<string, unknown>,
) {
  const isSigned = documents?.isDocumentSigned === true || documents?.is_document_signed === true;
  const moveInDate = profile?.propertyInfo?.moveInDate;

  if (!isSigned || !moveInDate) {
    return [];
  }

  return [
    {
      id: 'current-agreement',
      label: 'Rental Agreement',
      dateRange: formatAgreementDateRange(
        moveInDate,
        profile?.propertyInfo?.moveOutDate ?? profile?.propertyInfo?.rentStartDate,
      ),
    },
  ];
}
