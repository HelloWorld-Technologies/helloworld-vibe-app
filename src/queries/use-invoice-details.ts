import { useQuery } from '@tanstack/react-query';

import { getInvoiceLineItems } from '@/api/invoice';

export function useInvoiceDetails(invoiceId: string) {
  return useQuery({
    queryKey: ['invoice-details', invoiceId],
    queryFn: async () => {
      const response = await getInvoiceLineItems(invoiceId);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Unable to load invoice');
      }
      return response.data;
    },
    enabled: invoiceId.length > 0,
  });
}
