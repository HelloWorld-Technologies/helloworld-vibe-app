export type SupportTicket = {
  id: string;
  ticket_number?: string | number;
  subject?: string;
  status?: string;
  createdTime?: string;
  created_at?: string;
  [key: string]: unknown;
};

export type TicketConversation = {
  id: string;
  summary: string;
  createdTime: string;
  visibility: string;
  status: string;
  type: string;
  author: {
    type: string;
  };
  attachments?: string[];
};

export type SupportIssueCategory = {
  id: string | number;
  name: string;
  icon?: string;
};

export type TicketCategoryChild = {
  name: string;
  id: string;
  isVisibleInHC?: boolean;
};

export type TicketCategory = {
  name: string;
  visibility: string;
  child: TicketCategoryChild[];
  isVisibleInHC?: boolean;
};

export type TicketCategoryFaq = {
  title: string;
  summary: string;
  status?: string;
};

export type TicketListParams = {
  page?: number;
  pageSize?: number;
  /** Comma-separated or array of OPEN | CLOSED | INPROGRESS | ESCALATED_TO_MANAGER | AWAITING_CUSTOMER_RESPONSE */
  status?: string | string[];
};

export type TicketPageInfo = {
  count?: number;
  total?: number;
  nextPage?: number | boolean | null;
  page?: number;
  pageSize?: number;
};

export type TicketListResult = {
  data: SupportTicket[] | null;
  pageInfo?: TicketPageInfo;
  message?: string;
  success?: boolean;
};

export type PendingTicketAttachment = {
  id: string;
  uri: string;
  name: string;
  mimeType: string;
  status: 'uploading' | 'uploaded' | 'error';
  url?: string;
  error?: string;
};

export type CreateTicketParams = {
  category: string;
  subCategory: string;
  subCategoryId?: string;
  description: string;
  email: string;
  propertyName?: string;
  city?: string;
  bookingId?: string;
  propertyId?: string;
  attachments?: string[];
  subject?: string;
};

export type CreateTicketResult = {
  success: boolean;
  ticketNumber?: string;
  message?: string;
};

export type UpdateTicketParams = {
  ticketId: string;
  comment?: string;
  attachments?: string[];
  status?: string;
};

/** Statuses treated as open / in-progress for the Active tab. */
export const ACTIVE_TICKET_STATUSES = [
  'OPEN',
  'INPROGRESS',
  'ESCALATED_TO_MANAGER',
  'AWAITING_CUSTOMER_RESPONSE',
] as const;

export const RESOLVED_TICKET_STATUSES = ['CLOSED'] as const;
