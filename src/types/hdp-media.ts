export type HdpHeroTabId = 'property-video' | 'moments' | 'photos';

export type HdpHeroSlide = {
  id: string;
  mediaType: 'image' | 'video';
  /** Preview image (photo URL or video thumbnail). */
  imageUri: string;
  /** Playback URL for videos. */
  mediaUrl?: string;
  label?: string;
};

export type HdpApiMediaItem = {
  id?: string | number;
  media_type?: string;
  url?: string;
  thumbnail_url?: string | null;
  tag?: string | null;
  is_srp?: boolean;
  is_hdp?: boolean;
  display_order?: number | null;
};
