import type { TenantInvoice } from '@/types/invoice';
import type { TenantProfile } from '@/types/tenant';

export function priceFormatter(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDisplayName(value?: string | null) {
  if (!value?.trim()) return '';
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function toInvoiceDateString(value: unknown): string | undefined {
  if (value == null || value === '') return undefined;

  if (typeof value === 'number' && Number.isFinite(value)) {
    const ms = value < 1e12 ? value * 1000 : value;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }

  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return undefined;

  if (/^\d{10,13}$/.test(trimmed)) {
    const num = Number(trimmed);
    const ms = trimmed.length <= 10 ? num * 1000 : num;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? undefined : trimmed;
}

export function formatDisplayDate(value?: string) {
  const normalized = toInvoiceDateString(value);
  if (!normalized) return '—';
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value ?? '—';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatShortMonthYear(value?: string) {
  const normalized = toInvoiceDateString(value);
  if (!normalized) return '';
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value ?? '';
  return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }).replace("'", "'");
}

const PENDING_INVOICE_STATUSES = new Set([
  'sent',
  'overdue',
  'unpaid',
  'partially_paid',
  'partially paid',
  'viewed',
  'pending',
  'open',
  'due',
]);

function invoiceTimestamp(value?: string | null) {
  const normalized = toInvoiceDateString(value);
  if (!normalized) return 0;
  const ms = new Date(normalized).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

export function getInvoicePaidDate(
  invoice: Pick<TenantInvoice, 'last_payment_date' | 'paid_date' | 'due_date'>,
) {
  return invoice.last_payment_date ?? invoice.paid_date ?? invoice.due_date;
}

export function filterInvoices(invoices: TenantInvoice[]) {
  const pending = invoices
    .filter((invoice) => {
      const status = (invoice.status ?? '').replace(/[\s-]+/g, '_');
      if (PENDING_INVOICE_STATUSES.has(status) || PENDING_INVOICE_STATUSES.has(invoice.status ?? '')) {
        return true;
      }
      return (invoice.balance ?? 0) > 0 && status !== 'paid' && status !== 'void';
    })
    .sort((a, b) => invoiceTimestamp(a.due_date) - invoiceTimestamp(b.due_date));

  const paid = invoices
    .filter((invoice) => invoice.status === 'paid')
    .sort(
      (a, b) => invoiceTimestamp(getInvoicePaidDate(b)) - invoiceTimestamp(getInvoicePaidDate(a)),
    );

  return { pending, paid };
}

export function getDashboardRentDueDate(
  invoice?: TenantInvoice | null,
  profile?: TenantProfile | null,
) {
  const info = profile?.propertyInfo as
    | (TenantProfile['propertyInfo'] & Record<string, unknown>)
    | undefined;

  return (
    toInvoiceDateString(invoice?.due_date) ??
    toInvoiceDateString(invoice?.date) ??
    toInvoiceDateString(profile?.propertyInfo?.rentStartDate) ??
    toInvoiceDateString(info?.rent_start_date) ??
    toInvoiceDateString(profile?.propertyInfo?.moveInDate) ??
    toInvoiceDateString(info?.move_in_date)
  );
}

export function getInvoiceTitle(invoice: TenantInvoice) {
  return (
    invoice.title ??
    invoice.description ??
    invoice.invoice_number ??
    'Payment'
  );
}

export function getInvoiceDueLabel(invoice: TenantInvoice) {
  const normalized = toInvoiceDateString(invoice.due_date ?? invoice.date);
  const dueDate = normalized ? new Date(normalized) : null;
  if (!dueDate || Number.isNaN(dueDate.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: `Overdue by ${Math.abs(diffDays)}d`, tone: 'error' as const };
  }
  if (diffDays === 0) {
    return { label: 'Due today', tone: 'warning' as const };
  }
  return { label: `Due in ${diffDays}d`, tone: 'warning' as const };
}

export function isActiveTicket(status?: string) {
  const normalized = (status ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');

  if (!normalized) return true;
  return !['CLOSED', 'RESOLVED', 'SOLVED'].includes(normalized);
}
