import { useRouter } from 'expo-router';

import type { TenantInvoice } from '@/types/invoice';
import { buildInvoicePaymentParams } from '@/utils/invoice-payment';
import { useTenantProfile } from '@/stores/tenant-store';

export function useInvoicePayment() {
  const router = useRouter();
  const profile = useTenantProfile();

  function payInvoice(invoice: TenantInvoice) {
    if (!profile) return;
    router.push({
      pathname: '/complete-payment',
      params: buildInvoicePaymentParams(invoice, profile),
    });
  }

  function payInvoices(invoices: TenantInvoice[]) {
    if (!profile || invoices.length === 0) return;
    router.push({
      pathname: '/complete-payment',
      params: buildInvoicePaymentParams(invoices, profile),
    });
  }

  return { payInvoice, payInvoices };
}
