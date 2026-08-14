import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { uploadTicketAttachment } from '@/api/tickets';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { PendingTicketAttachment } from '@/types/ticket';

type TicketAttachmentsFieldProps = {
  attachments: PendingTicketAttachment[];
  onChange: (attachments: PendingTicketAttachment[]) => void;
  maxCount?: number;
  disabled?: boolean;
};

function createAttachmentId() {
  return `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getUploadedAttachmentUrls(attachments: PendingTicketAttachment[]) {
  return attachments
    .filter((item) => item.status === 'uploaded' && Boolean(item.url))
    .map((item) => item.url as string);
}

export function hasUploadingAttachments(attachments: PendingTicketAttachment[]) {
  return attachments.some((item) => item.status === 'uploading');
}

export function hasFailedAttachments(attachments: PendingTicketAttachment[]) {
  return attachments.some((item) => item.status === 'error');
}

async function pickLocalAttachments(
  currentCount: number,
  maxCount = 5,
): Promise<Omit<PendingTicketAttachment, 'status'>[]> {
  const remaining = Math.max(maxCount - currentCount, 0);
  if (remaining <= 0) {
    Alert.alert('Limit reached', `You can attach up to ${maxCount} files.`);
    return [];
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Permission needed', 'Allow photo access to attach images to your ticket.');
    return [];
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: remaining,
    quality: 0.8,
  });

  if (result.canceled || !result.assets?.length) return [];

  return result.assets.map((asset, index) => ({
    id: `${createAttachmentId()}-${index}`,
    uri: asset.uri,
    name: asset.fileName ?? `attachment-${Date.now()}-${index}.jpg`,
    mimeType: asset.mimeType ?? 'image/jpeg',
  }));
}

async function uploadPickedAttachment(
  item: Omit<PendingTicketAttachment, 'status'> | PendingTicketAttachment,
): Promise<PendingTicketAttachment> {
  const result = await uploadTicketAttachment({
    uri: item.uri,
    name: item.name,
    mimeType: item.mimeType,
  });

  if (!result.success || !result.url) {
    return {
      id: item.id,
      uri: item.uri,
      name: item.name,
      mimeType: item.mimeType,
      status: 'error',
      error: result.message ?? 'Upload failed',
    };
  }

  return {
    id: item.id,
    uri: item.uri,
    name: item.name,
    mimeType: item.mimeType,
    status: 'uploaded',
    url: result.url,
  };
}

/** Pick images and upload each one immediately, updating parent state as each finishes. */
export async function pickAndUploadTicketAttachments(
  current: PendingTicketAttachment[],
  maxCount: number,
  onChange: (attachments: PendingTicketAttachment[]) => void,
): Promise<void> {
  const picked = await pickLocalAttachments(current.length, maxCount);
  if (!picked.length) return;

  const pending = picked.map((item) => ({
    ...item,
    status: 'uploading' as const,
  }));
  let next = [...current, ...pending].slice(0, maxCount);
  onChange(next);

  for (const item of pending) {
    const uploaded = await uploadPickedAttachment(item);
    next = next.map((attachment) => (attachment.id === item.id ? uploaded : attachment));
    onChange(next);
  }
}

export function TicketAttachmentsField({
  attachments,
  onChange,
  maxCount = 5,
  disabled = false,
}: TicketAttachmentsFieldProps) {
  const uploading = hasUploadingAttachments(attachments);
  const busy = disabled || uploading;

  async function handleAdd() {
    if (busy) return;
    await pickAndUploadTicketAttachments(attachments, maxCount, onChange);
  }

  function handleRemove(id: string) {
    onChange(attachments.filter((item) => item.id !== id));
  }

  async function handleRetry(item: PendingTicketAttachment) {
    if (disabled || item.status === 'uploading') return;

    let next = attachments.map((attachment) =>
      attachment.id === item.id
        ? { ...attachment, status: 'uploading' as const, error: undefined, url: undefined }
        : attachment,
    );
    onChange(next);

    const uploaded = await uploadPickedAttachment(item);
    next = next.map((attachment) => (attachment.id === item.id ? uploaded : attachment));
    onChange(next);
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Typography variant="text" size="sm" weight="medium" color={palette.gray[800]}>
          Attachments
        </Typography>
        <Typography variant="label" size="xs" color={palette.gray[500]}>
          {attachments.length}/{maxCount}
        </Typography>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        keyboardShouldPersistTaps="handled">
        <Pressable
          onPress={handleAdd}
          disabled={busy || attachments.length >= maxCount}
          style={[
            styles.addButton,
            (busy || attachments.length >= maxCount) && styles.addButtonDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Add attachment">
          {uploading ? (
            <ActivityIndicator size="small" color={palette.lime[700]} />
          ) : (
            <>
              <HwSymbol name="paperclip" size={18} tintColor={palette.gray[700]} />
              <Typography variant="label" size="xs" color={palette.gray[700]}>
                Add
              </Typography>
            </>
          )}
        </Pressable>

        {attachments.map((item) => (
          <View
            key={item.id}
            style={[styles.thumbWrap, item.status === 'error' && styles.thumbWrapError]}>
            <Image source={{ uri: item.uri }} style={styles.thumb} contentFit="cover" />

            {item.status === 'uploading' ? (
              <View style={styles.overlay}>
                <ActivityIndicator size="small" color={palette.white} />
              </View>
            ) : null}

            {item.status === 'error' ? (
              <Pressable
                onPress={() => void handleRetry(item)}
                style={[styles.overlay, styles.errorOverlay]}
                accessibilityRole="button"
                accessibilityLabel="Retry upload"
                disabled={disabled}>
                <HwSymbol name="arrow.clockwise" size={16} tintColor={palette.white} />
                <Typography variant="label" size="xs" weight="bold" color={palette.white}>
                  Retry
                </Typography>
              </Pressable>
            ) : null}

            {item.status === 'uploaded' ? (
              <View style={styles.successBadge}>
                <HwSymbol name="checkmark" size={10} weight="bold" tintColor={palette.white} />
              </View>
            ) : null}

            <Pressable
              onPress={() => handleRemove(item.id)}
              disabled={item.status === 'uploading'}
              style={styles.removeButton}
              accessibilityRole="button"
              accessibilityLabel="Remove attachment"
              hitSlop={8}>
              <HwSymbol name="xmark" size={10} weight="bold" tintColor={palette.white} />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addButton: {
    width: 72,
    height: 72,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: palette.gray[300],
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: palette.white,
  },
  addButtonDisabled: {
    opacity: 0.45,
  },
  thumbWrap: {
    width: 72,
    height: 72,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    backgroundColor: palette.gray[100],
  },
  thumbWrapError: {
    borderWidth: 1.5,
    borderColor: palette.red[500],
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
    gap: 2,
  },
  errorOverlay: {
    backgroundColor: 'rgba(180, 35, 24, 0.72)',
  },
  successBadge: {
    position: 'absolute',
    left: 4,
    bottom: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: palette.lime[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 24, 40, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});
