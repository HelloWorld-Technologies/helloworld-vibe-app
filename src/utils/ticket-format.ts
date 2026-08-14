import type { TicketConversation } from '@/types/ticket';

export type TicketAttachmentKind = 'image' | 'video' | 'file';

const IMAGE_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'heic',
  'heif',
  'bmp',
  'tif',
  'tiff',
]);

const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'm4v', 'webm', 'avi', 'mkv', '3gp']);

export function getTicketMessageText(summary?: string) {
  return summary?.split('----')[0]?.trim() ?? '';
}

export function getAttachmentFileName(url: string) {
  try {
    const path = decodeURIComponent(new URL(url).pathname);
    const name = path.split('/').filter(Boolean).pop();
    return name || 'Attachment';
  } catch {
    const fallback = url.split('?')[0]?.split('/').filter(Boolean).pop();
    return fallback ? decodeURIComponent(fallback) : 'Attachment';
  }
}

export function getAttachmentExtension(url: string) {
  const name = getAttachmentFileName(url);
  const dot = name.lastIndexOf('.');
  if (dot < 0) return '';
  return name.slice(dot + 1).toLowerCase();
}

export function getTicketAttachmentKind(url: string): TicketAttachmentKind {
  const extension = getAttachmentExtension(url);
  if (IMAGE_EXTENSIONS.has(extension)) return 'image';
  if (VIDEO_EXTENSIONS.has(extension)) return 'video';
  return 'file';
}

export function formatTicketMessageTime(value: string, isSupport = false) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  if (isSupport) {
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function getVisibleConversations(conversations: TicketConversation[]) {
  return [...conversations]
    .filter(
      (item) =>
        item.visibility === 'public' &&
        item.status === 'SUCCESS' &&
        item.type !== 'comment' &&
        (Boolean(getTicketMessageText(item.summary)) ||
          (Array.isArray(item.attachments) && item.attachments.length > 0)),
    )
    .sort(
      (left, right) =>
        new Date(left.createdTime).getTime() - new Date(right.createdTime).getTime(),
    );
}
