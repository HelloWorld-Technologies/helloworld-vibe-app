import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { HwCarousel } from '@/components/ui/carousel';
import { Typography } from '@/components/ui/typography';
import { type HdpReview } from '@/constants/hdp';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { HdpReviewCategory, HdpReviewSummary } from '@/utils/hdp-reviews';

const REVIEW_CARD_GAP = 12;
const REVIEW_CAROUSEL_HEIGHT = 148;

type HdpReviewsSectionProps = {
  summary?: HdpReviewSummary | null;
  reviews?: HdpReview[];
  carouselWidth: number;
};

function RecommendRing({ percent, size = 72 }: { percent: number; size?: number }) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(percent, 0), 100) / 100;
  const dashOffset = circumference * (1 - progress);

  return (
    <View style={[styles.ringWrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={palette.gray[200]}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={palette.lime[500]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.ringLabel}>
        <Typography variant="text" size="sm" weight="bold" color={palette.lime[700]}>
          {Math.round(percent)}%
        </Typography>
      </View>
    </View>
  );
}

function CategoryRatingRow({ label, score }: HdpReviewCategory) {
  const fillRatio = Math.min(Math.max(score / 5, 0), 1);

  return (
    <View style={styles.categoryRow}>
      <Typography variant="text" size="sm" weight="medium" color={palette.gray[700]} style={styles.categoryLabel}>
        {label}
      </Typography>
      <View style={styles.barTrack}>
        <LinearGradient
          colors={[palette.lime[400], palette.lime[600]]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.barFill, { flex: fillRatio }]}
        />
        <View style={[styles.barSpacer, { flex: 1 - fillRatio }]} />
      </View>
      <Typography variant="text" size="sm" weight="bold" color={palette.gray[900]} style={styles.categoryScore}>
        {score.toFixed(1)}
      </Typography>
    </View>
  );
}

function ReviewAvatar({ name, avatarUri }: { name: string; avatarUri?: string }) {
  if (avatarUri) {
    return <Image source={{ uri: avatarUri }} style={styles.avatar} contentFit="cover" />;
  }

  return (
    <View style={styles.avatarFallback}>
      <Typography variant="text" size="sm" weight="bold" color={palette.blue[700]}>
        {name.charAt(0)}
      </Typography>
    </View>
  );
}

function ReviewCard({ review, width }: { review: HdpReview; width: number }) {
  return (
    <View style={[styles.reviewCard, { width }]}>
      <View style={styles.reviewHeader}>
        <ReviewAvatar name={review.name} avatarUri={review.avatarUri} />
        <Typography variant="text" size="sm" weight="bold" color={palette.gray[900]} style={styles.reviewName}>
          {review.name}
        </Typography>
        <View style={styles.reviewRatingBadge}>
          <Typography variant="text" size="xs" weight="bold" color={palette.blue[700]}>
            {review.rating}★
          </Typography>
        </View>
      </View>
      <Typography variant="text" size="sm" color={palette.gray[600]} style={styles.reviewText} numberOfLines={4}>
        {review.text}
      </Typography>
    </View>
  );
}

export function HdpReviewsSection({
  summary,
  reviews = [],
  carouselWidth,
}: HdpReviewsSectionProps) {
  const hasSummary = summary != null;
  const hasReviews = reviews.length > 0;
  if (!hasSummary && !hasReviews) return null;

  const reviewCardWidth = carouselWidth - REVIEW_CARD_GAP;
  const slideWidth = carouselWidth;
  const rating = summary?.rating;
  const googleLink = summary?.googleLink;

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Typography variant="text" size="xl" weight="bold">
          What Residents Say
        </Typography>
        {typeof rating === 'number' && Number.isFinite(rating) ? (
          <View style={styles.ratingBadge}>
            <Typography variant="text" size="xs" weight="medium" color={palette.blue[700]}>
              {rating.toFixed(1)}★ Rating
            </Typography>
          </View>
        ) : null}
      </View>

      {summary ? (
        <LinearGradient
          colors={[palette.blue[50], palette.white]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View style={styles.summaryLeft}>
              <View style={styles.ratingValueRow}>
                <Typography variant="display" size="sm" weight="bold" color={palette.gray[900]}>
                  {Number.isFinite(summary.rating) ? summary.rating.toFixed(1) : '—'}
                </Typography>
                <Typography variant="text" size="xl" color={palette.yellow[500]}>
                  ★
                </Typography>
              </View>
              <Typography variant="text" size="sm" weight="bold" color={palette.gray[900]}>
                {summary.label}
              </Typography>
              <Typography variant="text" size="xs" color={palette.gray[500]}>
                Based on {summary.reviewCount} reviews
              </Typography>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRight}>
              <RecommendRing percent={summary.recommendPercent} />
              <Typography variant="text" size="xs" color={palette.gray[600]} style={styles.recommendCopy}>
                Residents would recommend to a friend
              </Typography>
            </View>
          </View>

          {summary.categories.length > 0 ? (
            <View style={styles.categoryList}>
              {summary.categories.map((item) => (
                <CategoryRatingRow key={item.label} {...item} />
              ))}
            </View>
          ) : null}
        </LinearGradient>
      ) : null}

      {hasReviews ? (
        <HwCarousel
          data={reviews}
          width={slideWidth}
          height={REVIEW_CAROUSEL_HEIGHT}
          showPagination
          style={styles.carousel}
          renderItem={({ item }) => (
            <View style={[styles.reviewSlide, { width: slideWidth }]}>
              <ReviewCard review={item} width={reviewCardWidth} />
            </View>
          )}
        />
      ) : null}

      {googleLink ? (
        <Pressable
          onPress={() => void Linking.openURL(googleLink)}
          accessibilityRole="link"
          accessibilityLabel="Show all Google reviews">
          <Typography variant="text" size="sm" weight="medium" color={palette.lime[600]}>
            Show all Google reviews
          </Typography>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  ratingBadge: {
    backgroundColor: palette.blue[50],
    borderWidth: 1,
    borderColor: palette.blue[200],
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  summaryCard: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.gray[200],
    padding: 16,
    gap: 16,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 16,
  },
  summaryLeft: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  ratingValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: palette.gray[300],
  },
  summaryRight: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  recommendCopy: {
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 132,
  },
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringLabel: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryList: {
    gap: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryLabel: {
    width: 88,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: palette.gray[200],
    overflow: 'hidden',
    flexDirection: 'row',
  },
  barFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  barSpacer: {
    height: '100%',
  },
  categoryScore: {
    width: 30,
    textAlign: 'right',
  },
  carousel: {
    marginHorizontal: -4,
  },
  reviewSlide: {
    height: REVIEW_CAROUSEL_HEIGHT,
    paddingRight: REVIEW_CARD_GAP,
    justifyContent: 'flex-start',
  },
  reviewCard: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: palette.gray[200],
    padding: 14,
    gap: 12,
    minHeight: REVIEW_CAROUSEL_HEIGHT,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.blue[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewName: {
    flex: 1,
  },
  reviewRatingBadge: {
    backgroundColor: palette.blue[50],
    borderWidth: 1,
    borderColor: palette.blue[200],
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  reviewText: {
    lineHeight: 20,
  },
});
