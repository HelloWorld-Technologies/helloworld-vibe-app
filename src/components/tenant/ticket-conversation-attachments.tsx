import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HwSymbol } from '@/components/ui/hw-symbol';
import { HwVideoPlayer } from '@/components/ui/hw-video-player';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import {
  getAttachmentFileName,
  getTicketAttachmentKind,
  type TicketAttachmentKind,
} from '@/utils/ticket-format';

type TicketConversationAttachmentsProps = {
  urls: string[];
  tone: 'user' | 'support';
  spaced?: boolean;
};

type FullscreenMedia = {
  url: string;
  kind: 'image' | 'video';
};

export function TicketConversationAttachments({
  urls,
  tone,
  spaced = false,
}: TicketConversationAttachmentsProps) {
  const [fullscreen, setFullscreen] = useState<FullscreenMedia | null>(null);
  const attachments = urls.filter((url) => typeof url === 'string' && url.length > 0);

  if (attachments.length === 0) return null;

  async function openExternal(url: string) {
    try {
      await Linking.openURL(url);
    } catch {
      // Ignore — nothing useful to surface in-thread.
    }
  }

  function handlePress(url: string, kind: TicketAttachmentKind) {
    if (kind === 'image' || kind === 'video') {
      setFullscreen({ url, kind });
      return;
    }
    void openExternal(url);
  }

  return (
    <>
      <View style={[styles.list, spaced && styles.listSpaced]}>
        {attachments.map((url) => {
          const kind = getTicketAttachmentKind(url);
          const fileName = getAttachmentFileName(url);

          if (kind === 'file') {
            return (
              <Pressable
                key={url}
                onPress={() => handlePress(url, kind)}
                style={[styles.fileChip, tone === 'support' ? styles.fileChipSupport : null]}
                accessibilityRole="link"
                accessibilityLabel={`Open attachment ${fileName}`}>
                <HwSymbol
                  name="doc.text.fill"
                  size={16}
                  tintColor={tone === 'support' ? palette.white : palette.gray[700]}
                />
                <Typography
                  variant="text"
                  size="xs"
                  color={tone === 'support' ? palette.white : palette.gray[800]}
                  numberOfLines={1}
                  style={styles.fileName}>
                  {fileName}
                </Typography>
                <HwSymbol
                  name="arrow.up.right"
                  size={12}
                  tintColor={tone === 'support' ? palette.white : palette.gray[500]}
                />
              </Pressable>
            );
          }

          return (
            <Pressable
              key={url}
              onPress={() => handlePress(url, kind)}
              style={styles.mediaThumb}
              accessibilityRole="button"
              accessibilityLabel={
                kind === 'video' ? `Play video ${fileName}` : `View image ${fileName}`
              }>
              {kind === 'image' ? (
                <Image source={{ uri: url }} style={styles.thumbImage} contentFit="cover" />
              ) : (
                <View style={styles.videoThumb}>
                  <HwSymbol name="video.fill" size={16} tintColor={palette.white} />
                  <Typography variant="label" size="xs" color={palette.white} numberOfLines={1}>
                    {fileName}
                  </Typography>
                </View>
              )}
              {kind === 'video' ? (
                <View style={styles.playBadge}>
                  <HwSymbol name="play.fill" size={12} tintColor={palette.white} />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <TicketAttachmentFullscreen
        media={fullscreen}
        onClose={() => setFullscreen(null)}
      />
    </>
  );
}

function TicketAttachmentFullscreen({
  media,
  onClose,
}: {
  media: FullscreenMedia | null;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  if (!media) return null;

  const contentHeight = height - insets.top - insets.bottom - 56;

  return (
    <Modal
      visible
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
      statusBarTranslucent>
      <StatusBar style="light" />
      <View style={[styles.fullscreenRoot, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.fullscreenHeader}>
          <Typography
            variant="text"
            size="sm"
            color={palette.gray[300]}
            numberOfLines={1}
            style={styles.fullscreenTitle}>
            {getAttachmentFileName(media.url)}
          </Typography>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close attachment">
            <HwSymbol name="xmark" size={18} weight="semibold" tintColor={palette.white} />
          </Pressable>
        </View>

        <View style={[styles.fullscreenBody, { width, height: contentHeight }]}>
          {media.kind === 'image' ? (
            <Image
              source={{ uri: media.url }}
              style={styles.fullscreenMedia}
              contentFit="contain"
            />
          ) : (
            <HwVideoPlayer
              uri={media.url}
              playing
              muted={false}
              loop={false}
              contentFit="contain"
              style={styles.fullscreenMedia}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  listSpaced: {
    marginTop: 8,
  },
  mediaThumb: {
    width: 112,
    height: 80,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    backgroundColor: palette.gray[800],
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  videoThumb: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
    backgroundColor: palette.gray[800],
  },
  playBadge: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: 200,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    backgroundColor: palette.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.gray[200],
  },
  fileChipSupport: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderColor: 'transparent',
  },
  fileName: {
    flex: 1,
  },
  fullscreenRoot: {
    flex: 1,
    backgroundColor: palette.black,
  },
  fullscreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  fullscreenTitle: {
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenBody: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenMedia: {
    width: '100%',
    height: '100%',
  },
});
