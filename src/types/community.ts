export type CommunityEventLocation = {
  lat?: number | string;
  long?: number | string;
  propertyName?: string;
  street?: string;
};

export type CommunityEventDetail = {
  id: number;
  name: string;
  description?: string;
  display_image?: string;
  event_start_date?: string;
  event_end_date?: string;
  start_date?: string;
  amount?: number;
  location?: CommunityEventLocation;
  people_attending?: number;
  attendees_count?: number;
  total_registration?: number;
  current_count?: number;
  female_count?: number;
  property_count?: number;
  hw_properties_count?: number;
  what_to_bring?: string;
  is_registered?: boolean;
};

export type CommunityEventDetailResponse = {
  details: CommunityEventDetail;
  paymentData?: {
    total: number;
  };
};

export type CommunityEvent = {
  id: number;
  name: string;
  city?: string;
  display_image?: string;
  start_date?: string;
  event_start_date?: string;
  attendees_count?: number;
  people_attending?: number;
  total_registration?: number;
  female_count?: number;
  is_registered?: boolean;
  registered?: boolean;
  /** Present on `/hello/event/registered` results — needed to cancel. */
  registrationId?: number;
};

export type EventListType = 'all' | 'previous' | 'upcoming';

export type EventPageInfo = {
  nextPage?: number | boolean | null;
  total?: number;
  count?: number;
  page?: number;
  pageSize?: number;
};

export type EventsListParams = {
  city?: string;
  type?: EventListType;
  page?: number;
  pageSize?: number;
};

export type EventsListResult = {
  success: boolean;
  data: CommunityEvent[];
  pageInfo?: EventPageInfo;
  message?: string;
};
