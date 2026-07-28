import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { PropertyVisit } from '@/types/visit';
import { COMING_SOON_IMAGE_URI } from '@/utils/images';
import {
  formatVisitRatingDate,
  getVisitImages,
  getVisitLocality,
  getVisitManagerName,
  getVisitPropertyName,
  getVisitStartTime,
} from '@/utils/visit-format';

const ISSUE_OPTIONS = [
  'Property condition',
  'Location mismatch',
  'Staff behaviour',
  'Cleanliness',
  'Other',
] as const;

type RateVisitSheetProps = {
  visible: boolean;
  visit: PropertyVisit | null;
  onClose: () => void;
  onSubmitted?: () => void;
};

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <View style={styles.starRow}>
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const filled = starValue <= value;

        return (
          <Pressable
            key={starValue}
            onPress={() => onChange(starValue)}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${starValue} stars`}>
            <Typography variant="display" size="xs" color={filled ? palette.yellow[700] : palette.gray[300]}>
              ★
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
}

export function RateVisitSheet({ visible, visit, onClose, onSubmitted }: RateVisitSheetProps) {
  const [propertyRating, setPropertyRating] = useState(0);
  const [managerRating, setManagerRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setPropertyRating(0);
    setManagerRating(0);
    setFeedback('');
    setSelectedIssues([]);
    setSubmitting(false);
  }, [visible, visit]);

  const showIssues = propertyRating > 0 && propertyRating < 5;
  const complimentPlaceholder =
    propertyRating === 5 ? 'Give Compliment' : 'Tell us what could be better';

  function toggleIssue(issue: string) {
    setSelectedIssues((current) =>
      current.includes(issue) ? current.filter((item) => item !== issue) : [...current, issue],
    );
  }

  async function handleSubmit() {
    if (!propertyRating || !managerRating) {
      Alert.alert('Add a rating', 'Please rate both the property visit and the property manager.');
      return;
    }

    setSubmitting(true);
    try {
      onClose();
      onSubmitted?.();
      Alert.alert('Thanks for your feedback', 'Your visit rating has been submitted.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!visit) {
    return null;
  }

  const thumbnail = getVisitImages(visit)[0] ?? COMING_SOON_IMAGE_URI;
  const managerName = getVisitManagerName(visit) || 'Property Manager';

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Image source={{ uri: thumbnail }} style={styles.thumbnail} contentFit="cover" />
          <View style={styles.headerCopy}>
            <Typography variant="text" size="xl" weight="bold" color="#0A0E14">
              {getVisitPropertyName(visit)}
            </Typography>
            {getVisitLocality(visit) ? (
              <Typography variant="text" size="xs" weight="medium" color={palette.gray[700]}>
                {getVisitLocality(visit)}
              </Typography>
            ) : null}
            <Typography variant="text" size="xs" weight="medium" color={palette.gray[700]}>
              {formatVisitRatingDate(getVisitStartTime(visit))}
            </Typography>
          </View>
        </View>

        <View style={styles.ratingSection}>
          <Typography variant="text" size="md" weight="medium" color={palette.gray[800]} style={styles.centered}>
            Rate your visit to {getVisitPropertyName(visit)}
          </Typography>
          <StarRating value={propertyRating} onChange={setPropertyRating} />
        </View>

        <View style={styles.ratingSection}>
          <Typography variant="text" size="md" weight="medium" color={palette.gray[800]} style={styles.centered}>
            How would you rate our Property Manager {managerName}?
          </Typography>
          <StarRating value={managerRating} onChange={setManagerRating} />
        </View>

        {showIssues ? (
          <View style={styles.issueWrap}>
            <Typography variant="text" size="sm" weight="medium" color={palette.gray[700]}>
              What went wrong?
            </Typography>
            <View style={styles.issueRow}>
              {ISSUE_OPTIONS.map((issue) => {
                const active = selectedIssues.includes(issue);
                return (
                  <Pressable
                    key={issue}
                    onPress={() => toggleIssue(issue)}
                    style={[styles.issueChip, active && styles.issueChipActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}>
                    <Typography
                      variant="text"
                      size="xs"
                      weight="medium"
                      color={active ? palette.lime[800] : palette.gray[700]}>
                      {issue}
                    </Typography>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <TextInput
          value={feedback}
          onChangeText={setFeedback}
          placeholder={complimentPlaceholder}
          placeholderTextColor="rgba(0,0,0,0.2)"
          multiline
          textAlignVertical="top"
          style={styles.feedbackInput}
        />

        <View style={styles.actionsRow}>
          <Button label="Cancel" variant="outline" onPress={onClose} style={styles.actionButton} />
          <Button
            label="Submit"
            onPress={handleSubmit}
            loading={submitting}
            style={styles.actionButton}
          />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  thumbnail: {
    width: 67,
    height: 56,
    borderRadius: 5,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  ratingSection: {
    gap: 16,
    alignItems: 'center',
  },
  centered: {
    textAlign: 'center',
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  issueWrap: {
    gap: 12,
  },
  issueRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  issueChip: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: palette.gray[300],
    backgroundColor: palette.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  issueChipActive: {
    borderColor: palette.lime[300],
    backgroundColor: palette.lime[50],
  },
  feedbackInput: {
    minHeight: 124,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 20,
    color: palette.gray[900],
    backgroundColor: palette.white,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
});
