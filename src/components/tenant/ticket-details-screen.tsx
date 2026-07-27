import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { getTicketConversations, postTicketComment, reopenSupportTicket } from '@/api/tickets';
import {
  getUploadedAttachmentUrls,
  hasFailedAttachments,
  hasUploadingAttachments,
} from '@/components/support/ticket-attachments-field';
import { TenantScreenHeader } from '@/components/tenant/tenant-screen-header';
import { TicketConversationMessage } from '@/components/tenant/ticket-conversation-message';
import { TicketReopenBar } from '@/components/tenant/ticket-reopen-bar';
import { dismissTicketReplyKeyboard, TicketReplyBar } from '@/components/tenant/ticket-reply-bar';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { PendingTicketAttachment, TicketConversation } from '@/types/ticket';
import { formatDisplayDate, isActiveTicket } from '@/utils/tenant-format';
import { getVisibleConversations } from '@/utils/ticket-format';

export function TicketDetailsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const scrollRef = useRef<ScrollView>(null);

  const {
    id = '',
    subject = 'Support ticket',
    ticketNumber = '',
    status: initialStatus = 'Open',
    createdTime = '',
  } = useLocalSearchParams<{
    id?: string;
    subject?: string;
    ticketNumber?: string;
    status?: string;
    createdTime?: string;
  }>();

  const [status, setStatus] = useState(initialStatus);
  const [conversations, setConversations] = useState<TicketConversation[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<PendingTicketAttachment[]>([]);
  const [sending, setSending] = useState(false);
  const [reopening, setReopening] = useState(false);

  const isClosed = !isActiveTicket(status);
  const visibleConversations = conversations ? getVisibleConversations(conversations) : [];

  async function loadConversations() {
    if (!id) {
      setLoading(false);
      return;
    }

    const result = await getTicketConversations(id);
    if (result.success && result.data) {
      setConversations(result.data);
    } else if (!conversations) {
      Alert.alert('Unable to load ticket', result.message ?? 'Please try again');
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadConversations();
  }, [id]);

  useEffect(() => {
    if (!loading && visibleConversations.length > 0) {
      const timer = setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: false });
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [loading, visibleConversations.length]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  }

  async function handleSend() {
    const trimmed = message.trim();
    const uploadedUrls = getUploadedAttachmentUrls(attachments);
    if ((!trimmed && uploadedUrls.length === 0) || !id) return;
    if (hasUploadingAttachments(attachments)) {
      Alert.alert('Please wait', 'Attachments are still uploading.');
      return;
    }
    if (hasFailedAttachments(attachments)) {
      Alert.alert('Upload failed', 'Remove or retry failed attachments before sending.');
      return;
    }

    setSending(true);
    const result = await postTicketComment(id, trimmed, uploadedUrls);
    setSending(false);

    if (!result.success) {
      Alert.alert('Unable to send', result.message ?? 'Please try again');
      return;
    }

    setMessage('');
    setAttachments([]);
    dismissTicketReplyKeyboard();
    await loadConversations();
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 200);
  }

  async function handleReopen() {
    if (!id) return;

    setReopening(true);
    const result = await reopenSupportTicket(id);
    setReopening(false);

    if (!result.success) {
      Alert.alert('Unable to reopen', result.message ?? 'Please try again');
      return;
    }

    setStatus('OPEN');
    await queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    await loadConversations();
  }

  return (
    <View style={styles.root}>
      <TenantScreenHeader title={subject} onBack={() => router.back()} />

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Typography variant="label" size="xs" color={palette.gray[500]}>
            Status
          </Typography>
          <Typography variant="text" size="sm" weight="medium">
            {isClosed ? 'Resolved' : 'In Progress'}
          </Typography>
        </View>
        <View style={styles.summaryItem}>
          <Typography variant="label" size="xs" color={palette.gray[500]}>
            Ticket ID
          </Typography>
          <Typography variant="text" size="sm" weight="medium">
            HW{ticketNumber || id}
          </Typography>
        </View>
        <View style={styles.summaryItem}>
          <Typography variant="label" size="xs" color={palette.gray[500]}>
            Created on
          </Typography>
          <Typography variant="text" size="sm" weight="medium">
            {formatDisplayDate(createdTime)}
          </Typography>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator color={palette.lime[700]} />
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            showsVerticalScrollIndicator={false}>
            {visibleConversations.length > 0 ? (
              visibleConversations.map((conversation) => (
                <TicketConversationMessage key={conversation.id} conversation={conversation} />
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Typography variant="label" size="xs" color={palette.gray[500]}>
                  HelloWorld Support
                </Typography>
                <Typography variant="text" size="sm" color={palette.gray[700]}>
                  Thanks for reaching out. Our team will update you on this ticket here.
                </Typography>
              </View>
            )}
          </ScrollView>
        )}

        {isClosed ? (
          <TicketReopenBar onReopen={handleReopen} loading={reopening} />
        ) : (
          <TicketReplyBar
            value={message}
            onChange={setMessage}
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            onSend={handleSend}
            sending={sending}
          />
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.gray[50],
  },
  flex: {
    flex: 1,
  },
  summary: {
    flexDirection: 'row',
    backgroundColor: palette.white,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.gray[200],
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    gap: 4,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  emptyCard: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    padding: 16,
    gap: 8,
  },
});
