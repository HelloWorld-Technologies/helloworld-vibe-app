export type HdpMomentMediaType = 'image' | 'video';

export type HdpMomentItem = {
  id: string;
  label: string;
  imageUri: string;
  mediaType: HdpMomentMediaType;
  mediaUrl?: string;
  propertyId?: number;
  /** @deprecated Moments are media, not events — kept optional for safety */
  eventId?: number;
};

/** Moment payload from `GET v2/hello/house` → `moments` or `GET /moments`. */
export type HdpApiMoment = {
  id?: string | number;
  property_id?: number;
  media_type?: string;
  url?: string;
  thumbnail_url?: string | null;
  caption?: string | null;
  tags?: string[] | null;
  display_order?: number | null;
};

export type HdpApiEvent = {
  id?: number;
  name?: string;
  display_image?: string;
  event_start_date?: string;
};

export type MomentsMediaType = 'video' | 'image';

export type MomentsPagination = {
  page: number;
  pageSize: number;
  total: number;
};

export type MomentsListResponse = {
  success: boolean;
  data: HdpMomentItem[];
  pagination?: MomentsPagination;
};
