import type { TenantInvoice } from '@/types/invoice';
import type { TenantProfile } from '@/types/tenant';

export const INVOICE_PAYMENT_INIT_API = 'api/hello/v2/payments/init';
export const INVOICE_PAYMENT_VERIFY_API = 'api/hello/v2/payments/verify_payment';

export function getInvoicePayableAmount(invoice: TenantInvoice) {
  return invoice.balance ?? invoice.total ?? 0;
}

export function getSelectedInvoicesTotal(invoices: TenantInvoice[]) {
  const total = invoices.reduce((sum, invoice) => sum + getInvoicePayableAmount(invoice), 0);
  return Math.round(total * 100) / 100;
}

export function buildInvoicePaymentPayload(
  invoices: TenantInvoice | TenantInvoice[],
  profile: TenantProfile,
) {
  const list = Array.isArray(invoices) ? invoices : [invoices];
  const amount = getSelectedInvoicesTotal(list);
  const paymentForIds = list.map((invoice) => invoice.invoice_id).filter(Boolean);

  return {
    customerId: list[0]?.customer_id,
    type: 'invoice',
    amount,
    paymentForIds,
    paymentMode: 'Razorpay',
    paymentMethod: 'Upi',
    isTenantApp: true,
    propertyName: profile.propertyInfo?.name,
  };
}

export function buildInvoicePaymentParams(
  invoices: TenantInvoice | TenantInvoice[],
  profile: TenantProfile,
) {
  const list = Array.isArray(invoices) ? invoices : [invoices];
  const amount = getSelectedInvoicesTotal(list);
  const paymentForIds = list.map((invoice) => invoice.invoice_id).filter(Boolean);

  return {
    type: 'invoice',
    paymentFor: paymentForIds.join(','),
    amount: String(amount),
    description: 'Invoice payment from tenant app',
    email: profile.userInfo?.email ?? '',
    mobile: profile.userInfo?.mobile ?? '',
    name: profile.userInfo?.name ?? '',
    propertyName: profile.propertyInfo?.name ?? '',
    initApi: INVOICE_PAYMENT_INIT_API,
    verifyApi: INVOICE_PAYMENT_VERIFY_API,
    payload: JSON.stringify(buildInvoicePaymentPayload(list, profile)),
  };
}
