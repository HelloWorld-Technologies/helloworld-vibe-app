import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { skipReview, submitReview } from '@/api/reviews';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { PendingReview } from '@/types/review';

const MAX_RATING = 5;

type RatingAndReviewSheetProps = {
  pendingReviews?: PendingReview[];
  autoOpen?: boolean;
  onCompleted?: () => void;
};

function StarRating({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.starRow}>
      {Array.from({ length: MAX_RATING }, (_, index) => {
        const starValue = index + 1;
        const filled = starValue <= value;

        return (
          <Pressable
            key={starValue}
            disabled={disabled}
            onPress={() => onChange(starValue)}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${starValue} stars`}>
            <Typography
              variant="display"
              size="xs"
              color={filled ? palette.yellow[700] : palette.gray[300]}>
              ★
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
}

export function RatingAndReviewSheet({
  pendingReviews = [],
  autoOpen = false,
  onCompleted,
}: RatingAndReviewSheetProps) {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [allCompleted, setAllCompleted] = useState(false);
  const [userDismissed, setUserDismissed] = useState(false);
  const previousIdsRef = useRef('');
  const programmaticCloseRef = useRef(false);

  const currentReview = pendingReviews[currentIndex];
  const hasMoreReviews = currentIndex < pendingReviews.length - 1;

  const reviewIdsKey = useMemo(
    () =>
      pendingReviews
        .map((review) => review.id)
        .sort((a, b) => a - b)
        .join(','),
    [pendingReviews],
  );

  useEffect(() => {
    if (pendingReviews.length === 0) {
      previousIdsRef.current = '';
      setAllCompleted(false);
      setUserDismissed(false);
      setCurrentIndex(0);
      setVisible(false);
      return;
    }

    if (previousIdsRef.current !== reviewIdsKey) {
      previousIdsRef.current = reviewIdsKey;
      setAllCompleted(false);
      setUserDismissed(false);
      setCurrentIndex(0);
      setRating(0);
      setComment('');
    }
  }, [pendingReviews.length, reviewIdsKey]);

  useEffect(() => {
    if (
      autoOpen &&
      currentReview &&
      !visible &&
      !allCompleted &&
      !userDismissed &&
      pendingReviews.length > 0
    ) {
      setVisible(true);
    }
  }, [
    allCompleted,
    autoOpen,
    currentReview,
    pendingReviews.length,
    userDismissed,
    visible,
  ]);

  useEffect(() => {
    setRating(0);
    setComment('');
    setSubmitting(false);
  }, [currentReview?.id]);

  function handleClose() {
    if (!programmaticCloseRef.current) {
      setUserDismissed(true);
    }
    setVisible(false);
    programmaticCloseRef.current = false;
  }

  function advanceOrFinish() {
    if (hasMoreReviews) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    programmaticCloseRef.current = true;
    setVisible(false);
    setAllCompleted(true);
    setCurrentIndex(0);
    onCompleted?.();
  }

  async function handleSkip() {
    if (!currentReview || submitting) return;

    setSubmitting(true);
    const result = await skipReview({
      eventType: currentReview.event_type,
      review_status: 'SKIPPED',
      review_type: currentReview.review_type,
    });
    setSubmitting(false);

    if (!result.success) {
      Alert.alert('Unable to skip', result.message ?? 'Please try again.');
      return;
    }

    advanceOrFinish();
  }

  async function handleSubmit() {
    if (!currentReview || submitting) return;
    if (rating < 1) {
      Alert.alert('Add a rating', 'Please select a star rating before submitting.');
      return;
    }

    setSubmitting(true);
    const result = await submitReview({
      eventType: currentReview.event_type,
      review_status: 'COMPLETED',
      review_type: currentReview.review_type,
      review: comment.trim(),
      rating,
    });
    setSubmitting(false);

    if (!result.success) {
      Alert.alert('Unable to submit', result.message ?? 'Please try again.');
      return;
    }

    advanceOrFinish();
  }

  if (!currentReview || userDismissed) {
    return null;
  }

  return (
    <BottomSheet visible={visible} onClose={handleClose} showCloseButton={false}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <Typography variant="text" size="lg" weight="bold" color={palette.gray[900]}>
          {currentReview.description || 'Rate your experience'}
        </Typography>

        <StarRating value={rating} onChange={setRating} disabled={submitting} />

        <View style={styles.field}>
          <Typography variant="label" size="xs" color={palette.gray[500]}>
            Your review (optional)
          </Typography>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Share more about your experience"
            placeholderTextColor={palette.gray[400]}
            multiline
            numberOfLines={4}
            editable={!submitting}
            style={styles.textArea}
          />
        </View>

        <View style={styles.actions}>
          <Button
            label="Skip"
            variant="text"
            disabled={submitting}
            onPress={() => void handleSkip()}
            style={styles.skipButton}
          />
          <Button
            label="Submit review"
            loading={submitting}
            disabled={rating < 1 || submitting}
            onPress={() => void handleSubmit()}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 16,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  field: {
    gap: 8,
  },
  textArea: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: palette.gray[200],
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: 'top',
    color: palette.gray[900],
    backgroundColor: palette.white,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  skipButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});
