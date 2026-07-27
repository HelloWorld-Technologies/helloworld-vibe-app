import { http } from '@/api/http';
import type {
  CreateTicketParams,
  CreateTicketResult,
  SupportTicket,
  TicketCategory,
  TicketCategoryFaq,
  TicketConversation,
  TicketListParams,
  TicketListResult,
  TicketPageInfo,
} from '@/types/ticket';

function normalizeStatusParam(status?: string | string[]) {
  if (!status) return undefined;
  if (Array.isArray(status)) {
    const joined = status.map((item) => item.trim()).filter(Boolean).join(',');
    return joined || undefined;
  }
  const trimmed = status.trim();
  return trimmed || undefined;
}

function parseTicketsPayload(payload: unknown): SupportTicket[] {
  if (Array.isArray(payload)) return payload as SupportTicket[];
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.tickets)) return record.tickets as SupportTicket[];
    if (Array.isArray(record.data)) return record.data as SupportTicket[];
    if (Array.isArray(record.list)) return record.list as SupportTicket[];
  }
  return [];
}

function parsePageInfo(payload: unknown): TicketPageInfo | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const record = payload as Record<string, unknown>;
  const pageInfo = (record.pageInfo ?? record.pagination ?? record.meta) as
    | TicketPageInfo
    | undefined;
  if (pageInfo && typeof pageInfo === 'object') return pageInfo;
  return undefined;
}

function extractUploadedUrl(payload: unknown): string | undefined {
  if (typeof payload === 'string' && payload.startsWith('http')) return payload;
  if (!payload || typeof payload !== 'object') return undefined;

  const record = payload as Record<string, unknown>;
  const candidates = [
    record.url,
    record.fileUrl,
    record.file_url,
    record.attachment,
    record.attachmentUrl,
    record.data,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.startsWith('http')) return candidate;
    if (candidate && typeof candidate === 'object') {
      const nested = extractUploadedUrl(candidate);
      if (nested) return nested;
    }
  }

  if (Array.isArray(record.data)) {
    for (const item of record.data) {
      const nested = extractUploadedUrl(item);
      if (nested) return nested;
    }
  }

  return undefined;
}

export async function getSupportTickets(params: TicketListParams = {}): Promise<TicketListResult> {
  try {
    const status = normalizeStatusParam(params.status);
    const { data } = await http.get('api/hello/ticket/list/v2', {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        ...(status ? { status } : {}),
      },
    });

    const tickets = parseTicketsPayload(data?.data ?? data);
    return {
      success: data?.success !== false,
      data: tickets,
      pageInfo: parsePageInfo(data) ?? parsePageInfo(data?.data),
      message: data?.message,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tickets';
    return { success: false, data: null, message };
  }
}

export async function getTicketConversations(ticketId: string): Promise<{
  data: TicketConversation[] | null;
  success: boolean;
  message?: string;
}> {
  try {
    const { data } = await http.get('api/hello/ticket/list/conversations', {
      params: { ticketId },
    });
    const conversations = data?.data ?? data;
    return {
      success: true,
      data: Array.isArray(conversations) ? conversations : [],
      message: data?.message,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch conversations';
    return { success: false, data: null, message };
  }
}

export async function uploadTicketAttachment(file: {
  uri: string;
  name?: string;
  mimeType?: string;
}): Promise<{ success: boolean; url?: string; message?: string }> {
  try {
    const form = new FormData();
    form.append('file', {
      uri: file.uri,
      name: file.name ?? `attachment-${Date.now()}.jpg`,
      type: file.mimeType ?? 'image/jpeg',
    } as unknown as Blob);

    const { data } = await http.post('api/hello/ticket/upload_attachments', form, {
      timeout: 60_000,
      transformRequest: (requestData, headers) => {
        // Ensure RN sets the multipart boundary automatically.
        if (headers && typeof headers === 'object') {
          delete (headers as Record<string, unknown>)['Content-Type'];
        }
        return requestData;
      },
    });

    const url = extractUploadedUrl(data) ?? extractUploadedUrl(data?.data);
    return {
      success: data?.success !== false && Boolean(url),
      url,
      message: data?.message ?? data?.error,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload attachment';
    return { success: false, message };
  }
}

export async function uploadTicketAttachments(
  files: { uri: string; name?: string; mimeType?: string }[],
): Promise<{ success: boolean; urls: string[]; message?: string }> {
  const urls: string[] = [];

  for (const file of files) {
    const result = await uploadTicketAttachment(file);
    if (!result.success || !result.url) {
      return {
        success: false,
        urls,
        message: result.message ?? 'Failed to upload attachment',
      };
    }
    urls.push(result.url);
  }

  return { success: true, urls };
}

export async function postTicketComment(
  ticketId: string,
  comment: string,
  attachments: string[] = [],
): Promise<{ success: boolean; message?: string }> {
  try {
    const { data } = await http.put('api/hello/ticket/update', {
      ticketId,
      data: {
        comment,
        attachments,
      },
    });

    return {
      success: data?.success !== false,
      message: data?.message,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send message';
    return { success: false, message };
  }
}

export async function reopenSupportTicket(
  ticketId: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const { data } = await http.put('api/hello/ticket/update', {
      ticketId,
      status: 'OPEN',
    });
    return {
      success: data?.success !== false,
      message: data?.message,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reopen ticket';
    return { success: false, message };
  }
}

export async function getKbCategories(): Promise<{
  data: TicketCategory[];
  message?: string;
}> {
  try {
    const { data } = await http.get('api/hello/list/issues');
    const issues = data?.data ?? data;
    if (!Array.isArray(issues)) {
      return { data: [], message: data?.message };
    }

    const helloworldRoot = issues.find(
      (item: { permalink?: string }) => item.permalink === 'thehelloworld',
    );
    const categories = Array.isArray(helloworldRoot?.child) ? helloworldRoot.child : [];

    return { data: categories, message: data?.message };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch categories';
    return { data: [], message };
  }
}

export async function getCategoryDescription(categoryId: string): Promise<{
  data: TicketCategoryFaq[];
  message?: string;
}> {
  try {
    const { data } = await http.get('api/hello/list/issues/category', {
      params: { categoryId },
    });
    const faqs = data?.data ?? data;
    return {
      data: Array.isArray(faqs) ? faqs : [],
      message: data?.message,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch category help';
    return { data: [], message };
  }
}

export async function postCreateTicket(payload: CreateTicketParams): Promise<CreateTicketResult> {
  try {
    const { data } = await http.post('api/hello/ticket/create', {
      category: payload.category,
      subCategory: payload.subCategory,
      subject: payload.subject ?? payload.subCategory,
      description: payload.description,
      classification: '',
      email: payload.email,
      propertyName: payload.propertyName,
      city: payload.city,
      bookingId: payload.bookingId,
      propertyId: payload.propertyId,
      attachments: payload.attachments ?? [],
    });

    const ticketNumber =
      data?.data?.ticketNumber ??
      data?.data?.ticket_number ??
      data?.ticketNumber ??
      data?.ticket_number ??
      (data?.success !== false && typeof data?.message === 'string' && data.message.trim()
        ? data.message.trim()
        : undefined);

    return {
      success: data?.success !== false && Boolean(ticketNumber || data?.success),
      ticketNumber: ticketNumber ? String(ticketNumber) : undefined,
      message: data?.message ?? data?.error,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create ticket';
    return { success: false, message };
  }
}
