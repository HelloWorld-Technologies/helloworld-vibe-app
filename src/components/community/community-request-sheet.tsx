import { HwSymbol } from '@/components/ui/hw-symbol';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Typography } from '@/components/ui/typography';
import { postEventRequest } from '@/api/community';
import { EVENT_REQUEST_CATEGORIES } from '@/constants/community';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

type CommunityRequestSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
};

export function CommunityRequestSheet({
  visible,
  onClose,
  onSubmitted,
}: CommunityRequestSheetProps) {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!visible) {
      setName('');
      setCategories([]);
      setDescription('');
      setError('');
      setLoading(false);
      setSuccess(false);
      setSuccessMessage('');
    }
  }, [visible]);

  function handleClose() {
    onClose();
  }

  function toggleCategory(category: string) {
    setCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  }

  async function handleSubmit() {
    if (!name.trim()) {
      setError('Tell us what event you have in mind');
      return;
    }
    if (!categories.length) {
      setError('Pick at least one category');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const result = await postEventRequest({
        event_name: name.trim(),
        category: categories.join(', '),
        additional_details: description.trim(),
      });

      if (!result.success) {
        setError(result.message ?? 'Failed to submit request');
        return;
      }

      setSuccessMessage(
        result.message?.trim() ||
          'Thanks! Our team will review your idea and get back to you soon.',
      );
      setSuccess(true);
      onSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  }

  return (
    <BottomSheet visible={visible} onClose={handleClose}>
      {success ? (
        <View style={styles.successContent}>
          <View style={styles.successIconWrap}>
            <View style={styles.successIconOuter}>
              <View style={styles.successIconInner}>
                <HwSymbol
                  name="checkmark"
                  size={28}
                  weight="bold"
                  tintColor={palette.lime[700]}
                />
              </View>
            </View>
          </View>

          <Typography variant="text" size="xl" weight="bold" style={styles.successTitle}>
            Request submitted!
          </Typography>
          <Typography variant="text" size="sm" color={palette.gray[600]} style={styles.successMessage}>
            {successMessage}
          </Typography>

          <Button label="Done" onPress={handleClose} style={styles.doneButton} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Typography variant="text" size="lg" weight="medium">
            What&apos;s the Event
          </Typography>

          <TextField
            label="Event name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Sunday brunch"
          />

          <View style={styles.section}>
            <Typography variant="text" size="sm" weight="medium">
              Category
            </Typography>
            <View style={styles.chipGrid}>
              {EVENT_REQUEST_CATEGORIES.map((category) => {
                const active = categories.includes(category);
                return (
                  <Pressable
                    key={category}
                    onPress={() => toggleCategory(category)}
                    style={[styles.chip, active && styles.chipActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}>
                    <Typography
                      variant="text"
                      size="sm"
                      weight="medium"
                      color={active ? palette.gray[900] : palette.gray[600]}>
                      {category}
                    </Typography>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <TextField
            label="Anything else?"
            value={description}
            onChangeText={setDescription}
            placeholder="Share more details"
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />

          {error ? (
            <Typography variant="text" size="sm" color={palette.red[600]}>
              {error}
            </Typography>
          ) : null}

          <View style={styles.actions}>
            <Button
              label="Cancel"
              variant="outline"
              onPress={handleClose}
              style={styles.actionButton}
            />
            <Button
              label="Submit"
              loading={loading}
              onPress={handleSubmit}
              style={styles.actionButton}
            />
          </View>
        </ScrollView>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    gap: 16,
    paddingBottom: 32,
  },
  section: {
    gap: 12,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: palette.gray[200],
    backgroundColor: palette.white,
  },
  chipActive: {
    borderColor: palette.gray[900],
    backgroundColor: palette.gray[100],
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
  successContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    alignItems: 'center',
    gap: 12,
  },
  successIconWrap: {
    marginBottom: 8,
  },
  successIconOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: palette.lime[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.lime[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    textAlign: 'center',
    color: palette.gray[900],
  },
  successMessage: {
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  doneButton: {
    alignSelf: 'stretch',
    marginTop: 16,
  },
});
