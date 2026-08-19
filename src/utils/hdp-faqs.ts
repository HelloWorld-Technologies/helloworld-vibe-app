import type { PropertyDetailResponse } from '@/types/property';
import { formatNearbyCategoryLabel } from '@/utils/hdp-nearby';
import { stripAmenityEmoji } from '@/utils/amenity-format';

export type HdpFaqItem = {
  question: string;
  answer: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function readString(value: unknown) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function mapFaqRecord(value: unknown): HdpFaqItem | null {
  const record = asRecord(value);
  if (!record) return null;

  const question =
    readString(record.question) ||
    readString(record.title) ||
    readString(record.q) ||
    readString(record.name);
  const answer =
    readString(record.answer) ||
    readString(record.summary) ||
    readString(record.description) ||
    readString(record.a) ||
    readString(record.content);

  if (!question || !answer) return null;
  return { question, answer };
}

function extractFaqArray(source: unknown): HdpFaqItem[] {
  const record = asRecord(source);
  const candidates = [
    source,
    record?.faqs,
    record?.faq,
    record?.faq_list,
    record?.faqList,
    record?.data,
  ];

  for (const candidate of candidates) {
    if (!Array.isArray(candidate) || candidate.length === 0) continue;
    const items = candidate.map(mapFaqRecord).filter((item): item is HdpFaqItem => item != null);
    if (items.length > 0) return items;
  }

  return [];
}

function formatInr(amount: number) {
  return new Intl.NumberFormat('en-IN').format(amount);
}

function uniqueLabels(values: unknown[]) {
  const seen = new Set<string>();
  const labels: string[] = [];

  for (const value of values) {
    if (typeof value !== 'string') continue;
    const label = stripAmenityEmoji(value).trim();
    if (!label) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    labels.push(label);
  }

  return labels;
}

function buildFaqsFromProperty(
  property: Record<string, unknown>,
  detail?: PropertyDetailResponse | null,
): HdpFaqItem[] {
  const faqs: HdpFaqItem[] = [];
  const displayName =
    readString(property.display_name) || readString(property.name) || 'this property';
  const googleData = asRecord(detail?.googleData) ?? asRecord(property.googleData);
  const address = asRecord(property.address);

  const rating = Number(googleData?.google_rating ?? property.google_rating);
  const reviews = googleData?.google_reviews_new ?? googleData?.google_reviews;
  const reviewCount = Array.isArray(reviews) ? reviews.length : 0;
  const googleLink = readString(googleData?.google_link);

  if ((Number.isFinite(rating) && rating > 0) || reviewCount > 0) {
    const ratingSentence = Number.isFinite(rating) && rating > 0
      ? `${displayName} currently has a Google rating of ${rating.toFixed(1)}.`
      : `${displayName} has published Google reviews.`;
    const countSentence =
      reviewCount > 0
        ? ` Review volume: ${reviewCount} review${reviewCount === 1 ? '' : 's'}.`
        : '';
    const linkSentence = googleLink ? ` You can read recent reviews here: ${googleLink}.` : '';
    faqs.push({
      question: `How are the reviews for ${displayName}?`,
      answer: `${ratingSentence}${countSentence}${linkSentence}`,
    });
  }

  const rent = Number(property.min_rent ?? property.starting_rent ?? property.price ?? property.rent);
  if (Number.isFinite(rent) && rent > 0) {
    faqs.push({
      question: `What is the rent at ${displayName}?`,
      answer: `Rent at ${displayName} starts from ₹${formatInr(rent)} per month. Final monthly outflow can vary by room type, occupancy, and move-in date.`,
    });
  }

  const locationParts = [
    readString(address?.line1),
    readString(address?.line2),
    readString(address?.locality) || readString(property.locality),
    readString(address?.city) || readString(property.city),
  ].filter(Boolean);
  if (locationParts.length > 0) {
    faqs.push({
      question: `Where is ${displayName} located?`,
      answer: `${displayName} is located at ${locationParts.join(', ')}.`,
    });
  }

  const roomTypes = uniqueLabels([
    ...(Array.isArray(property.room_types) ? property.room_types : []),
    ...(Array.isArray(property.sharing_types) ? property.sharing_types : []),
  ]);
  if (roomTypes.length > 0) {
    faqs.push({
      question: `What room types are available at ${displayName}?`,
      answer: `This property offers: ${roomTypes.join(', ')}. Availability can change by category.`,
    });
  }

  const amenities = uniqueLabels([
    ...(Array.isArray(property.rent_includes) ? property.rent_includes : []),
    ...(Array.isArray(property.amenities) ? property.amenities : []),
    ...(Array.isArray(property.services) ? property.services : []),
  ]);
  if (amenities.length > 0) {
    const preview = amenities.slice(0, 20).join(', ');
    faqs.push({
      question: `What is included in the rent at ${displayName}?`,
      answer: `This property includes: ${preview}${amenities.length > 20 ? ', and more.' : '.'}`,
    });
  }

  const depositMonths = Number(property.security_deposit_months ?? property.sd_month);
  if (Number.isFinite(depositMonths) && depositMonths > 0) {
    faqs.push({
      question: `How much security deposit do I need to pay?`,
      answer: `The security deposit at ${displayName} is ${depositMonths} month${depositMonths === 1 ? '' : 's'} of rent, as shown on this listing.`,
    });
  }

  const lockIn = Number(
    property.lock_in_period ?? property.lockin_period ?? property.minimum_stay ?? property.min_stay_months,
  );
  if (Number.isFinite(lockIn) && lockIn > 0) {
    faqs.push({
      question: `What is the minimum stay at ${displayName}?`,
      answer: `A minimum stay of ${lockIn} month${lockIn === 1 ? '' : 's'} applies at ${displayName}. Deposit refund eligibility can depend on this lock-in and notice rules.`,
    });
  }

  const nearBy = asRecord(detail?.nearBy) ?? asRecord(property.nearBy) ?? asRecord(property.nearby);
  if (nearBy) {
    for (const [key, places] of Object.entries(nearBy)) {
      if (!Array.isArray(places) || places.length === 0) continue;
      const names = places
        .map((place) => readString(asRecord(place)?.name))
        .filter(Boolean)
        .slice(0, 5);
      if (names.length === 0) continue;
      const label = formatNearbyCategoryLabel(key);
      faqs.push({
        question: `What is near ${displayName} for ${label}?`,
        answer: `Nearby ${label.toLowerCase()} options include: ${names.join(', ')}.`,
      });
    }
  }

  return faqs;
}

/** FAQs from `v2/hello/house` — explicit FAQ payload if present, otherwise property fields. */
export function extractHdpFaqs(
  detail?: PropertyDetailResponse | null,
  property?: Record<string, unknown> | null,
): HdpFaqItem[] {
  const fromApi = [
    ...extractFaqArray(detail),
    ...extractFaqArray(detail?.data),
    ...extractFaqArray(property),
  ];

  const uniqueApiFaqs: HdpFaqItem[] = [];
  const seen = new Set<string>();
  for (const item of fromApi) {
    const key = item.question.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueApiFaqs.push(item);
  }

  if (uniqueApiFaqs.length > 0) return uniqueApiFaqs;
  if (!property) return [];
  return buildFaqsFromProperty(property, detail);
}
