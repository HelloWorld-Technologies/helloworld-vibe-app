import type { HdpReview } from '@/constants/hdp';
import type { HdpGoogleData } from '@/types/property';

export type HdpReviewCategory = {
  label: string;
  score: number;
};

export type HdpReviewSummary = {
  rating: number;
  label: string;
  reviewCount: number;
  recommendPercent: number;
  categories: HdpReviewCategory[];
  googleLink?: string;
};

function ratingLabel(rating: number) {
  if (rating >= 4.5) return 'Exceptional';
  if (rating >= 4.0) return 'Very Good';
  if (rating >= 3.5) return 'Good';
  return 'Rated';
}

/** Same mapping as helloworld-vibe `mapGoogleDataToReviewSummary`. */
export function mapGoogleDataToReviewSummary(
  googleData: HdpGoogleData | null | undefined,
): HdpReviewSummary | null {
  if (!googleData) return null;

  const rating = Number(googleData.google_rating);
  const reviewCount =
    googleData.google_reviews_new?.length ?? googleData.google_reviews?.length ?? 0;

  if (!Number.isFinite(rating) && reviewCount === 0) return null;

  const safeRating = Number.isFinite(rating) ? rating : 0;

  return {
    rating: safeRating,
    label: Number.isFinite(rating) ? ratingLabel(rating) : 'Reviews',
    reviewCount,
    recommendPercent: Number.isFinite(rating)
      ? Math.min(99, Math.round((rating / 5) * 100))
      : 90,
    categories: [
      { label: 'Cleanliness', score: Number.isFinite(rating) ? rating : 4.5 },
      {
        label: 'Location',
        score: Number.isFinite(rating) ? Math.max(0, rating - 0.1) : 4.4,
      },
      { label: 'Amenities', score: Number.isFinite(rating) ? rating : 4.5 },
      {
        label: 'Community',
        score: Number.isFinite(rating) ? Math.max(0, rating - 0.2) : 4.3,
      },
    ],
    googleLink: googleData.google_link?.trim() || undefined,
  };
}

/** Same mapping as helloworld-vibe `mapGoogleReviewsToResidentReviews`. */
export function mapGoogleReviewsToResidentReviews(
  googleData: HdpGoogleData | null | undefined,
): HdpReview[] {
  const reviews = googleData?.google_reviews_new ?? [];
  return reviews
    .filter((review) => review?.name && review?.review)
    .map((review, index) => ({
      id: `google-review-${index}`,
      name: String(review.name).trim(),
      rating: Number(review.star) || 5,
      text: String(review.review).trim(),
    }));
}
