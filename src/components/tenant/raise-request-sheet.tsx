import { useRouter } from 'expo-router';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ColorValue,
} from 'react-native';

import {
  getUploadedAttachmentUrls,
  hasFailedAttachments,
  hasUploadingAttachments,
  TicketAttachmentsField,
} from '@/components/support/ticket-attachments-field';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Typography } from '@/components/ui/typography';
import type { RaiseSupportRequestPayload } from '@/types/ticket';
import palette from '@/constants/palette';
import { useKbCategories } from '@/queries/use-kb-categories';
import type {
  PendingTicketAttachment,
  TicketCategory,
  TicketCategoryChild,
} from '@/types/ticket';
import { getSupportCategoryIcon, getVisibleSubcategories } from '@/utils/support-category-icons';
import { Radius } from '@/constants/theme';

const MOVE_OUT_CATEGORY = {
  name: 'Move out',
  key: 'move-out',
} as const;

type RaiseRequestSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: RaiseSupportRequestPayload) => Promise<string | void>;
};

type Step = 'category' | 'details' | 'success';

type SelectedCategory =
  | { type: 'api'; category: TicketCategory }
  | { type: 'move-out' };

function CategoryTile({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon: string;
  selected: boolean;
  onPress: () => void;
}) {
  const iconColor: ColorValue = selected ? palette.blue[800] : palette.gray[700];
  const textColor = selected ? palette.blue[800] : palette.gray[700];

  return (
    <Pressable
      onPress={onPress}
      style={[styles.categoryTile, selected ? styles.categoryTileSelected : styles.categoryTileDefault]}
      accessibilityRole="button"
      accessibilityState={{ selected }}>
      <HwSymbol name={icon as never} size={24} tintColor={iconColor} />
      <Typography variant="label" size="xs" weight="medium" color={textColor} style={styles.categoryLabel}>
        {label}
      </Typography>
    </Pressable>
  );
}

function SubcategoryRow({
  item,
  selected,
  onPress,
}: {
  item: TicketCategoryChild;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.subcategoryRow, selected && styles.subcategoryRowSelected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}>
      <Typography variant="text" size="sm" weight="medium" color={palette.gray[900]}>
        {item.name}
      </Typography>
      {selected ? <HwSymbol name="checkmark" size={14} tintColor={palette.lime[700]} /> : null}
    </Pressable>
  );
}

export function RaiseRequestSheet({ visible, onClose, onSubmit }: RaiseRequestSheetProps) {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { data: categories = [], isLoading, isError, refetch } = useKbCategories();
  const [step, setStep] = useState<Step>('category');
  const [selectedCategory, setSelectedCategory] = useState<SelectedCategory | null>(null);
  const [subCategory, setSubCategory] = useState<TicketCategoryChild | null>(null);
  const [subcategoryListOpen, setSubcategoryListOpen] = useState(true);
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<PendingTicketAttachment[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);

  const subcategories = useMemo(() => {
    if (!selectedCategory || selectedCategory.type !== 'api') {
      return [];
    }
    return getVisibleSubcategories(selectedCategory.category.name, selectedCategory.category.child ?? []);
  }, [selectedCategory]);

  const selectedCategoryLabel =
    selectedCategory?.type === 'move-out'
      ? MOVE_OUT_CATEGORY.name
      : selectedCategory?.category.name ?? '';

  function reset() {
    setStep('category');
    setSelectedCategory(null);
    setSubCategory(null);
    setSubcategoryListOpen(true);
    setDescription('');
    setAttachments([]);
    setError('');
    setLoading(false);
    setTicketNumber(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleCategoryContinue() {
    if (!selectedCategory) {
      setError('Please choose a category');
      return;
    }

    if (selectedCategory.type === 'move-out') {
      handleClose();
      router.push('/profile/move-out');
      return;
    }

    if (subcategories.length === 0) {
      setError('No issues are available for this category right now.');
      return;
    }

    setError('');
    if (subcategories.length === 1) {
      setSubCategory(subcategories[0]);
      setSubcategoryListOpen(false);
    } else {
      setSubCategory(null);
      setSubcategoryListOpen(true);
    }
    setStep('details');
  }

  function selectSubcategory(item: TicketCategoryChild) {
    setSubCategory(item);
    setSubcategoryListOpen(false);
    setError('');
  }

  async function handleSubmit() {
    if (!selectedCategory || selectedCategory.type !== 'api') {
      setError('Please choose a category');
      return;
    }
    if (!subCategory) {
      setError('Please choose an issue type');
      return;
    }
    if (!description.trim()) {
      setError('Please describe your issue');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const number = await onSubmit({
        category: selectedCategory.category.name,
        subCategory: subCategory.name,
        subCategoryId: subCategory.id,
        description: description.trim(),
        attachments,
      });
      if (number) {
        setTicketNumber(number);
        setStep('success');
      } else {
        handleClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to raise request');
    } finally {
      setLoading(false);
    }
  }

  return (
    <BottomSheet visible={visible} onClose={handleClose}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}>
        {step === 'category' ? (
          <>
            <Typography variant="text" size="md" weight="medium" style={styles.title}>
              What&apos;s this about?
            </Typography>

            {isLoading ? (
              <ActivityIndicator color={palette.lime[700]} style={styles.loader} />
            ) : (
              <View style={styles.categoryGrid}>
                {categories.map((category) => {
                  const selected =
                    selectedCategory?.type === 'api' &&
                    selectedCategory.category.name === category.name;

                  return (
                    <CategoryTile
                      key={category.name}
                      label={category.name}
                      icon={getSupportCategoryIcon(category.name)}
                      selected={selected}
                      onPress={() => {
                        setSelectedCategory({ type: 'api', category });
                        setError('');
                      }}
                    />
                  );
                })}

                <CategoryTile
                  label={MOVE_OUT_CATEGORY.name}
                  icon={getSupportCategoryIcon(MOVE_OUT_CATEGORY.name)}
                  selected={selectedCategory?.type === 'move-out'}
                  onPress={() => {
                    setSelectedCategory({ type: 'move-out' });
                    setError('');
                  }}
                />
              </View>
            )}

            {isError ? (
              <Pressable onPress={() => void refetch()} accessibilityRole="button">
                <Typography variant="label" color={palette.error} style={styles.errorText}>
                  Unable to load categories.{' '}
                  <Typography variant="label" color={palette.lime[700]}>
                    Try again
                  </Typography>
                </Typography>
              </Pressable>
            ) : null}

            {error ? (
              <Typography variant="label" color={palette.error}>
                {error}
              </Typography>
            ) : null}

            <View style={styles.actions}>
              <Button label="Cancel" variant="outline" onPress={handleClose} style={styles.actionButton} />
              <Button
                label="Continue"
                onPress={handleCategoryContinue}
                disabled={!selectedCategory || isLoading}
                style={styles.actionButton}
              />
            </View>
          </>
        ) : null}

        {step === 'details' ? (
          <>
            <Typography variant="text" size="md" weight="medium" style={styles.title}>
              Help us narrow it down
            </Typography>

            <Pressable
              style={styles.dropdown}
              onPress={() => {
                setError('');
                setStep('category');
                setSubcategoryListOpen(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Change category">
              <Typography variant="text" size="md" weight="medium" color={palette.gray[800]}>
                {selectedCategoryLabel}
              </Typography>
              <HwSymbol name="chevron.down" size={14} tintColor={palette.gray[500]} />
            </Pressable>

            {subCategory && !subcategoryListOpen ? (
              <Pressable
                style={styles.dropdown}
                onPress={() => setSubcategoryListOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Change issue type">
                <Typography variant="text" size="md" weight="medium" color={palette.gray[800]}>
                  {subCategory.name}
                </Typography>
                <HwSymbol name="chevron.down" size={14} tintColor={palette.gray[500]} />
              </Pressable>
            ) : (
              <View style={styles.subcategoryList}>
                {subcategories.map((item) => (
                  <SubcategoryRow
                    key={item.id}
                    item={item}
                    selected={subCategory?.id === item.id}
                    onPress={() => selectSubcategory(item)}
                  />
                ))}
              </View>
            )}

            <TextField
              label="Describe your issue"
              value={description}
              onChangeText={setDescription}
              placeholder="Please let us know about your issue"
              multiline
              numberOfLines={5}
              style={styles.textArea}
              onFocus={() => {
                // After the sheet lifts above the keyboard, bring the field into view.
                requestAnimationFrame(() => {
                  setTimeout(() => {
                    scrollRef.current?.scrollToEnd({ animated: true });
                  }, 100);
                });
              }}
            />

            <TicketAttachmentsField
              attachments={attachments}
              onChange={setAttachments}
              disabled={loading}
            />

            {error ? (
              <Typography variant="label" color={palette.error}>
                {error}
              </Typography>
            ) : null}

            <View style={styles.actions}>
              <Button
                label="Cancel"
                variant="outline"
                onPress={() => {
                  setError('');
                  setStep('category');
                  setSubcategoryListOpen(true);
                }}
                style={styles.actionButton}
              />
              <Button
                label="Submit"
                loading={loading}
                onPress={handleSubmit}
                disabled={
                  !subCategory ||
                  !description.trim() ||
                  loading ||
                  hasUploadingAttachments(attachments) ||
                  hasFailedAttachments(attachments)
                }
                style={styles.actionButton}
              />
            </View>
          </>
        ) : null}

        {step === 'success' && ticketNumber ? (
          <View style={styles.success}>
            <View style={styles.successIcon}>
              <Typography variant="display" size="xs" weight="bold" color={palette.lime[600]}>
                ✓
              </Typography>
            </View>
            <Typography variant="text" size="md" color={palette.gray[600]}>
              Ticket ID: {ticketNumber}
            </Typography>
            <Typography variant="text" size="lg" weight="bold" style={styles.successHeading}>
              We have received your request
            </Typography>
            <Typography variant="text" size="sm" color={palette.gray[500]} style={styles.successDesc}>
              Our team will contact you soon regarding the ticket you created.
            </Typography>
            <Button label="Done" onPress={handleClose} style={styles.doneButton} />
          </View>
        ) : null}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 16,
  },
  title: {
    textAlign: 'center',
    color: palette.black,
  },
  loader: {
    marginVertical: 24,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTile: {
    width: '23%',
    minWidth: 78,
    height: 84,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  categoryTileDefault: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray[200],
  },
  categoryTileSelected: {
    backgroundColor: palette.blue[100],
    borderWidth: 1,
    borderColor: palette.blue[100],
  },
  categoryLabel: {
    textAlign: 'center',
  },
  dropdown: {
    minHeight: 44,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: palette.gray[300],
    backgroundColor: palette.white,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  subcategoryList: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: palette.gray[200],
    overflow: 'hidden',
  },
  subcategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.gray[200],
    backgroundColor: palette.white,
  },
  subcategoryRowSelected: {
    backgroundColor: palette.lime[50],
  },
  textArea: {
    minHeight: 124,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
  },
  errorText: {
    textAlign: 'center',
  },
  success: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    paddingBottom: 8,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: palette.lime[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successHeading: {
    textAlign: 'center',
    color: palette.gray[900],
  },
  successDesc: {
    textAlign: 'center',
    lineHeight: 22,
  },
  doneButton: {
    width: '100%',
    marginTop: 16,
  },
});
