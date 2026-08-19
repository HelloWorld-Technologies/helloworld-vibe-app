import { http } from '@/api/http';
import type {
  PropertyVisitReview,
  PropertyVisitStats,
  PropertyVisitsApiData,
  PropertyVisitsApiResponse,
  PropertyVisitsApiReview,
} from '@/types/property-visits';

function readString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function readNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapReview(review: PropertyVisitsApiReview, index: number): PropertyVisitReview | null {
  const text = readString(review.review);
  if (!text) return null;

  const rating = readNumber(review.rating) ?? 0;
  return {
    id: review.id != null ? String(review.id) : `visit-review-${index}`,
    rating,
    text,
    createdAt: readString(review.created_at),
    name: readString(review.name),
  };
}

export function mapPropertyVisitsData(data?: PropertyVisitsApiData | null): PropertyVisitStats | null {
  if (!data) return null;

  const reviews = (data.reviews ?? [])
    .map(mapReview)
    .filter((item): item is PropertyVisitReview => item != null);

  const newestReviewDate = reviews.reduce<string | undefined>((latest, review) => {
    if (!review.createdAt) return latest;
    if (!latest) return review.createdAt;
    return new Date(review.createdAt).getTime() > new Date(latest).getTime()
      ? review.createdAt
      : latest;
  }, undefined);

  return {
    propertyId: readNumber(data.property_id) ?? 0,
    rating: readNumber(data.rating),
    totalReviews: readNumber(data.total_reviews) ?? reviews.length,
    isTrending: data.is_trending === true,
    totalVisits: readNumber(data.total_visits) ?? 0,
    topChoiceDate: readString(data.top_choice_date) ?? readString(data.date) ?? newestReviewDate,
    reviews,
  };
}

export async function getPropertyVisitStats(
  propertyId: number | string,
): Promise<PropertyVisitStats | null> {
  try {
    const { data } = await http.get<PropertyVisitsApiResponse>('v2/property/visits', {
      params: { id: propertyId },
    });
    if (!data?.success) return null;
    return mapPropertyVisitsData(data.data);
  } catch {
    return null;
  }
}
