import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { getCategoryDescription, postCreateTicket } from '@/api/tickets';
import { ProfileStackScreen } from '@/components/profile/profile-stack-screen';
import { CreateTicketSkeleton } from '@/components/skeleton';
import {
  getUploadedAttachmentUrls,
  hasFailedAttachments,
  hasUploadingAttachments,
  TicketAttachmentsField,
} from '@/components/support/ticket-attachments-field';
import { TicketCreatedView } from '@/components/support/ticket-created-view';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import {
  AnimatedAccordionContent,
  useAnimatedChevronRotation,
} from '@/components/ui/animated-accordion';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth-store';
import { useTenantProfile } from '@/stores/tenant-store';
import type { PendingTicketAttachment, TicketCategoryFaq } from '@/types/ticket';

function FaqAccordionItem({
  title,
  summary,
  isOpen,
  onToggle,
}: {
  title: string;
  summary: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const chevronStyle = useAnimatedChevronRotation(isOpen);

  return (
    <View style={styles.faqItem}>
      <Pressable
        onPress={onToggle}
        style={styles.faqQuestion}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}>
        <Typography variant="text" size="sm" weight="medium" style={styles.faqTitle}>
          {title}
        </Typography>
        <Animated.View style={chevronStyle}>
          <HwSymbol name="chevron.down" size={14} tintColor={palette.gray[600]} />
        </Animated.View>
      </Pressable>
      <AnimatedAccordionContent expanded={isOpen}>
        <Typography variant="text" size="sm" color={palette.gray[600]} style={styles.faqAnswer}>
          {summary}
        </Typography>
      </AnimatedAccordionContent>
    </View>
  );
}

export function CreateNewTicketScreen() {
  const queryClient = useQueryClient();
  const profile = useTenantProfile();
  const selectedCity = useAuthStore((state) => state.selectedCity);
  const scrollRef = useRef<ScrollView>(null);
  const params = useLocalSearchParams<{
    category?: string;
    subCategory?: string;
    subCategoryId?: string;
  }>();

  const category = params.category ?? '';
  const subCategory = params.subCategory ?? 'Create Ticket';
  const subCategoryId = params.subCategoryId ?? '';

  const [faqs, setFaqs] = useState<TicketCategoryFaq[] | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<PendingTicketAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      if (!subCategoryId) {
        setFaqs([]);
        return;
      }

      const { data } = await getCategoryDescription(subCategoryId);
      setFaqs(data.filter((item) => item.status === 'Published'));
    })();
  }, [subCategoryId]);

  async function handleSubmit() {
    const trimmed = description.trim();
    if (!trimmed) {
      Alert.alert('Describe your issue', 'Please tell us what you need help with.');
      return;
    }

    if (!profile?.userInfo?.email) {
      Alert.alert('Missing details', 'We could not find your account email. Please try again.');
      return;
    }

    if (hasUploadingAttachments(attachments)) {
      Alert.alert('Please wait', 'Attachments are still uploading.');
      return;
    }

    if (hasFailedAttachments(attachments)) {
      Alert.alert('Upload failed', 'Remove or retry failed attachments before creating the ticket.');
      return;
    }

    setLoading(true);

    const result = await postCreateTicket({
      category,
      subCategory,
      description: trimmed,
      email: profile.userInfo.email,
      propertyName: profile.propertyInfo?.name,
      city: selectedCity ?? profile.propertyInfo?.locality,
      bookingId: profile.bookingId,
      propertyId: profile.propertyInfo?.propertyId,
      attachments: getUploadedAttachmentUrls(attachments),
    });
    setLoading(false);

    if (result.success && result.ticketNumber) {
      await queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      setTicketNumber(result.ticketNumber);
      return;
    }

    Alert.alert('Could not create ticket', result.message ?? 'Please try again.');
  }

  if (ticketNumber) {
    return (
      <ProfileStackScreen title="Create New Ticket" centerTitle style={styles.screen}>
        <TicketCreatedView ticketNumber={ticketNumber} />
      </ProfileStackScreen>
    );
  }

  if (faqs === null) {
    return (
      <ProfileStackScreen title={subCategory} centerTitle style={styles.screen}>
        <CreateTicketSkeleton />
      </ProfileStackScreen>
    );
  }

  const publishedFaqs = faqs;

  return (
    <ProfileStackScreen title={subCategory} centerTitle style={styles.screen}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {publishedFaqs.length > 0 ? (
          <View style={styles.faqSection}>
            {publishedFaqs.length > 8 ? (
              <Button
                label="Need Help?"
                variant="outline"
                onPress={() => scrollRef.current?.scrollToEnd({ animated: true })}
                style={styles.helpButton}
              />
            ) : null}

            {publishedFaqs.map((faq, index) => (
              <FaqAccordionItem
                key={`${faq.title}-${index}`}
                title={faq.title}
                summary={faq.summary}
                isOpen={openFaqIndex === index}
                onToggle={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
              />
            ))}
          </View>
        ) : null}

        <View style={styles.form}>
          <Typography variant="text" size="lg" weight="bold">
            {subCategory}
          </Typography>

          <TextField
            label="Describe your issue"
            value={description}
            onChangeText={setDescription}
            placeholder="Please let us know about your issue"
            multiline
            numberOfLines={5}
            style={styles.textArea}
          />

          <TicketAttachmentsField
            attachments={attachments}
            onChange={setAttachments}
            disabled={loading}
          />

          <Button
            label="Create Ticket"
            onPress={handleSubmit}
            loading={loading}
            disabled={
              !description.trim() ||
              loading ||
              hasUploadingAttachments(attachments) ||
              hasFailedAttachments(attachments)
            }
          />
        </View>
      </ScrollView>
    </ProfileStackScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.white,
  },
  scroll: {
    padding: 20,
    gap: 20,
    paddingBottom: 32,
  },
  faqSection: {
    gap: 8,
  },
  helpButton: {
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  faqItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.gray[200],
    paddingBottom: 12,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
  },
  faqTitle: {
    flex: 1,
    color: palette.gray[900],
  },
  faqAnswer: {
    paddingBottom: 8,
    lineHeight: 20,
  },
  form: {
    gap: 16,
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: palette.gray[200],
    backgroundColor: palette.gray[50],
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
});
