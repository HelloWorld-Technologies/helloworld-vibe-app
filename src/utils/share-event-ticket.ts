import type { RefObject } from 'react';
import { Platform, Share, type View } from 'react-native';

type CaptureModule = {
  captureRef: (
    ref: RefObject<View | null>,
    options?: {
      format?: 'png' | 'jpg' | 'webm' | 'raw';
      quality?: number;
      result?: 'tmpfile' | 'base64' | 'data-uri';
    },
  ) => Promise<string>;
};

type SharingModule = {
  isAvailableAsync: () => Promise<boolean>;
  shareAsync: (
    url: string,
    options?: {
      mimeType?: string;
      UTI?: string;
      dialogTitle?: string;
    },
  ) => Promise<void>;
};

function loadCaptureModule(): CaptureModule | null {
  try {
    // Native module only exists after a rebuild that includes react-native-view-shot.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-view-shot') as CaptureModule;
  } catch {
    return null;
  }
}

function loadSharingModule(): SharingModule | null {
  try {
    // Native module only exists after a rebuild that includes expo-sharing.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-sharing') as SharingModule;
  } catch {
    return null;
  }
}

export async function shareEventTicketImage(args: {
  ticketRef: RefObject<View | null>;
  eventName: string;
  venue?: string;
}) {
  const message = `I'm going to ${args.eventName} with HelloWorld Community!${
    args.venue ? `\n📍 ${args.venue}` : ''
  }`;

  const capture = loadCaptureModule();
  if (!capture || !args.ticketRef.current) {
    await Share.share({ message });
    return;
  }

  const uri = await capture.captureRef(args.ticketRef, {
    format: 'png',
    quality: 1,
    result: 'tmpfile',
  });

  const sharing = loadSharingModule();
  if (sharing && (await sharing.isAvailableAsync())) {
    await sharing.shareAsync(uri, {
      mimeType: 'image/png',
      UTI: 'public.png',
      dialogTitle: 'Share event ticket',
    });
    return;
  }

  await Share.share(
    Platform.OS === 'ios'
      ? { url: uri, message }
      : { message: `${message}\n${uri}` },
  );
}
