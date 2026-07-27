import type { TenantInvoice } from '@/types/invoice';

export function priceFormatter(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDisplayDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatShortMonthYear(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }).replace("'", "'");
}

export function filterInvoices(invoices: TenantInvoice[]) {
  const pending = invoices.filter((invoice) =>
    ['sent', 'overdue', 'unpaid', 'partially_paid'].includes(invoice.status ?? ''),
  );
  const paid = invoices.filter((invoice) => invoice.status === 'paid');
  return { pending, paid };
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
  const dueDate = invoice.due_date ? new Date(invoice.due_date) : null;
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
