import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  getUploadedAttachmentUrls,
  hasFailedAttachments,
  hasUploadingAttachments,
  pickAndUploadTicketAttachments,
} from '@/components/support/ticket-attachments-field';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { PendingTicketAttachment } from '@/types/ticket';

type TicketReplyBarProps = {
  value: string;
  onChange: (value: string) => void;
  attachments: PendingTicketAttachment[];
  onAttachmentsChange: (attachments: PendingTicketAttachment[]) => void;
  onSend: () => void;
  sending?: boolean;
};

export function TicketReplyBar({
  value,
  onChange,
  attachments,
  onAttachmentsChange,
  onSend,
  sending = false,
}: TicketReplyBarProps) {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const uploading = hasUploadingAttachments(attachments);
  const uploadedCount = getUploadedAttachmentUrls(attachments).length;
  const canSend =
    (value.trim().length > 0 || uploadedCount > 0) &&
    !sending &&
    !uploading &&
    !hasFailedAttachments(attachments);

  async function handleAddAttachment() {
    if (sending || uploading) return;
    await pickAndUploadTicketAttachments(attachments, 5, onAttachmentsChange);
  }

  return (
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {attachments.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.attachmentRow}
          keyboardShouldPersistTaps="handled">
          {attachments.map((item) => (
            <View key={item.id} style={styles.thumbWrap}>
              <Image source={{ uri: item.uri }} style={styles.thumb} contentFit="cover" />

              {item.status === 'uploading' ? (
                <View style={styles.overlay}>
                  <ActivityIndicator size="small" color={palette.white} />
                </View>
              ) : null}

              {item.status === 'error' ? (
                <View style={styles.overlay}>
                  <SymbolView name="exclamationmark" size={14} tintColor={palette.white} />
                </View>
              ) : null}

              {item.status === 'uploaded' ? (
                <View style={styles.successBadge}>
                  <SymbolView name="checkmark" size={10} weight="bold" tintColor={palette.white} />
                </View>
              ) : null}

              <Pressable
                onPress={() =>
                  onAttachmentsChange(attachments.filter((attachment) => attachment.id !== item.id))
                }
                disabled={sending || item.status === 'uploading'}
                style={styles.removeButton}
                accessibilityRole="button"
                accessibilityLabel="Remove attachment"
                hitSlop={8}>
                <SymbolView name="xmark" size={10} weight="bold" tintColor={palette.white} />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.composerRow}>
        <Pressable
          onPress={handleAddAttachment}
          disabled={sending || uploading || attachments.length >= 5}
          style={[
            styles.attachButton,
            (sending || uploading || attachments.length >= 5) && styles.disabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Add attachment">
          {uploading ? (
            <ActivityIndicator size="small" color={palette.lime[700]} />
          ) : (
            <SymbolView name="paperclip" size={18} tintColor={palette.gray[700]} />
          )}
        </Pressable>

        <Pressable
          onPress={() => inputRef.current?.focus()}
          style={[styles.inputShell, focused && styles.inputShellFocused]}>
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChange}
            placeholder="Type your message here"
            placeholderTextColor={palette.gray[400]}
            style={styles.input}
            multiline
            maxLength={1000}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            editable={!sending}
          />
        </Pressable>

        <Pressable
          onPress={() => {
            if (!canSend) return;
            onSend();
          }}
          disabled={!canSend}
          style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Send message">
          {sending ? (
            <ActivityIndicator size="small" color={palette.lime[800]} />
          ) : (
            <SymbolView
              name="paperplane.fill"
              size={18}
              weight="semibold"
              tintColor={palette.lime[800]}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}

export function dismissTicketReplyKeyboard() {
  Keyboard.dismiss();
}

const styles = StyleSheet.create({
  footer: {
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: palette.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.gray[200],
    ...Platform.select({
      ios: {
        shadowColor: '#101828',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  attachmentRow: {
    gap: 8,
    paddingBottom: 2,
  },
  thumbWrap: {
    width: 56,
    height: 56,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    backgroundColor: palette.gray[100],
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16, 24, 40, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBadge: {
    position: 'absolute',
    left: 4,
    bottom: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: palette.lime[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(16, 24, 40, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  disabled: {
    opacity: 0.45,
  },
  inputShell: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: palette.gray[300],
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: palette.white,
    justifyContent: 'center',
  },
  inputShellFocused: {
    borderColor: palette.lime[400],
  },
  input: {
    fontSize: 16,
    lineHeight: 22,
    color: palette.textPrimary,
    padding: 0,
    maxHeight: 96,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.lime[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
});
