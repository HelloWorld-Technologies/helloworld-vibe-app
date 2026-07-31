export type PropertyVisit = {
  id: string | number;
  crmVisitId?: string | number;
  crm_visit_id?: string | number;
  Crm_Visit_Id?: string | number;
  Building_Name?: string;
  building_name?: string;
  Locality?: string;
  locality?: string;
  Visit_Start_Time?: string;
  visit_start_time?: string;
  Visit_End_Time?: string;
  visit_end_time?: string;
  Sav_Location?: string;
  sav_location?: string;
  SAV_Meeting_Link?: string;
  sav_meeting_link?: string;
  Property_Id?: string | number;
  property_id?: string | number;
  Property_Manager_Name?: string;
  property_manager_name?: string;
  PM_Name?: string;
  PM_Phone?: string;
  pm_phone?: string;
  Status?: string;
  status?: string;
  Image_URL?: string;
  image_url?: string;
  Property_Images?: string[];
  property_images?: string[];
  [key: string]: unknown;
};

export type VisitTab = 'upcoming' | 'past';

export type VisitStatus = 'upcoming' | 'visited' | 'cancelled';

export type VisitSlotTime = {
  label: string;
  value: boolean;
};

export type VisitSlotDay = {
  date: string | number;
  slotId: string | number;
  slots?: VisitSlotTime[];
};

export type VisitSlotsResponse = {
  success: boolean;
  data?: VisitSlotDay[];
  message?: string;
  error?: string;
};

export type CreateVisitPayload = {
  date: string;
  savType: string;
  time: string;
  name: string;
  email: string;
  slotId: string | number;
  propertyId: string | number;
  source: string;
  url?: string;
};

export type CreateVisitResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export type VisitsPageInfo = {
  nextPage?: number | boolean | null;
  total?: number;
  count?: number;
  page?: number;
  pageSize?: number;
};

export type VisitsListParams = {
  type?: VisitTab;
  page?: number;
  perPage?: number;
};

export type VisitsListResult = {
  data: PropertyVisit[];
  pageInfo?: VisitsPageInfo;
};

export type RescheduleVisitPayload = {
  date: string;
  time: string;
  slotId: string | number;
};

export type VisitMutationResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export type VisitDateOption = {
  id: string;
  slotId?: string | number;
  dayLabel: string;
  dateLabel: string;
  date: Date;
};

export type VisitTimeSlot = {
  id: string;
  label: string;
  value: string;
  isAvailable?: boolean;
};

export type VisitContactDetails = {
  name: string;
  email: string;
};
