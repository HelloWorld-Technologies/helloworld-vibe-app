import { http } from '@/api/http';
import type {
  InvoiceDetails,
  InvoiceDetailsResponse,
  InvoiceLineItem,
  InvoiceLineItemTax,
  TenantInvoice,
} from '@/types/invoice';

export async function getTenantInvoices(): Promise<TenantInvoice[]> {
  const { data } = await http.get('api/hello/invoices/get');
  const invoiceList =
    data?.invoiceList ?? data?.data?.invoiceList ?? data?.data ?? data ?? [];

  if (Array.isArray(invoiceList)) {
    return invoiceList;
  }

  if (invoiceList && typeof invoiceList === 'object') {
    const list = invoiceList.list ?? invoiceList.invoices ?? [];
    return Array.isArray(list) ? list : [];
  }

  return [];
}

function normalizeTaxes(raw: unknown): InvoiceLineItemTax[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is InvoiceLineItemTax => !!item && typeof item === 'object',
  );
}

function normalizeLineItems(raw: unknown): InvoiceLineItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is InvoiceLineItem => !!item && typeof item === 'object')
    .map((item) => ({
      ...item,
      line_item_taxes: normalizeTaxes(
        item.line_item_taxes ?? item.lineItemTaxes ?? item.taxes ?? [],
      ),
    }));
}

function normalizeInvoiceDetails(payload: unknown, invoiceId: string): InvoiceDetails | null {
  if (!payload || typeof payload !== 'object') return null;

  const record = payload as Record<string, unknown>;
  const nested =
    record.data && typeof record.data === 'object'
      ? (record.data as Record<string, unknown>)
      : record;

  const lineItems = normalizeLineItems(
    nested.line_items ?? nested.lineItems ?? nested.items ?? [],
  );
  const taxes = normalizeTaxes(nested.taxes ?? nested.tax_summary ?? []);
  const lineItemTaxes = normalizeTaxes(
    nested.line_item_taxes ?? nested.lineItemTaxes ?? [],
  );

  return {
    invoice_id: String(nested.invoice_id ?? nested.invoiceId ?? invoiceId),
    invoice_number:
      (nested.invoice_number as string | null | undefined) ??
      (nested.invoiceNumber as string | null | undefined) ??
      null,
    invoice_url:
      (nested.invoice_url as string | null | undefined) ??
      (nested.invoiceUrl as string | null | undefined) ??
      null,
    status: (nested.status as string | null | undefined) ?? null,
    date: (nested.date as string | null | undefined) ?? null,
    due_date:
      (nested.due_date as string | null | undefined) ??
      (nested.dueDate as string | null | undefined) ??
      null,
    created_time: (nested.created_time as string | null | undefined) ?? null,
    last_modified_time: (nested.last_modified_time as string | null | undefined) ?? null,
    customer_id: (nested.customer_id as string | null | undefined) ?? null,
    customer_name: (nested.customer_name as string | null | undefined) ?? null,
    reference_number: (nested.reference_number as string | null | undefined) ?? null,
    payment_terms: (nested.payment_terms as number | null | undefined) ?? null,
    payment_terms_label: (nested.payment_terms_label as string | null | undefined) ?? null,
    currency_code: (nested.currency_code as string | null | undefined) ?? null,
    sub_total: (nested.sub_total as number | null | undefined) ?? null,
    tax_total: (nested.tax_total as number | null | undefined) ?? null,
    total: (nested.total as number | null | undefined) ?? null,
    payment_made: (nested.payment_made as number | null | undefined) ?? null,
    credits_applied: (nested.credits_applied as number | null | undefined) ?? null,
    balance: (nested.balance as number | null | undefined) ?? null,
    notes: (nested.notes as string | null | undefined) ?? null,
    terms: (nested.terms as string | null | undefined) ?? null,
    line_items: lineItems,
    taxes,
    line_item_taxes: lineItemTaxes,
  };
}

export async function getInvoiceLineItems(
  invoiceId: string,
): Promise<InvoiceDetailsResponse> {
  try {
    const { data } = await http.get<InvoiceDetailsResponse | InvoiceDetails>(
      `api/hello/invoices/line-items/${encodeURIComponent(invoiceId)}`,
    );

    if (data && typeof data === 'object' && 'success' in data && data.success === false) {
      return {
        success: false,
        message: (data as InvoiceDetailsResponse).message || 'Unable to load invoice',
        status: (data as InvoiceDetailsResponse).status,
      };
    }

    const details = normalizeInvoiceDetails(data, invoiceId);
    if (!details) {
      return { success: false, message: 'Unable to load invoice' };
    }

    return { success: true, data: details };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load invoice';
    return { success: false, message };
  }
}
